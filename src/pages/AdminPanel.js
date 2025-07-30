// Importaciones necesarias para el panel de administración
import React, { useEffect, useState } from 'react'; // React hooks para estado y efectos
import { useNavigate } from 'react-router-dom'; // Hook para navegación programática
import { auth } from '../firebase/firebaseConfig'; // Autenticación de Firebase
import MaterialTable from '../components/MaterialTable'; // Tabla de devoluciones de materiales
import OrdenTrabajoTable from '../components/OrdenTrabajoTable'; // Tabla de órdenes de trabajo

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

  // Estilos personalizados para el panel de administración
  const styles = {
    // Contenedor principal con diseño centrado
    wrapper: {
      maxWidth: '1200px', // Ancho máximo para mantener legibilidad
      margin: '0 auto', // Centrado horizontal
      padding: '2rem', 
      backgroundColor: '#f9f9f9', // Fondo gris claro
      minHeight: '100vh', // Altura mínima completa
    },
    
    // Tarjetas para organizar las secciones
    card: {
      background: '#ffffff', // Fondo blanco para contraste
      borderRadius: '12px', // Bordes redondeados modernos
      padding: '2rem',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)', // Sombra sutil
      marginBottom: '2rem', // Espaciado entre tarjetas
    },
    
    // Título principal del panel
    title: {
      textAlign: 'center',
      fontSize: '2rem',
      color: '#2c3e50', // Color azul oscuro profesional
      marginBottom: '2rem',
      fontWeight: '600', // Peso de fuente semi-bold
    },
    
    // Títulos de las secciones
    // Títulos de las secciones
    sectionTitle: {
      fontSize: '1.4rem',
      color: '#34495e', // Color gris azulado
      marginBottom: '1rem',
      borderBottom: '2px solid #3498db', // Línea inferior azul
      paddingBottom: '0.5rem', // Espaciado para la línea
    },
  };

  return (
    <div style={styles.wrapper}>
      {/* Título principal del panel */}
      <h2 style={styles.title}>Panel de Administración</h2>

      {/* Sección de Devolución de Materiales */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Devolución de Materiales</h3>
        {/* Tabla completa con todas las devoluciones registradas */}
        <MaterialTable />
      </div>

      {/* Sección de Órdenes de Trabajo */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Órdenes de Trabajo</h3>
        {/* Tabla completa con todas las órdenes registradas */}
        <OrdenTrabajoTable />
      </div>
    </div>
  );
};

export default AdminPanel;
