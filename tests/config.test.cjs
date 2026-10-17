const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../js/config.js'), 'utf8');

test('El catálogo publicado usa la API del mismo dominio sin HTTP ni puertos locales', () => {
    const window = { location: { hostname: 'tienda.example', protocol: 'https:' } };
    vm.runInNewContext(source, { window });
    assert.equal(window.SWISSCOL_API_BASE, '/api');
});

test('El desarrollo conserva el host de la sesión y el puerto de Java', () => {
    for (const hostname of ['localhost', '127.0.0.1']) {
        const window = { location: { hostname } };
        vm.runInNewContext(source, { window });
        assert.equal(window.SWISSCOL_API_BASE, `http://${hostname}:8080/api`);
    }
});
