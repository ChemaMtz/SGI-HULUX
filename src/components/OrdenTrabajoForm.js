// Importaciones necesarias para el componente de orden de trabajo
import React, { useState, useEffect } from "react"; // React hooks para estado y efectos
import { ToastContainer, toast } from "react-toastify"; // Notificaciones toast
import "react-toastify/dist/ReactToastify.css"; // Estilos para las notificaciones
import { db, auth } from "../firebase/firebaseConfig"; // Configuración de Firebase
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore"; // Funciones de Firestore
import { getSafeSequence } from '../firebase/counters';
import { validateOrdenTrabajo } from '../utils/validation';
import SignaturePad from "../components/SignaturePad"; // Componente personalizado para firmas
import "bootstrap/dist/css/bootstrap.min.css"; // Framework CSS Bootstrap

/**
 * Componente OrdenTrabajo
 * 
 * Formulario complejo para crear y gestionar órdenes de trabajo externas/internas.
 * Incluye funcionalidades avanzadas como:
 * - Numeración automática de órdenes
 * - Fecha y hora en tiempo real
 * - Gestión dinámica de materiales
 * - Múltiples tipos de actividades
 * - Sistema de firmas digitales
 * - Validación y guardado en Firebase
 * - Notificaciones de usuario
 * 
 * Características principales:
 * - Formulario responsive con Bootstrap
 * - Estado complejo con objetos anidados
 * - Integración con base de datos en tiempo real
 * - Captura de firmas digitales
 * - Validación de campos requeridos
 * - Feedback visual con toast notifications
 */
