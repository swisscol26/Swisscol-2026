const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

class Elemento {
    constructor() { this.children = []; this.listeners = {}; this.attributes = {}; this.open = false;
        this.value = ''; this.disabled = false; this.hidden = false; this.text = '';
        this.classes = new Set(); this.classList = {
            add: x => this.classes.add(x), remove: x => this.classes.delete(x),
            toggle: (x, yes) => yes ? this.classes.add(x) : this.classes.delete(x)
        };
    }
    set textContent(value) { this.text = String(value); this.children = []; }
    get textContent() { return this.text + this.children.map(x => x.textContent).join(' '); }
    append(...elements) { this.children.push(...elements); }
    appendChild(element) { this.append(element); }
    replaceChildren(...elements) { this.text = ''; this.children = elements; }
    setAttribute(key, value) { this.attributes[key] = value; }
    addEventListener(type, listener) { (this.listeners[type] ??= []).push(listener); }
    dispatchEvent(event) { return Promise.all((this.listeners[event.type] || []).map(fn => fn(event))); }
    showModal() { this.open = true; }
    close() { this.open = false; return this.dispatchEvent({ type: 'close' }); }
    focus() {}
}
function entorno(archivo, fetch) {
    const elements = new Map();
    const document = new Elemento();
    document.getElementById = id => {
        if (!elements.has(id)) elements.set(id, new Elemento());
        return elements.get(id);
    };
    document.createElement = () => new Elemento();
    const window = new Elemento(); window.location = { hostname: '127.0.0.1' };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../js/config.js'), 'utf8'), { window });
    const context = vm.createContext({ document, window, fetch, console,
        AbortController, AbortSignal, Event, Intl, setTimeout: () => 1, clearTimeout() {}, setInterval() {} });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', archivo), 'utf8'), context);
    return { context, document, el: id => document.getElementById(id) };
}
const ok = body => ({ ok: true, status: 200, json: async () => body });
const fallo = { ok: false, status: 503, json: async () => ({}) };
const pedido = { pedidoId: 42, estado: 'PENDIENTE_PAGO', fecha: '2026-10-12',
    total: 100000.75, costoEnvio: 5500, venceReserva: '2026-10-13T15:00:00', productos: [] };
const flush = () => new Promise(resolve => setImmediate(resolve));
function botones(element) { return element.children.flatMap(child => [child, ...botones(child)]); }

test('El historial aparece aunque la configuración tarde o falle', async () => {
    let rechazar;
    const pendiente = new Promise((_, reject) => { rechazar = reject; });
    const e = entorno('historial.js', url => url.endsWith('mis-pedidos') ? Promise.resolve(ok([pedido])) : pendiente);
    await e.context.cargarPedidos();
    assert.match(e.el('listaPedidos').textContent, /Pedido #42/);
    assert.match(e.el('listaPedidos').textContent, /Cargando datos de pago/);
    rechazar(new Error('Sin conexión'));
    await flush();
    assert.match(e.el('listaPedidos').textContent, /Temporalmente no se pudieron cargar/);
    assert.match(e.el('listaPedidos').textContent, /Ya realicé el pago/);
});

test('Configuración con HTTP 503 o datos incompletos no oculta pedidos', async () => {
    for (const response of [fallo, ok({})]) {
        const e = entorno('historial.js', async url => url.endsWith('mis-pedidos') ? ok([pedido]) : response);
        await e.context.cargarPedidos(); await flush();
        assert.match(e.el('listaPedidos').textContent, /Pedido #42/);
        assert.match(e.el('listaPedidos').textContent, /Temporalmente/);
    }
});

test('Pago muestra total exacto, plazo y datos como texto; reporta la referencia escrita', async () => {
    let reportado = false, body;
    const e = entorno('historial.js', async (url, options) => {
        if (url.endsWith('reportar-pago')) { body = JSON.parse(options.body); reportado = true; return ok({ exito: true }); }
        if (url.endsWith('mis-pedidos')) return ok([{ ...pedido, estado: reportado ? 'PAGO_POR_VERIFICAR' : pedido.estado,
            referenciaPago: body?.referenciaPago, pagoReportadoEn: '2026-10-12T15:00:00' }]);
        return ok({ metodo: 'Nequi', numero: 'numero-prueba', titular: '<b>Titular</b>', moneda: 'COP', plazoHoras: 24 });
    });
    await e.context.cargarPedidos(); await flush();
    assert.match(e.el('listaPedidos').textContent, /105[.]500,75/);
    assert.match(e.el('listaPedidos').textContent, /24 horas desde la aprobación/);
    assert.ok(e.el('listaPedidos').textContent.includes('<b>Titular</b>'));
    const referencia = new Elemento(); referencia.value = '  REF-PRUEBA-42  ';
    const boton = new Elemento(), mensaje = new Elemento();
    await e.context.reportarPago(42, referencia, boton, mensaje);
    assert.deepEqual(body, { pedidoId: 42, referenciaPago: 'REF-PRUEBA-42' });
    assert.match(e.el('listaPedidos').textContent, /PAGO_POR_VERIFICAR/);
    assert.match(e.el('listaPedidos').textContent, /REF-PRUEBA-42/);
});

test('Badge carga al recargar, abrir, marcar y cerrar; desaparece al leer todo', async () => {
    let items = [1, 2].map(id => ({ notificacionId: id, leida: false, mensaje: 'Pedido', fecha: '2026-10-12' }));
    let liberarMarca;
    const e = entorno('notificaciones.js', async (url, options) => {
        if (url.endsWith('/leida')) {
            await new Promise(resolve => { liberarMarca = resolve; });
            const id = JSON.parse(options.body).notificacionId;
            items = items.map(item => ({ ...item, leida: item.leida || item.notificacionId === id }));
        }
        return ok(items);
    });
    await e.document.dispatchEvent({ type: 'DOMContentLoaded' }); await flush();
    assert.equal(e.el('contador-notificaciones').textContent, '2');
    assert.equal(e.el('contador-notificaciones').hidden, false);
    await e.el('btnNotificaciones').dispatchEvent({ type: 'click' }); await flush();
    let boton = botones(e.el('listaNotificaciones')).find(x => x.textContent === 'Marcar como leída');
    const marca = boton.dispatchEvent({ type: 'click' });
    await e.el('dialogNotificaciones').close(); liberarMarca(); await marca; await flush();
    assert.equal(e.el('contador-notificaciones').textContent, '1');
    await e.el('btnNotificaciones').dispatchEvent({ type: 'click' }); await flush();
    boton = botones(e.el('listaNotificaciones')).find(x => x.textContent === 'Marcar como leída');
    const ultima = boton.dispatchEvent({ type: 'click' }); liberarMarca(); await ultima; await flush();
    assert.equal(e.el('contador-notificaciones').hidden, true);
});

test('Logout invalida consultas anteriores y login vuelve a consultar', async () => {
    let resolver, consultas = 0;
    const e = entorno('notificaciones.js', async () => {
        consultas++;
        if (consultas === 1) return new Promise(resolve => { resolver = resolve; });
        return ok([{ leida: false }]);
    });
    await e.document.dispatchEvent({ type: 'DOMContentLoaded' });
    await e.document.dispatchEvent({ type: 'swisscol:sesion', detail: { activa: false } });
    resolver(ok([{ leida: false }, { leida: false }])); await flush();
    assert.equal(e.el('contador-notificaciones').hidden, true);
    await e.document.dispatchEvent({ type: 'swisscol:sesion', detail: { activa: true } }); await flush();
    assert.equal(e.el('contador-notificaciones').textContent, '1');
    assert.equal(e.el('contador-notificaciones').hidden, false);
});
