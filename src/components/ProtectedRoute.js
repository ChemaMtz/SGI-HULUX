// Componente ProtectedRoute para control de acceso basado en autenticación
import React from 'react'; // React para crear el componente
import { Navigate } from 'react-router-dom'; // Navigate para redirecciones programáticas

/**
 * Componente ProtectedRoute
 * 
 * Componente de orden superior (HOC) que controla el acceso a rutas protegidas
 * basado en el estado de autenticación del usuario y opcionalmente en permisos
 * de administrador.
 * 
 * Funcionalidades:
 * - Verificación de autenticación de usuario
 * - Control de acceso a rutas de administrador
 * - Redirección automática a login si no está autenticado
 * - Redirección a home si no tiene permisos de admin
 * - Renderizado condicional de componentes hijos
 * 
 * Casos de uso:
 * - Proteger rutas que requieren autenticación
 * - Restringir acceso a paneles de administración
 * - Mantener usuarios no autenticados fuera de áreas privadas
 * 
 * @param {React.ReactNode} children - Componentes hijos a renderizar si el acceso es permitido
 * @param {Object|null} user - Objeto del usuario autenticado o null si no está autenticado
 * @param {boolean} adminOnly - Si true, solo permite acceso a admin@hulux.com (default: false)
 */
const ProtectedRoute = ({ children, user, adminOnly = false }) => {
  // Primera verificación: ¿El usuario está autenticado?
  if (!user) {
    // Si no hay usuario, redirigir al login
    // replace=true evita que se pueda volver con el botón "atrás"
    return <Navigate to="/login" replace />;
  }
  
  // Segunda verificación: ¿La ruta requiere permisos de administrador?
  if (adminOnly && user.email !== 'admin@hulux.com') {
    // Si la ruta es solo para admin y el usuario no es admin, redirigir a home
    return <Navigate to="/" replace />;
  }
  
  // Si pasa todas las verificaciones, renderizar los componentes hijos
  return children;
};

export default ProtectedRoute;