// Importaciones necesarias para la página de devolución
import React from 'react'; // React para crear el componente
import DevolucionMaterial from '../components/DevolucionMaterial'; // Componente principal de devolución

/**
 * Componente Devolucion
 * 
 * Página wrapper que contiene el formulario de devolución de materiales.
 * Actúa como contenedor de página para el componente DevolucionMaterial,
 * proporcionando una estructura de página limpia y organizada.
 * 
 * Características:
 * - Wrapper simple para el componente de devolución
 * - Mantiene la separación entre páginas y componentes
 * - Estructura modular y reutilizable
 * - Fácil mantenimiento y extensibilidad
 * 
 * Funcionalidad:
 * - Renderiza el formulario completo de devolución de materiales
 * - Permite a los usuarios registrar materiales devueltos
 * - Integra con Firebase para persistencia de datos
 * - Proporciona interfaz intuitiva para el proceso de devolución
 * 
 * Navegación:
 * - Accesible desde el menú principal para usuarios autenticados
 * - Ruta protegida que requiere autenticación
 */
const Devolucion = () => {
  return (
    <div>
      {/* Renderizar el componente principal de devolución de materiales */}
      <DevolucionMaterial />
    </div>
  );
};

export default Devolucion;
