import React, { useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';

const SignaturePadComponent = ({ onSave, onClear }) => {
  const canvasRef = useRef(null);
  const signaturePad = useRef(null);

  // Inicializar SignaturePad
  useEffect(() => {
    if (canvasRef.current) {
      signaturePad.current = new SignaturePad(canvasRef.current, {
        penColor: 'black'
      });
      
      // Ajustar para dispositivos con alta densidad de píxeles
      const resizeCanvas = () => {
        const canvas = canvasRef.current;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
        signaturePad.current.clear(); // Limpiar después del resize
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, []);

  const handleSave = () => {
    if (signaturePad.current && !signaturePad.current.isEmpty()) {
      const signature = canvasRef.current.toDataURL('image/png');
      onSave(signature);
    }
  };

  const handleClear = () => {
    if (signaturePad.current) {
      signaturePad.current.clear();
      onClear();
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          maxWidth: '400px',
          height: '150px',
          border: '1px solid #000',
          display: 'block',
          margin: '0 auto 10px auto',
          background: '#fff',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={handleSave}
          style={{
            padding: '6px 18px',
            background: '#198754',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={handleClear}
          style={{
            padding: '6px 18px',
            background: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
          }}
        >
          Limpiar
        </button>
      </div>
    </div>
  );
};

export default SignaturePadComponent;