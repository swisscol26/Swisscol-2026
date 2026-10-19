const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function entorno() {
    const elementos = new Map();
    function elemento(id) {
        if (elementos.has(id)) return elementos.get(id);
        const clases = new Set();
        const e = { id, style: {}, listeners: {}, open: false, textContent: '', value: '',
            classList: {add:x=>clases.add(x),remove:x=>clases.delete(x),contains:x=>clases.has(x)},
            setAttribute(){}, before(){}, after(){}, appendChild(){}, append(){}, focus(){}, reset(){},
            replaceChildren(){}, contains(){return false}, reportValidity(){return true},
            addEventListener(event,fn){this.listeners[event]=fn},
            showModal(){this.open=true}, close(){this.open=false},
            querySelector(){return elemento(id+'-input')}, querySelectorAll(){return []}
        };
        elementos.set(id,e); return e;
    }
    let estado=401; const peticiones=[]; const datos=new Map([['carrito','conservar']]);
    const contexto=vm.createContext({console,AbortSignal,CustomEvent:class {},
        window:{SWISSCOL_API_BASE:'/api'},
        document:{getElementById:elemento,createComment:()=>elemento('comentario'),createElement:t=>elemento(t),
            body:elemento('body'),addEventListener(){},dispatchEvent(){},querySelectorAll(){return []}},
        localStorage:{getItem:k=>datos.get(k)||null,setItem:(k,v)=>datos.set(k,v),removeItem:k=>datos.delete(k)},
        carrito:[{id:1,cantidad:1}],alert(){},
        fetch:async url=>{peticiones.push(url);return {ok:estado===200,status:estado,json:async()=>({usuarioId:1})}}
    });
    for(const nombre of ['auth','historial']) vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/'+nombre+'.js'),'utf8'),contexto);
    return {elemento,datos,peticiones,contexto,estado:n=>estado=n};
}

test('visitante abre login, conserva carrito y no abre envío',async()=>{
    const e=entorno(); await new Promise(setImmediate);
    await e.elemento('btnFinalizarCompra').listeners.click();
    assert.equal(e.elemento('dialog').open,true);
    assert.equal(e.elemento('dialogEnvio').open,false);
    assert.equal(e.datos.get('carrito'),'conservar');
    assert.match(e.elemento('mensajeRecuperacion').textContent,/crear una cuenta/);
});
test('sesión del servidor permite abrir envío aunque no haya perfil local',async()=>{
    const e=entorno();await new Promise(setImmediate); e.estado(200);
    await e.elemento('btnFinalizarCompra').listeners.click();
    assert.equal(e.elemento('dialogEnvio').open,true);
});
test('fallo al comprobar sesión no permite continuar',async()=>{
    const e=entorno();await new Promise(setImmediate);e.estado(500);
    await e.elemento('btnFinalizarCompra').listeners.click();
    assert.equal(e.elemento('dialogEnvio').open,false);
    assert.equal(e.elemento('btnFinalizarCompra').disabled,false);
});
test('sesión perdida después de abrir envío impide enviar pedido',async()=>{
    const e=entorno();await new Promise(setImmediate);e.estado(200);
    await e.elemento('btnFinalizarCompra').listeners.click();e.estado(401);
    await e.elemento('formDatosEnvio').listeners.submit({preventDefault(){}});
    assert.equal(e.elemento('dialogEnvio').open,false);
    assert.equal(e.peticiones.some(p=>p==='/api/pedidos'),false);
});
