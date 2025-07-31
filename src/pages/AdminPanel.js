// Importaciones necesarias para el panel de administración
import React, { useEffect, useState } from 'react'; // React hooks para estado y efectos
import { useNavigate } from 'react-router-dom'; // Hook para navegación programática
import { auth } from '../firebase/firebaseConfig'; // Autenticación de Firebase
import MaterialTable from '../components/MaterialTable'; // Tabla de devoluciones de materiales
import OrdenTrabajoTable from '../components/OrdenTrabajoTable'; // Tabla de órdenes de trabajo
import '../App.css'; // Importar estilos

// Constante para el email del administrador autorizado
const ADMIN_EMAIL = 'admin@hulux.com'; // Email específico con permisos de administrador

/**
 * Componente AdminPanel
 * 
 * Panel de administración restringido que proporciona acceso completo a todos
 * los registros del sistema. Solo accesible para usuarios con email específico
 * de administrador.
 * 
 * Características principales:
 * - Control de acceso estricto basado en email
 * - Verificación en tiempo real del estado de autenticación
 * - Redirección automática si no es administrador
 * - Visualización centralizada de todas las tablas
 * - Diseño limpio con estilos personalizados
 * - Layout responsive con cards organizadas
 * 
 * Funcionalidades:
 * - Visualización de todas las devoluciones de materiales
 * - Acceso completo a órdenes de trabajo
 * - Generación de reportes PDF desde las tablas
 * - Interfaz administrativa intuitiva
 * 
 * Seguridad:
 * - Validación constante del estado de admin
 * - Redirección inmediata si pierde permisos
 * - Renderizado condicional para prevenir acceso no autorizado
 */
const AdminPanel = () => {
  // Estado para verificar si el usuario actual es administrador
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate(); // Hook para navegación

  // Efecto para verificar permisos de administrador en tiempo real
  useEffect(() => {
    // Listener para cambios en el estado de autenticación
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user && user.email === ADMIN_EMAIL) {
        // Usuario autenticado y es administrador
        setIsAdmin(true);
      } else {
        // Usuario no es administrador o no está autenticado
        setIsAdmin(false);
        navigate('/'); // Redirigir a home inmediatamente
      }
    });
    
    // Cleanup: cancelar listener al desmontar
    return () => unsubscribe();
  }, [navigate]);

  // Renderizado condicional: no mostrar nada mientras se verifica permisos
  if (!isAdmin) return null;

  return (
    <div className="admin-container">
      <div className="admin-wrapper">
        {/* Título principal del panel */}
        <h1 className="admin-title">
          🛠️ Panel de Administración
        </h1>

        {/* Sección de Devolución de Materiales */}
        <div className="admin-card">
          <h2 className="admin-section-title">
            📦 Devolución de Materiales
          </h2>
          {/* Tabla completa con todas las devoluciones registradas */}
          <MaterialTable />
        </div>

        {/* Sección de Órdenes de Trabajo */}
        <div className="admin-card">
          <h2 className="admin-section-title">
            📋 Órdenes de Trabajo
          </h2>
          {/* Tabla completa con todas las órdenes registradas */}
          <OrdenTrabajoTable />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
