// Importaciones necesarias: React, Firebase Firestore
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db, auth } from '../firebase/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getSafeFormattedSequence } from '../firebase/counters';
import { validateDevolucion } from '../utils/validation';

// Estado inicial del formulario de devolución
const initialState = {
  fecha: '',
  cliente: '',
  actividad: '',
  onu_rip: 0,
  onu_rip_modelo: '',
  modem_funcional: 0,
  modem_funcional_modelo: '',
  modem_rip: 0,
  modem_rip_modelo: '',
  cable_ethernet: 0,
  roseta: 0,
  drop: 0,
  cargador: 0,
  poe: 0,
  bateria: 0,
  isbs: 0,
  radios: 0,
  radios_modelo: '',
  nap: 0,
  hcc: 0,
  hsc: 0,
  spliters: 0,
  ccn: 0,
  fleje: 0,
  fibra_24h: 0,
  preformado: 0,
  observaciones: '',
};

// Lista de modelos de equipos disponibles para selección
const modelosEquipos = [
  'HG8145V5V3',
  'HG8145V5- NUE-TV',
  'HG8145V5- NUE',
  'HG8145X6',
  'HG8245Q2',
  'HG8145V5- DEV',
  'HG8245Q2 nuevo',
  'HG323AC-B',
  'OptiXstar-HG8145X6',
  'HG323ACT Onu Vsol CATV',
  'V2802W-U-AZUL',
  'V2801SG-51 DEV',
  'RWireless-G1',
  'Wireless-Aguste General',
  'Pincon Comumunication',
  'Atw-G',
  'Nokia',
  'Arcadia',
  'Mininodos',
  'V-sol',
  'Roseta V-Sol',
];

// Modelos específicos para radios
const modelosRadios = [
  'M2400',
  'M5300',
  'M5400',
  'Foco M516',
  'Foco m519',
  'Loko M2',
  'Loko M5',
  'AC 2GEN',
  'Force 200',
  'CX5',
  'airFIBER 5X',
  'airFIBER 3X',
  'airFIBER 5XHD',
  'Nano Bridge',
  'Nano Station',
];

// Componente principal para registrar devoluciones de material
const DevolucionMaterial = () => {
  // Estado del formulario y mensajes
  const [form, setForm] = useState(initialState);
  const [msg, setMsg] = useState('');

  // Manejar cambios en los inputs del formulario
  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  // Enviar formulario y guardar en Firebase con numeración única
  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');

    try {
      // Validar y sanitizar antes de generar número (evita huecos si falla)
      const { valid, errors, clean } = validateDevolucion(form);
      if (!valid) {
        setMsg(errors.join('\n'));
        return;
      }
      // Obtener número formateado centralizado
  const { idFormateado: numeroOrden, numero } = await getSafeFormattedSequence('devolucionesMaterial', { prefijo: 'ORD-', padding: 3 });

      // Info usuario (solo lectura)
      const usuario = auth.currentUser;
      const infoUsuario = usuario ? {
        uid: usuario.uid,
        email: usuario.email,
        nombreCompleto: usuario.displayName || usuario.email,
      } : {
        uid: 'anonimo',
        email: 'no-disponible',
        nombreCompleto: 'Usuario Anónimo',
      };

      await addDoc(collection(db, 'devolucionesMaterial'), {
        ...clean,
        numeroSecuencial: numero,
        numero_orden: numeroOrden,
        creadoPor: infoUsuario,
        creadoEn: serverTimestamp(),
      });

  toast.success(`Devolución guardada: ${numeroOrden}`);
      setMsg('Registro guardado exitosamente');
      setForm(initialState); // Resetear formulario
      
    } catch (err) {
      console.error("Error completo:", err);
      
      if (err.code === 'aborted') {
  setMsg('Transacción cancelada. Intenta nuevamente.'); toast.error('Transacción cancelada');
      } else if (err.code === 'unavailable') {
  setMsg('Servicio no disponible. Revisa tu conexión.'); toast.error('Servicio no disponible');
      } else {
  setMsg(`Error al guardar: ${err.message}`); toast.error('Error al guardar');
      }
    }
  };

  // Lista de materiales disponibles para devolución
  const materiales = [
    { name: 'onu_rip', label: 'ONU RIP', icon: '📡', requiereModelo: true },
    { name: 'modem_funcional', label: 'Modem Funcional', icon: '📶', requiereModelo: true },
    { name: 'modem_rip', label: 'Modem RIP', icon: '📵', requiereModelo: true },
    { name: 'cable_ethernet', label: 'Cable Ethernet', icon: '🔌', requiereModelo: false },
    { name: 'roseta', label: 'Roseta', icon: '🔧', requiereModelo: false },
    { name: 'drop', label: 'Drop', icon: '📏', requiereModelo: false },
    { name: 'cargador', label: 'Cargador', icon: '🔋', requiereModelo: false },
    { name: 'poe', label: 'POE', icon: '⚡', requiereModelo: false },
    { name: 'bateria', label: 'Batería', icon: '🔋', requiereModelo: false },
    { name: 'isbs', label: 'ISBS', icon: '📺', requiereModelo: false },
  { name: 'radios', label: 'RADIOS', icon: '📻', requiereModelo: true },
    { name: 'nap', label: 'NAP', icon: '🏠', requiereModelo: false },
    { name: 'hcc', label: 'H.C.C.', icon: '🔗', requiereModelo: false },
    { name: 'hsc', label: 'H.S.C', icon: '🔗', requiereModelo: false },
    { name: 'spliters', label: 'SPLITERS', icon: '🔀', requiereModelo: false },
    { name: 'ccn', label: 'C.C.N', icon: '🔧', requiereModelo: false },
    { name: 'fleje', label: 'FLEJE', icon: '📎', requiereModelo: false },
    { name: 'fibra_24h', label: 'FIBRA DE 24 H', icon: '🌐', requiereModelo: false },
    { name: 'preformado', label: 'PREFORMADO', icon: '🔩', requiereModelo: false },
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

            {/* Sección de materiales devueltos con cantidades */}
            <h5 className="form-section-title">📋 Materiales devueltos (Cantidades)</h5>
            <div className="materials-grid">
              <div className="row">
                {materiales.map((material, index) => (
                  <div key={index} className="col-md-4 col-sm-6 mb-3">
                    <div className="material-quantity-input">
                      <label className="form-label material-label" htmlFor={material.name}>
                        {material.icon} {material.label}
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        id={material.name}
                        name={material.name}
                        min="0"
                        max="99"
                        value={form[material.name]}
                        onChange={handleChange}
                        placeholder="0"
                      />
                      
                      {/* Selector de modelo condicional */}
                      {material.requiereModelo && form[material.name] > 0 && (
                        <div className="mt-2">
                          <select
                            className="form-select form-select-sm"
                            name={`${material.name}_modelo`}
                            value={form[`${material.name}_modelo`] || ''}
                            onChange={handleChange}
                            required={form[material.name] > 0}
                          >
                            <option value="">-- Selecciona modelo --</option>
                            {(material.name === 'radios' ? modelosRadios : modelosEquipos).map((modelo, i) => (
                              <option key={i} value={modelo}>{modelo}</option>
                            ))}
                          </select>
                        </div>
                      )}
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
          <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
        </div>
      </div>
    </div>
  );
};

export default DevolucionMaterial;
