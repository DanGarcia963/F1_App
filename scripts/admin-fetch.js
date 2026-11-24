// Solo las operaciones de escritura requieren la clave administrativa.
// El token NO se embebe en los archivos ni en variables publicas de Netlify.
(function () {
  'use strict';

  const originalFetch = window.fetch.bind(window);
  const keyName = 'f1_app_admin_api_key';

  window.fetch = function fetchWithAdminKey(input, init) {
    const target = typeof input === 'string' ? input
      : (input instanceof URL ? input.href : (input && input.url));
    if (!target) return originalFetch(input, init);

    let url;
    try {
      url = new URL(target, window.location.href);
    } catch {
      return originalFetch(input, init);
    }

    const originalMethod = typeof Request !== 'undefined' && input instanceof Request ? input.method : 'GET';
    const method = String((init && init.method) || originalMethod).toUpperCase();

    if (url.origin !== window.location.origin
        || !url.pathname.startsWith('/api/')
        || ['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return originalFetch(input, init);
    }

    let key = '';
    try { key = sessionStorage.getItem(keyName) || ''; } catch {}

    if (!key) {
      const answer = window.prompt('Accion administrativa: ingresa la clave de F1_App configurada como ADMIN_API_KEY en Railway.');
      key = (answer || '').trim();
      if (!key) return Promise.reject(new Error('Operacion cancelada: falta clave de administracion.'));
      try { sessionStorage.setItem(keyName, key); } catch {}
    }

    const sourceHeaders = (init && init.headers) || (typeof Request !== 'undefined' && input instanceof Request ? input.headers : undefined);
    const headers = new Headers(sourceHeaders);
    headers.set('X-Admin-Key', key);

    return originalFetch(input, { ...init, headers }).then(response => {
      if (response.status === 401) {
        try { sessionStorage.removeItem(keyName); } catch {}
        window.alert('Clave administrativa incorrecta. Vuelve a intentarlo.');
      }
      return response;
    });
  };
})();
