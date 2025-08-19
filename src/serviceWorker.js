// =============================================================
// Service Worker (opcional)
// -------------------------------------------------------------
// Este archivo mantiene la implementación por defecto de CRA para
// registrar un Service Worker que permite:
//  * Carga más rápida (cache-first)
//  * Funcionalidad offline básica
//  * Mejora de percepción de rendimiento
// Por defecto NO se registra automáticamente. Para activarlo, llamar
// a register() desde el punto de entrada (index.js) bajo tu propio criterio.
// =============================================================

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export function register(config) {
  if ('serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
  // Entorno local: validar si el SW existe o debe limpiarse
        checkValidServiceWorker(swUrl, config);

        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://goo.gl/KwvDNy'
          );
        });
      } else {
  // Producción u origen distinto a localhost: registrar directamente
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Nuevo contenido listo: se activará cuando todas las pestañas se cierren
              console.log('Nuevo contenido disponible (se aplicará al recargar todas las pestañas).');

              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Primer cache exitoso
              console.log('Contenido cacheado para uso offline.');

              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch(error => {
  console.error('Error registrando el service worker:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
  navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
  console.log('Sin conexión: la aplicación funciona en modo offline (cache).');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error('Error al anular el registro del SW:', error.message);
      });
  }
}
