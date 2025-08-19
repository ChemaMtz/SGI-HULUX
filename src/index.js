// =============================
// Punto de entrada principal React
// =============================
// Este archivo monta la aplicación en el DOM, aplica estilos globales,
// inicializa compatibilidad entre navegadores y envuelve toda la app
// en un ErrorBoundary para capturar errores de renderizado.

import React from 'react';
import ReactDOM from 'react-dom/client';

// Estilos globales base
import './index.css';

// Bootstrap (CSS + JS - incluye Popper) desde dependencias locales (evita problemas de CDN)
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Capa de compatibilidad CSS + utilidades JS (polyfills y detección de features)
import './browser-compatibility.css';
import './utils/browserCompat';

// ErrorBoundary evita que un error en un subárbol tumbe toda la app
import ErrorBoundary from './components/ErrorBoundary';

// Componente raíz de la aplicación
import App from './App';

// Métricas de rendimiento (opcional). Se pueden enviar a un endpoint o simplemente loguear
import reportWebVitals from './reportWebVitals';

// Crear root concurrente (React 18)
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render principal con manejo de errores global
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// Para medir el rendimiento: descomentar y pasar un callback, ej: reportWebVitals(console.log)
// Más info: https://bit.ly/CRA-vitals
reportWebVitals();
