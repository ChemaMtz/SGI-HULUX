// Importaciones necesarias para el componente de firma digital
import React, { useRef, useEffect, useState, useCallback } from 'react'; // React hooks para referencias y efectos
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
  const [fullscreen, setFullscreen] = useState(false);
  // Referencias para acceder al canvas y la instancia de SignaturePad
  const canvasRef = useRef(null); // Referencia al elemento canvas
  const signaturePad = useRef(null); // Referencia a la instancia de SignaturePad

  // Función reutilizable para redimensionar canvas (incluye fullscreen)
  const resizeCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    // Altura dinámica en fullscreen para aprovechar viewport
    if (fullscreen) {
      // Estimar altura disponible (restar botones / header aprox.)
      const avail = window.innerHeight - 160; // 160px para controles
      if (avail > 200) c.style.height = avail + 'px';
    } else {
      // Altura base adaptable a orientación
      const isLandscape = window.innerWidth > window.innerHeight;
      c.style.height = isLandscape ? '220px' : '200px';
    }
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    // Ajustar atributos width/height (bitmap) acorde al tamaño CSS final
    const rect = c.getBoundingClientRect();
    c.width = rect.width * ratio;
    c.height = rect.height * ratio;
    const ctx = c.getContext('2d');
    if (ctx) ctx.scale(ratio, ratio);
    if (signaturePad.current) {
      try {
        signaturePad.current.clear();
      } catch (_) { /* noop */ }
    }
  }, [fullscreen]);

  // Inicialización y listeners globales
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!signaturePad.current) {
      signaturePad.current = new SignaturePad(canvas, {
        penColor: '#2c3e50',
        backgroundColor: 'rgba(255,255,255,0)',
        minWidth: 1,
        maxWidth: 3,
        velocityFilterWeight: 0.7,
        throttle: 16,
      });
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('orientationchange', resizeCanvas);
      if (signaturePad.current) {
        try {
          if (typeof signaturePad.current.off === 'function') signaturePad.current.off();
        } catch(_){}
        signaturePad.current = null;
      }
    };
  }, [resizeCanvas]);

  // Reajustar al entrar / salir de fullscreen
  useEffect(() => {
    // retraso ligero para permitir aplicar clases CSS
    const t = setTimeout(resizeCanvas, 60);
    if (fullscreen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prevOverflow; };
    }
    return () => clearTimeout(t);
  }, [fullscreen, resizeCanvas]);

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
      <div className="signature-toolbar">
  {!fullscreen && <button type="button" className="btn btn-signature-expand" onClick={() => setFullscreen(true)}>⛶ Ampliar</button>}
  {fullscreen && <button type="button" className="btn btn-signature-expand" onClick={() => setFullscreen(false)}>↩ Salir</button>}
      </div>
  <canvas ref={canvasRef} className={`signature-canvas ${fullscreen ? 'signature-fullscreen-active' : ''}`} />
      <div className="signature-buttons">
        <button type="button" onClick={handleSave} className="btn btn-signature-save">💾 Guardar</button>
        <button type="button" onClick={handleClear} className="btn btn-signature-clear">🗑️ Limpiar</button>
      </div>

      {fullscreen && (
        <div className="signature-fullscreen-overlay">
          <div className="signature-fullscreen-inner">
            <div className="signature-fullscreen-header">
              <span>✍️ Firma</span>
              <button type="button" className="btn btn-sm btn-close-fullscreen" onClick={() => setFullscreen(false)}>✖</button>
            </div>
            <div className="signature-fullscreen-wrapper">
              {/* mismo canvas reposicionado via CSS (absolute) */}
            </div>
            <div className="signature-buttons fullscreen">
              <button type="button" onClick={handleSave} className="btn btn-signature-save">💾 Guardar</button>
              <button type="button" onClick={handleClear} className="btn btn-signature-clear">🗑️ Limpiar</button>
              <button type="button" onClick={() => setFullscreen(false)} className="btn btn-secondary btn-signature-close">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignaturePadComponent;