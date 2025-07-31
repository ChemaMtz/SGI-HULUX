// Importaciones necesarias: React, Firebase Firestore
import React, { useState } from 'react';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, runTransaction, doc } from 'firebase/firestore';

// Estado inicial del formulario de devolución
const initialState = {
  fecha: '',
  cliente: '',
  actividad: '',
  modelo_onu_funcional: '',
  onu_rip: false,
  modem_funcional: false,
  modem_rip: false,
  cable_ethernet: false,
  roseta: false,
  drop: false,
  cargador: false,
  poe: false,
  bateria: false,
  observaciones: '',
};

// Lista de modelos de ONU disponibles para selección
const modelosONU = [
  'HG8145V5V3',
  'HG8145V5- NUE-TV',
  'HG8145V5- NUE',
  'HG8145X6',
  'HG8245Q2',
  'HG8145V5- DEV.',
  'hg8245q2 nuevo',
  'HG323AC-B',
  'OptiXstar-HG8145X6',
  'HG323ACT Onu Vsol CATV',
  'V2802W-U-AZUL',
  'V2801SG-51 DEV.',
  'RWireless-G1',
];

// Componente principal para registrar devoluciones de material
const DevolucionMaterial = () => {
  // Estado del formulario y mensajes
  const [form, setForm] = useState(initialState);
  const [msg, setMsg] = useState('');

  // Manejar cambios en los inputs del formulario
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Enviar formulario y guardar en Firebase con numeración única
  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');

    try {
      // Usar transacción para garantizar numeración única
      const numeroOrden = await runTransaction(db, async (transaction) => {
        // Crear referencia al documento contador
        const contadorRef = doc(db, 'contadores', 'devolucionesMaterial');
        
        try {
          // Intentar obtener el contador actual
          const contadorDoc = await transaction.get(contadorRef);
          
          let siguienteNumero;
          if (!contadorDoc.exists()) {
            // Si no existe el contador, crearlo con valor inicial
            siguienteNumero = 1;
            transaction.set(contadorRef, { ultimo: siguienteNumero });
          } else {
            // Si existe, incrementar el contador
            siguienteNumero = contadorDoc.data().ultimo + 1;
            transaction.update(contadorRef, { ultimo: siguienteNumero });
          }

          // Crear número de orden formateado
          const numeroOrdenFormateado = `ORD-${String(siguienteNumero).padStart(3, '0')}`;

          // Obtener información del usuario actual
          const usuario = auth.currentUser;
          const infoUsuario = usuario ? {
            uid: usuario.uid,
            email: usuario.email,
            nombreCompleto: usuario.displayName || usuario.email,
            fechaCreacion: new Date(),
          } : {
            uid: 'anonimo',
            email: 'no-disponible',
            nombreCompleto: 'Usuario Anónimo',
            fechaCreacion: new Date(),
          };

          // Crear referencia para el nuevo documento
          const nuevaDevolucionRef = doc(collection(db, 'devolucionesMaterial'));
          
          // Guardar la devolución con el número garantizado
          transaction.set(nuevaDevolucionRef, {
            ...form,
            numero_orden: numeroOrdenFormateado,
            creadoPor: infoUsuario, // Información del usuario que creó la devolución
          });

          return numeroOrdenFormateado;
        } catch (error) {
          console.error("Error en transacción:", error);
          throw error;
        }
      });

      alert(`¡Orden guardada correctamente: ${numeroOrden}!`);
      setMsg('Registro guardado exitosamente');
      setForm(initialState); // Resetear formulario
      
    } catch (err) {
      console.error("Error completo:", err);
      
      if (err.code === 'aborted') {
        setMsg('Error: La transacción fue cancelada. Por favor, intente nuevamente.');
      } else if (err.code === 'unavailable') {
        setMsg('Error: Servicio no disponible. Verifique su conexión a internet.');
      } else {
        setMsg(`Error al guardar: ${err.message}`);
      }
    }
  };

  // Lista de materiales disponibles para devolución
  const materiales = [
    { name: 'onu_rip', label: 'ONU RIP' },
    { name: 'modem_funcional', label: 'Modem Funcional' },
    { name: 'modem_rip', label: 'Modem RIP' },
    { name: 'cable_ethernet', label: 'Cable Ethernet' },
    { name: 'roseta', label: 'Roseta' },
    { name: 'drop', label: 'Drop' },
    { name: 'cargador', label: 'Cargador' },
    { name: 'poe', label: 'POE' },
    { name: 'bateria', label: 'Batería' },
  ];

  return (
    <div className="page-container">
      <div className="container">
        <div className="form-container">
          <h2 className="form-title">📦 Devolución de Material</h2>

          {/* Formulario de devolución */}
          <form onSubmit={handleSubmit}>
            {/* Información básica */}
            <div className="row">
              {/* Campo de fecha */}
              <div className="col-md-6 mb-3">
                <label htmlFor="fecha" className="form-label">📅 Fecha:</label>
                <input 
                  type="date" 
                  className="form-control" 
                  id="fecha" 
                  name="fecha" 
                  value={form.fecha} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              {/* Campo de cliente */}
              <div className="col-md-6 mb-3">
                <label htmlFor="cliente" className="form-label">👤 Cliente:</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="cliente" 
                  name="cliente" 
                  placeholder="Nombre del cliente" 
                  value={form.cliente} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            {/* Campo de actividad */}
            <div className="mb-3">
              <label htmlFor="actividad" className="form-label">🔧 Actividad:</label>
              <input 
                type="text" 
                className="form-control" 
                id="actividad" 
                name="actividad" 
                placeholder="Descripción de la actividad" 
                value={form.actividad} 
                onChange={handleChange} 
              />
            </div>

            {/* Selector de modelo ONU */}
            <div className="mb-4">
              <label htmlFor="modelo_onu_funcional" className="form-label">📡 Modelo de ONU:</label>
              <select 
                className="form-select" 
                id="modelo_onu_funcional" 
                name="modelo_onu_funcional" 
                value={form.modelo_onu_funcional} 
                onChange={handleChange} 
                required
              >
                <option value="">-- Selecciona un modelo --</option>
                {modelosONU.map((modelo, i) => (
                  <option key={i} value={modelo}>{modelo}</option>
                ))}
              </select>
            </div>

            {/* Sección de materiales devueltos con checkboxes */}
            <h5 className="form-section-title">📋 Materiales devueltos</h5>
            <div className="materials-grid">
              <div className="row">
                {materiales.map((material, index) => (
                  <div key={index} className="col-md-4 col-sm-6 mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={material.name}
                        name={material.name}
                        checked={form[material.name]}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor={material.name}>
                        {material.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Campo de observaciones */}
            <div className="mb-4">
              <label htmlFor="observaciones" className="form-label">📝 Observaciones:</label>
              <textarea 
                className="form-control" 
                id="observaciones" 
                name="observaciones" 
                rows="4" 
                placeholder="Notas adicionales, estado del material, comentarios..." 
                value={form.observaciones} 
                onChange={handleChange}
              />
            </div>

            {/* Botón de envío */}
            <div className="text-center">
              <button type="submit" className="btn btn-primary-custom">
                💾 Guardar Devolución
              </button>
            </div>
          </form>

          {/* Mensaje de confirmación o error */}
          {msg && (
            <div className={`alert alert-custom ${msg.includes('Error') ? 'alert-danger' : 'alert-success'}`} role="alert">
              {msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DevolucionMaterial;
