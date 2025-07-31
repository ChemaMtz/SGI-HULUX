// Importaciones necesarias para el componente de firma digital
import React, { useRef, useEffect } from 'react'; // React hooks para referencias y efectos
import SignaturePad from 'signature_pad'; // Librería externa para captura de firmas
import '../App.css'; // Importar estilos personalizados

/**
 * Componente SignaturePadComponent
 * 
 * Componente reutilizable para capturar firmas digitales usando HTML5 Canvas.
 * Utiliza la librería signature_pad para proporcionar una experiencia de firma
 * suave y responsive en diferentes dispositivos.
 * 
 * Características principales:
 * - Captura de firmas con mouse, touch y stylus
 * - Optimización para dispositivos de alta densidad de píxeles (Retina)
 * - Responsive design que se adapta al contenedor
 * - Botones centrados con estilos personalizados
 * - Validación para evitar guardar firmas vacías
 * - Limpieza automática al redimensionar
 * 
 * @param {Function} onSave - Callback ejecutado al guardar la firma (recibe imagen en base64)
 * @param {Function} onClear - Callback ejecutado al limpiar la firma
 */
const SignaturePadComponent = ({ onSave, onClear }) => {
  // Referencias para acceder al canvas y la instancia de SignaturePad
  const canvasRef = useRef(null); // Referencia al elemento canvas
  const signaturePad = useRef(null); // Referencia a la instancia de SignaturePad

  // Efecto para inicializar el SignaturePad y configurar responsive behavior
  useEffect(() => {
    if (canvasRef.current) {
      // Crear instancia de SignaturePad con configuración personalizada
      signaturePad.current = new SignaturePad(canvasRef.current, {
        penColor: '#2c3e50', // Color corporativo para la tinta
        backgroundColor: 'rgba(255,255,255,0)', // Fondo transparente
        minWidth: 1, // Grosor mínimo de línea
        maxWidth: 3, // Grosor máximo de línea
        velocityFilterWeight: 0.7, // Suavizado de líneas
        throttle: 16 // Optimización de rendimiento (60fps)
      });
      
      /**
       * Función para ajustar el canvas a dispositivos con alta densidad de píxeles
       * 
       * Necesario para que las firmas se vean nítidas en pantallas Retina
       * y otros dispositivos de alta resolución
       */
      const resizeCanvas = () => {
        const canvas = canvasRef.current;
        const ratio = Math.max(window.devicePixelRatio || 1, 1); // Obtener ratio de píxeles
        
        // Ajustar dimensiones internas del canvas
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        
        // Escalar el contexto para mantener la proporción
        canvas.getContext('2d').scale(ratio, ratio);
        
        // Limpiar el canvas después del resize para evitar distorsiones
        signaturePad.current.clear();
      };

      // Aplicar configuración inicial
      resizeCanvas();
      
      // Listener para redimensionamiento de ventana
      window.addEventListener('resize', resizeCanvas);

      // Cleanup: remover listener al desmontar el componente
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, []);

  /**
   * Manejador para guardar la firma
   * 
   * Valida que la firma no esté vacía antes de procesarla.
   * Convierte el canvas a imagen base64 y ejecuta el callback onSave.
   */
  const handleSave = () => {
    if (signaturePad.current && !signaturePad.current.isEmpty()) {
      // Convertir canvas a imagen base64 (PNG)
      const signature = canvasRef.current.toDataURL('image/png');
      onSave(signature); // Ejecutar callback con la imagen
    }
  };

  /**
   * Manejador para limpiar la firma
   * 
   * Limpia el canvas y ejecuta el callback onClear para notificar
   * al componente padre que la firma ha sido eliminada.
   */
  const handleClear = () => {
    if (signaturePad.current) {
      signaturePad.current.clear(); // Limpiar el canvas
      onClear(); // Notificar al componente padre
    }
  };

  return (
    <div className="signature-container">
      {/* Canvas para captura de firma con estilos modernos */}
      <canvas
        ref={canvasRef}
        className="signature-canvas"
      />
      
      {/* Contenedor de botones con estilos modernos */}
      <div className="signature-buttons">
        {/* Botón de guardar con gradiente verde */}
        <button
          type="button"
          onClick={handleSave}
          className="btn btn-signature-save"
        >
          💾 Guardar
        </button>
        
        {/* Botón de limpiar con gradiente rojo */}
        <button
          type="button"
          onClick={handleClear}
          className="btn btn-signature-clear"
        >
          🗑️ Limpiar
        </button>
      </div>
    </div>
  );
};

export default SignaturePadComponent;