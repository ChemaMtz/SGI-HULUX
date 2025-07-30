// Importación de React para el componente
import React from 'react';

/**
 * Componente NotFound
 * 
 * Página de error 404 que se muestra cuando el usuario intenta acceder
 * a una ruta que no existe en la aplicación. Componente simple que
 * proporciona feedback visual sobre rutas no encontradas.
 * 
 * Características:
 * - Componente funcional minimalista
 * - Mensaje claro para el usuario
 * - Se activa automáticamente con React Router
 * - Manejo básico de errores de navegación
 * 
 * Uso:
 * - Configurado como ruta catch-all en React Router
 * - Se muestra para cualquier ruta no definida
 * - Mejora la experiencia de usuario
 */
const NotFound = () => <h2>Página no encontrada</h2>;

export default NotFound;
