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
          <h1 className="display-5 fw-bold">Bienvenido al Sistema de Gestión Integral</h1>
          <p className="lead mt-3">
            Administra y controla todos los procesos de tu organización desde un solo lugar
          </p>
        </div>

        {/* Grid de características del sistema */}
        <div className="row g-4">
          {/* Card 1: Reportes en Tiempo Real */}
          <div className="col-md-4">
            <div className="feature-card text-center">
              <div className="feature-icon">📊</div>
              <h5>Reportes en Tiempo Real</h5>
              <p>
                Accede a métricas y análisis actualizados de todos tus procesos operativos.
              </p>
            </div>
          </div>

          {/* Card 2: Seguridad Garantizada */}
          <div className="col-md-4">
            <div className="feature-card text-center">
              <div className="feature-icon">🔒</div>
              <h5>Seguridad Garantizada</h5>
              <p>
                Protección de datos con los más altos estándares de seguridad informática.
              </p>
            </div>
          </div>

          {/* Card 3: Sincronización Automática */}
          <div className="col-md-4">
            <div className="feature-card text-center">
              <div className="feature-icon">🔄</div>
              <h5>Sincronización Automática</h5>
              <p>
                Todos tus dispositivos actualizados con la información más reciente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