// Generador simple de IDs estables para filas dinámicas
const genMatId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const OrdenTrabajo = () => {
  // Estado para almacenar todas las órdenes existentes (para numeración automática)
  const [ordenes, setOrdenes] = useState([]);
  
  // Sistema de numeración automática de órdenes
  const numeroBase = 1; // Número base para comenzar la numeración
  const numeroOrdenActual = numeroBase + ordenes.length; // Calcula el siguiente número

  // Estado principal del formulario con estructura compleja
  const [formData, setFormData] = useState({
    fecha: "", // Fecha actual (se establece automáticamente)
    hora: "", // Hora actual (se actualiza cada minuto)
    destino: "", // Ciudad de destino seleccionada
    
    // Objeto para gestionar diferentes tipos de actividades
    actividades: {
      Instalaciones: false,
      CorteFO: false, // Corte de Fibra Óptica
      CambioFO: false, // Cambio de Fibra Óptica
      SoporteTecnico: false,
      RetiroCancelacion: false,
      Otros: false,
      OtrosTexto: "", // Campo de texto cuando se selecciona "Otros"
    },
    
    // Array dinámico para gestionar materiales
  materiales: [{ id: genMatId(), cantidad: "", descripcion: "" }], // Inicia con una fila
    
    // Campos de información de personal y recursos
    conduce: "", // Persona que conduce
    unidad: "", // Vehículo o unidad utilizada
    auxiliares: "", // Personal auxiliar
    usoEfectivo: "", // Si/No para uso de dinero en efectivo
    cantidadEfectivo: "", // Cantidad de efectivo utilizado
    
    // Objeto para almacenar las firmas digitales
    firmas: {
      reviso: "", // Firma de quien revisa
      autorizo: "", // Firma de quien autoriza
      solicito: "", // Firma de quien solicita
    },
  });

  // Efecto principal para inicialización y configuración de listeners
  useEffect(() => {
    // Configurar fecha y hora inicial
    const today = new Date();
    setFormData((prev) => ({
      ...prev,
      fecha: today.toLocaleDateString("es-ES"), // Formato español
      hora: today.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    }));

    // Configurar actualización automática de hora cada minuto
    const interval = setInterval(() => {
      const now = new Date();
      setFormData((prev) => ({
        ...prev,
        hora: now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      }));
    }, 60000); // 60000ms = 1 minuto

    // Listener para obtener órdenes existentes en tiempo real (para numeración)
    const unsub = onSnapshot(collection(db, "ordenesTrabajo"), (snap) => {
      setOrdenes(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // Cleanup: limpiar interval y cancelar suscripción al desmontar componente
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);

  /**
   * Manejador principal para cambios en inputs del formulario
   * 
   * @param {Event} e - Evento del input
   * 
   * Gestiona diferentes tipos de inputs:
   * - Campos de actividades (checkboxes y texto)
   * - Campos regulares del formulario
   * - Mantiene la inmutabilidad del estado
   */
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Manejo especial para campos de actividades
    if (name.startsWith("actividad_")) {
      const key = name.split("_")[1]; // Extraer el nombre de la actividad
      setFormData((prev) => ({
        ...prev,
        actividades: {
          ...prev.actividades,
          [key]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      // Manejo de campos regulares
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  /**
   * Manejador para cambios en la tabla de materiales
   * 
   * @param {number} i - Índice de la fila de material
   * @param {string} field - Campo a modificar ('cantidad' o 'descripcion')
   * @param {string} val - Nuevo valor
   * 
   * Permite edición dinámica de la tabla de materiales
   * manteniendo la inmutabilidad del estado
   */
  const handleMaterialChange = (i, field, val) => {
    const mats = [...formData.materiales]; // Copia del array
    mats[i][field] = val; // Modificar el campo específico
    setFormData((prev) => ({ ...prev, materiales: mats }));
  };

  /**
   * Función para agregar una nueva fila de material
   * 
   * Expande dinámicamente la tabla de materiales
   * con una nueva fila vacía
   */
  const addMaterialRow = () => {
    setFormData((prev) => ({
      ...prev,
      materiales: [...prev.materiales, { id: genMatId(), cantidad: "", descripcion: "" }],
    }));
  };

  /**
   * Manejador del envío del formulario
   * 
   * @param {Event} e - Evento de submit del formulario
   * 
   * Proceso completo de guardado:
   * 1. Prevenir comportamiento por defecto
   * 2. Procesar actividades seleccionadas
   * 3. Usar transacción para obtener número único
   * 4. Guardar en Firebase con numeración garantizada
   * 5. Mostrar feedback al usuario
   * 6. Resetear formulario en caso de éxito
   * 7. Manejo de errores con alertas
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validación & sanitización previa
      const { valid, errors, clean } = validateOrdenTrabajo(formData);
      if (!valid) {
        errors.forEach(err => toast.error(err));
        return; // Detener envío
      }
      // Procesar actividades: filtrar las seleccionadas y crear array
      const acts = Object.entries(clean.actividades)
        .filter(([k, v]) => k !== "otrosTexto" && v)
        .map(([k]) => k);

      // Agregar texto personalizado si "Otros" está seleccionado
      if (clean.actividades.otros && clean.actividades.otrosTexto)
        acts.push(clean.actividades.otrosTexto);

      // Obtener número único vía método seguro (callable + fallback local)
      const siguienteNumero = await getSafeSequence('ordenesTrabajo');
      // Formatear número con prefijo y padding (coincidirá con reglas endurecidas si se aplican)
      const numeroSecuencial = siguienteNumero;
      const numeroFormateado = `OT-${String(siguienteNumero).padStart(5,'0')}`;

      // Usuario
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

      await addDoc(collection(db, 'ordenesTrabajo'), {
        ...clean,
        actividades: acts,
        numero: numeroFormateado,      // Número legible / formateado
        numeroSecuencial,              // Número puro para ordenación si se requiere
        creadoPor: infoUsuario,
        creadoEn: serverTimestamp(),
      });

      // Feedback de éxito
  toast.success("Orden guardada exitosamente");
      
      // Resetear formulario a estado inicial
      setFormData({
        fecha: "",
        hora: "",
        destino: "",
        actividades: {
          Instalaciones: false,
          CorteFO: false,
          CambioFO: false,
          SoporteTecnico: false,
          RetiroCancelacion: false,
          Otros: false,
          OtrosTexto: "",
        },
  materiales: [{ id: genMatId(), cantidad: "", descripcion: "" }],
        conduce: "",
        unidad: "",
        auxiliares: "",
        usoEfectivo: "",
        cantidadEfectivo: "",
        firmas: { reviso: "", autorizo: "", solicito: "" },
      });
      
      // Restablecer fecha y hora actuales
      const today = new Date();
      setFormData((prev) => ({
        ...prev,
        fecha: today.toLocaleDateString("es-ES"),
        hora: today.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      }));
      
    } catch (err) {
      // Manejo de errores específicos
      console.error("Error completo:", err);
      
      if (err.code === 'aborted') {
  toast.error("Transacción cancelada. Intenta nuevamente.");
      } else if (err.code === 'unavailable') {
  toast.error("Servicio no disponible. Revisa tu conexión.");
      } else {
  toast.error("Error al guardar: " + err.message);
      }
    }
  };

  return (
    <div className="page-container">
      <div className="container">
        <form onSubmit={handleSubmit}>
          {/* Encabezado del formulario con branding y numeración */}
          <div className="order-header">
            <h1>Hulux®</h1>
            <h2>{numeroOrdenActual}</h2>
            <h3>📋 ORDEN DE TRABAJO EXTERNA/INTERNA</h3>
          </div>

          {/* Información básica */}
          <div className="order-section">
            <h4 className="section-title">📅 Información General</h4>
            <div className="row">
              <div className="col-md-4">
                <div className="info-display">
                  <strong>📅 Fecha:</strong> {formData.fecha}
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label">🎯 Destino</label>
                <input 
                  className="form-control" 
                  type="text"
                  name="destino" 
                  value={formData.destino} 
                  onChange={handleInputChange} 
                  placeholder="Municipio, Localidad"
                  required
                />
              </div>
              <div className="col-md-4">
                <div className="info-display">
                  <strong>🕐 Hora de salida:</strong> {formData.hora}
                </div>
              </div>
            </div>
          </div>

          {/* Sección de actividades */}
          <div className="order-section">
            <h4 className="section-title">🔧 Actividades a Realizar</h4>
            <div className="activities-grid">
              <div className="row">
                {Object.keys(formData.actividades).filter(k => k !== "otrosTexto").map((key) => (
                  <div key={key} className="col-md-6 col-lg-4">
                    <div className="form-check activity-checkbox">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={key}
                        name={`actividad_${key}`}
                        checked={formData.actividades[key]}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor={key}>
                        {key.replace(/([A-Z])/g, ' $1')}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              {/* Campo de texto condicional para "Otros" */}
              {formData.actividades.otros && (
                <div className="mt-3">
                  <input
                    type="text"
                    name="otrosTexto"
                    value={formData.actividades.otrosTexto}
                    className="form-control"
                    placeholder="✏️ Especificar otro tipo de actividad..."
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      actividades: { ...prev.actividades, otrosTexto: e.target.value },
                    }))}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sección de materiales */}
          <div className="order-section">
            <h4 className="section-title">📦 Materiales Utilizados</h4>
            <div className="materials-table">
              <table className="table table-bordered mb-0">
                <thead className="table-primary">
                  <tr>
                    <th>📊 Cantidad</th>
                    <th>📝 Descripción del Material</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Renderizar filas dinámicamente basadas en el array de materiales */}
                  {formData.materiales.map((mat, i) => (
                    <tr key={mat.id || i}>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={mat.cantidad}
                          placeholder="Ej: 5"
                          onChange={(e) => handleMaterialChange(i, "cantidad", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-control"
                          value={mat.descripcion}
                          placeholder="Ej: Cable de fibra óptica"
                          onChange={(e) => handleMaterialChange(i, "descripcion", e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Botón para agregar más filas de materiales */}
            <div className="mt-3">
              <button type="button" onClick={addMaterialRow} className="btn btn-add-material">
                ➕ Añadir material
              </button>
            </div>
          </div>

          {/* Sección de información de personal */}
          <div className="order-section">
            <h4 className="section-title">👥 Personal y Recursos</h4>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">🚗 Conduce</label>
                <input 
                  className="form-control" 
                  type="text" 
                  name="conduce" 
                  value={formData.conduce} 
                  onChange={handleInputChange}
                  placeholder="Nombre del conductor"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">🚐 Unidad</label>
                <input 
                  className="form-control" 
                  type="text" 
                  name="unidad" 
                  value={formData.unidad} 
                  onChange={handleInputChange}
                  placeholder="Identificación de la unidad"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <label className="form-label">👷 Auxiliares</label>
                <input 
                  className="form-control" 
                  type="text" 
                  name="auxiliares" 
                  value={formData.auxiliares} 
                  onChange={handleInputChange}
                  placeholder="Nombres del personal auxiliar"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label d-block">💰 ¿Usó efectivo?</label>
                <div className="activities-grid">
                  <div className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="usoEfectivo" 
                      value="si" 
                      checked={formData.usoEfectivo === "si"} 
                      onChange={handleInputChange} 
                    />
                    <label className="form-check-label">Sí</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="usoEfectivo" 
                      value="no" 
                      checked={formData.usoEfectivo === "no"} 
                      onChange={handleInputChange} 
                    />
                    <label className="form-check-label">No</label>
                  </div>
                  {/* Campo condicional para cantidad de efectivo */}
                  {formData.usoEfectivo === "si" && (
                    <div className="mt-2">
                      <input
                        type="number"
                        className="form-control"
                        name="cantidadEfectivo"
                        value={formData.cantidadEfectivo}
                        onChange={handleInputChange}
                        placeholder="💵 Cantidad en pesos $"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sección de firmas digitales */}
          <div className="signature-section">
            <h4 className="section-title">✍️ Firmas de Autorización</h4>
            <div className="row">
              {/* Generar componentes de firma para cada rol */}
              {['reviso','autorizo','solicito'].map(role => (
                <div className="col-md-4 mb-4" key={role}>
                  <h5 className="signature-title">
                    {role === 'reviso' && '👁️ Revisó'}
                    {role === 'autorizo' && '✅ Autorizó'}
                    {role === 'solicito' && '📋 Solicitó'}
                  </h5>
                  {/* Componente SignaturePad personalizado */}
                  <SignaturePad
                    onSave={(sig) => {
                      // Guardar firma en el estado y mostrar notificación
                      setFormData(prev => ({ ...prev, firmas: { ...prev.firmas, [role]: sig } }));
                      toast.success(`Firma de "${role}" guardada correctamente!`);
                    }}
                    onClear={() => setFormData(prev => ({ ...prev, firmas: { ...prev.firmas, [role]: '' } }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Botón de envío del formulario */}
          <div className="text-center">
            <button type="submit" className="btn btn-submit-order">
              💾 Guardar Orden de Trabajo
            </button>
          </div>
        </form>
        
        {/* Contenedor de notificaciones toast */}
        <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      </div>
    </div>
  );
};

export default OrdenTrabajo;
