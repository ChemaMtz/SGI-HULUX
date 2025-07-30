// Importaciones necesarias: React, Firebase Firestore
import React, { useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';

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

  // Enviar formulario y guardar en Firebase
  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');

    try {
      // Obtener el siguiente número de orden automáticamente
      const snapshot = await getDocs(collection(db, 'devolucionesMaterial'));
      const nuevoNumero = snapshot.size + 1;
      const numeroOrden = `ORD-${String(nuevoNumero).padStart(3, '0')}`;

      // Guardar registro en Firestore
      await addDoc(collection(db, 'devolucionesMaterial'), {
        ...form,
        numero_orden: numeroOrden,
      });

      alert(`Orden guardada correctamente: ${numeroOrden}`);
      setMsg('Registro guardado exitosamente');
      setForm(initialState); // Resetear formulario
    } catch (err) {
      setMsg(`Error al guardar: ${err.message}`);
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
    <div className="container py-4">
      <h2 className="text-center mb-4">Devolución de Material</h2>

      {/* Formulario de devolución */}
      <form onSubmit={handleSubmit} className="bg-light p-4 rounded shadow">
        {/* Campo de fecha */}
        <div className="mb-3">
          <label htmlFor="fecha" className="form-label">Fecha:</label>
          <input type="date" className="form-control" id="fecha" name="fecha" value={form.fecha} onChange={handleChange} required />
        </div>

        {/* Campo de cliente */}
        <div className="mb-3">
          <label htmlFor="cliente" className="form-label">Cliente:</label>
          <input type="text" className="form-control" id="cliente" name="cliente" placeholder="Nombre del cliente" value={form.cliente} onChange={handleChange} required />
        </div>

        {/* Campo de actividad */}
        <div className="mb-3">
          <label htmlFor="actividad" className="form-label">Actividad:</label>
          <input type="text" className="form-control" id="actividad" name="actividad" placeholder="Descripción de la actividad" value={form.actividad} onChange={handleChange} />
        </div>

        {/* Selector de modelo ONU */}
        <div className="mb-3">
          <label htmlFor="modelo_onu_funcional" className="form-label">Modelo de ONU:</label>
          <select className="form-select" id="modelo_onu_funcional" name="modelo_onu_funcional" value={form.modelo_onu_funcional} onChange={handleChange} required>
            <option value="">-- Selecciona un modelo --</option>
            {modelosONU.map((modelo, i) => (
              <option key={i} value={modelo}>{modelo}</option>
            ))}
          </select>
        </div>

        {/* Sección de materiales devueltos con checkboxes */}
        <h5 className="mt-4">Materiales devueltos:</h5>
        <div className="row">
          {materiales.map((material, index) => (
            <div key={index} className="col-md-4 mb-2">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id={material.name}
                  name={material.name}
                  checked={form[material.name]}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor={material.name}>{material.label}</label>
              </div>
            </div>
          ))}
        </div>

        {/* Campo de observaciones */}
        <div className="mb-3 mt-3">
          <label htmlFor="observaciones" className="form-label">Observaciones:</label>
          <textarea className="form-control" id="observaciones" name="observaciones" rows="3" placeholder="Notas adicionales..." value={form.observaciones} onChange={handleChange}></textarea>
        </div>

        {/* Botón de envío */}
        <button type="submit" className="btn btn-success w-100">Guardar Devolución</button>
      </form>

      {/* Mensaje de confirmación o error */}
      {msg && (
        <div className={`alert mt-3 ${msg.includes('Error') ? 'alert-danger' : 'alert-success'}`} role="alert">
          {msg}
        </div>
      )}
    </div>
  );
};

export default DevolucionMaterial;
