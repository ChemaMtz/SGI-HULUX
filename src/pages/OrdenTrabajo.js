// Importaciones necesarias para la página de orden de trabajo
import React from 'react'; // React para crear el componente
import OrdenTrabajoForm from '../components/OrdenTrabajoForm'; // Componente principal del formulario

/**
 * Componente OrdenTrabajo
 * 
 * Página wrapper que contiene el formulario completo de creación de órdenes
 * de trabajo. Actúa como contenedor de página para el componente OrdenTrabajoForm,
 * manteniendo una arquitectura limpia y modular.
 * 
 * Características:
 * - Wrapper simple para el componente de orden de trabajo
 * - Separación clara entre estructura de página y lógica de componente
 * - Arquitectura modular y mantenible
 * - Fácil extensibilidad para futuras funcionalidades
 * 
 * Funcionalidad principal:
 * - Renderiza el formulario completo de orden de trabajo
 * - Permite crear órdenes con numeración automática
 * - Integra captura de firmas digitales
 * - Maneja materiales dinámicos y actividades múltiples
 * - Conecta con Firebase para persistencia
 * 
 * Navegación:
 * - Accesible desde el menú principal para usuarios autenticados
 * - Ruta protegida que requiere autenticación
 * - Parte del flujo principal de trabajo del sistema
 */
const OrdenTrabajo = () => {
  return (
    <div>
      {/* Renderizar el componente principal del formulario de orden de trabajo */}
      <OrdenTrabajoForm />
    </div>
  );
};

export default OrdenTrabajo;
