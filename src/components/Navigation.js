import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaSignInAlt, FaExchangeAlt, FaClipboardList, FaUserCog, FaSignOutAlt } from 'react-icons/fa';

const Navigation = ({ user, onLogout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
      <div className="container">
        <NavLink to="/" className="navbar-brand d-flex align-items-center">
          <span className="text-primary fw-bold fs-4">hulux</span>
          <span className="text-danger ms-1">&reg;</span>
        </NavLink>

        <div className="collapse navbar-collapse justify-content-end">
          <ul className="navbar-nav">
            {!user ? (
              <li className="nav-item">
                <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active bg-primary text-white rounded px-3' : ''}`}>
                  <FaSignInAlt className="me-2" /> Iniciar sesión
                </NavLink>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/devolucion" className={({ isActive }) => `nav-link ${isActive ? 'active bg-primary text-white rounded px-3' : ''}`}>
                    <FaExchangeAlt className="me-2" /> Devoluciones
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/orden-trabajo" className={({ isActive }) => `nav-link ${isActive ? 'active bg-primary text-white rounded px-3' : ''}`}>
                    <FaClipboardList className="me-2" /> Órdenes
                  </NavLink>
                </li>
                {user.email === 'admin@hulux.com' && (
                  <li className="nav-item">
                    <NavLink to="/admin-panel" className={({ isActive }) => `nav-link ${isActive ? 'active bg-primary text-white rounded px-3' : ''}`}>
                      <FaUserCog className="me-2" /> Registros
                    </NavLink>
                  </li>
                )}
                <li className="nav-item">
                  <button
                    onClick={onLogout}
                    className="btn btn-outline-danger ms-3 d-flex align-items-center"
                  >
                    <FaSignOutAlt className="me-2" /> Cerrar sesión
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
