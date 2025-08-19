// =============================================================
// Utilidad: reportWebVitals
// -------------------------------------------------------------
// Permite medir métricas de rendimiento (Core Web Vitals) como:
// CLS (Layout Shift), FID (First Input Delay), FCP (First Content Paint),
// LCP (Largest Contentful Paint) y TTFB (Time To First Byte).
// Si se pasa un callback (onPerfEntry) se ejecuta cada vez que se obtiene
// una métrica. Útil para enviar datos a un servicio de analítica.
// =============================================================

const reportWebVitals = (onPerfEntry) => {
  // Verificar que se haya pasado un callback válido
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    // Carga dinámica del paquete 'web-vitals' (code-splitting)
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Ejecutar todas las mediciones y pasar resultados al callback
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
