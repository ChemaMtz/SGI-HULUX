// Importaciones necesarias para la página de inicio
import React, { useEffect } from 'react'; // React con hook useEffect
import { useNavigate } from 'react-router-dom'; // Hook para navegación programática
import { auth } from '../firebase/firebaseConfig'; // Autenticación de Firebase

/**
 * Componente Home
 * 
 * Página de inicio del sistema que sirve como dashboard principal y landing page
 * para usuarios autenticados. Proporciona una visión general del sistema y
 * redirige a usuarios no autenticados al login.
 * 
 * Características principales:
 * - Verificación automática de autenticación
 * - Redirección de usuarios no autenticados
 * - Dashboard con información del sistema
 * - Diseño responsive con Bootstrap
 * - Cards informativas sobre funcionalidades
 * - Branding corporativo con Hulux
 * 
 * Funcionalidades:
 * - Portal de entrada para usuarios autenticados
 * - Información sobre capacidades del sistema
 * - Navegación visual hacia otras secciones
 * - Experiencia de usuario profesional
 * 
 * Seguridad:
 * - Verificación constante del estado de autenticación
 * - Redirección automática si no está logueado
 * - Protección del contenido interno
 */
const Home = () => {
  // Hook para navegación programática
  const navigate = useNavigate();

  // Efecto para verificar autenticación en tiempo real
  useEffect(() => {
    // Listener para cambios en el estado de autenticación
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        // Si no hay usuario autenticado, redirigir al login
        // replace: true evita que se pueda volver con el botón "atrás"
        navigate('/login', { replace: true });
      }
    });
    
    // Cleanup: cancelar suscripción al desmontar componente
    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="home-container">
      <div className="container py-5">
        {/* Sección de bienvenida principal */}
        <div className="home-welcome text-center">
          <h1 className="display-5 fw-bold">Bienvenido al Sistema HULUX®</h1>
          <p className="lead mt-3">
            Gestión integral de órdenes de trabajo y devolución de materiales para operaciones de fibra óptica
          </p>
        </div>

        {/* Grid de características del sistema */}
        <div className="row g-4">
          {/* Card 1: Órdenes de Trabajo */}
          <div className="col-md-4">
            <div className="feature-card text-center">
              <div className="feature-icon">🔧</div>
              <h5>Órdenes de Trabajo</h5>
              <p>
                Crea y gestiona órdenes de trabajo externas/internas con numeración automática y firmas digitales.
              </p>
            </div>
          </div>

          {/* Card 2: Devolución de Materiales */}
          <div className="col-md-4">
            <div className="feature-card text-center">
              <div className="feature-icon">📦</div>
              <h5>Devolución de Materiales</h5>
              <p>
                Registra devoluciones de equipos ONU, modems, cables y accesorios con control de inventario.
              </p>
            </div>
          </div>

          {/* Card 3: Reportes y PDFs */}
          <div className="col-md-4">
            <div className="feature-card text-center">
              <div className="feature-icon">📄</div>
              <h5>Reportes y PDFs</h5>
              <p>
                Genera reportes detallados con firmas digitales y trazabilidad completa de usuarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
