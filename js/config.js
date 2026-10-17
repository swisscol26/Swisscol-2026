// En producción servir /api en el mismo dominio HTTPS que la tienda.
(() => {
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname);
    window.SWISSCOL_API_BASE = local
        ? `http://${window.location.hostname}:8080/api`
        : '/api';
})();
