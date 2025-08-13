// Importaciones necesarias para el componente de navegación
import React from 'react'; // React para crear el componente
import { NavLink } from 'react-router-dom'; // NavLink para navegación con estilos activos
import { FaSignInAlt, FaExchangeAlt, FaClipboardList, FaUserCog, FaSignOutAlt, FaHome } from 'react-icons/fa'; // Iconos de Font Awesome

/**
 * Componente Navigation
 * 
 * Barra de navegación responsive que controla el acceso a las diferentes secciones
 * de la aplicación basado en el estado de autenticación del usuario.
 * 
 * Características principales:
 * - Navegación responsive con hamburger menu para móviles
 * - Control de acceso basado en autenticación
 * - Estilos dinámicos para enlaces activos
 * - Panel de administración restringido a email específico
 * - Brand personalizado con logo de Hulux
 * - Integración con Bootstrap para estilos
 * 
 * @param {Object} user - Objeto del usuario autenticado (null si no está autenticado)
 * @param {Function} onLogout - Función callback para cerrar sesión
 */
const Navigation = ({ user, onLogout }) => {
  return (
    // Navbar principal con Bootstrap - sticky top para mantener fija en scroll
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top shadow">
      <div className="container">
        {/* Brand/Logo de la aplicación */}
        <NavLink to="/" className="navbar-brand d-flex align-items-center">
          <span className="text-primary fw-bold">Hulux</span>
          <span className="text-danger ms-1">&reg;</span>
        </NavLink>

        {/* Botón hamburger para móviles - controla el colapso del menú */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenido colapsable del navbar */}
        <div className="collapse navbar-collapse justify-content-end" id="mainNavbar">
          <ul className="navbar-nav">
            {/* Renderizado condicional basado en el estado de autenticación */}
            {!user ? (
              // Si el usuario NO está autenticado, mostrar solo enlace de login
              <li key="login-nav-item" className="nav-item">
                <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <FaSignInAlt className="me-2" /> Iniciar sesión
                </NavLink>
              </li>
            ) : (
              // Si el usuario SÍ está autenticado, mostrar menú completo
              <React.Fragment key="authenticated-nav-items">
                {/* Enlace a página de inicio */}
                <li className="nav-item">
                  <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FaHome className="me-2" /> Inicio
                  </NavLink>
                </li>
                
                {/* Enlace a página de devoluciones */}
                <li className="nav-item">
                  <NavLink to="/devolucion" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FaExchangeAlt className="me-2" /> Devoluciones
                  </NavLink>
                </li>
                
                {/* Enlace a página de órdenes de trabajo */}
                <li className="nav-item">
                  <NavLink to="/orden-trabajo" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <FaClipboardList className="me-2" /> Órdenes
                  </NavLink>
                </li>
                
                {/* Panel de administración - solo visible para admin@hulux.com */}
                {user.email === 'admin@hulux.com' && (
                  <li className="nav-item">
                    <NavLink to="/admin-panel" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                      <FaUserCog className="me-2" /> Registros
                    </NavLink>
                  </li>
                )}
                
                {/* Botón de cerrar sesión */}
                <li className="nav-item">
                  <button
                    onClick={onLogout}
                    className="btn btn-logout ms-3 d-flex align-items-center text-white"
                  >
                    <FaSignOutAlt className="me-2" /> Cerrar sesión
                  </button>
                </li>
              </React.Fragment>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
