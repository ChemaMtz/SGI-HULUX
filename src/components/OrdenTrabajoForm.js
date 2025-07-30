// Importaciones necesarias para el componente de orden de trabajo
import React, { useState, useEffect } from "react"; // React hooks para estado y efectos
import { ToastContainer, toast } from "react-toastify"; // Notificaciones toast
import "react-toastify/dist/ReactToastify.css"; // Estilos para las notificaciones
import { db } from "../firebase/firebaseConfig"; // Configuración de Firebase
import { collection, addDoc, onSnapshot } from "firebase/firestore"; // Funciones de Firestore
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
    materiales: [{ cantidad: "", descripcion: "" }], // Inicia con una fila
    
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
      materiales: [...prev.materiales, { cantidad: "", descripcion: "" }],
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
   * 3. Guardar en Firebase con numeración automática
   * 4. Mostrar feedback al usuario
   * 5. Resetear formulario en caso de éxito
   * 6. Manejo de errores con alertas
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Procesar actividades: filtrar las seleccionadas y crear array
      const acts = Object.entries(formData.actividades)
        .filter(([k, v]) => k !== "otrosTexto" && v) // Excluir campo de texto y falsas
        .map(([k]) => k); // Obtener solo los nombres
      
      // Agregar texto personalizado si "Otros" está seleccionado
      if (formData.actividades.otros && formData.actividades.otrosTexto)
        acts.push(formData.actividades.otrosTexto);

      // Guardar en Firebase con numeración automática
      await addDoc(collection(db, "ordenesTrabajo"), {
        ...formData,
        actividades: acts, // Array procesado de actividades
        numero: numeroOrdenActual, // Número de orden calculado
      });

      // Feedback de éxito
      alert("Orden guardada exitosamente!");
      
      // Resetear formulario a estado inicial
      setFormData({
        fecha: "",
        hora: "",
        destino: "",
        actividades: {
          instalaciones: false,
          corteFO: false,
          cambioFO: false,
          soporteTecnico: false,
          retiroCancelacion: false,
          otros: false,
          otrosTexto: "",
        },
        materiales: [{ cantidad: "", descripcion: "" }],
        conduce: "",
        unidad: "",
        auxiliares: "",
        usoEfectivo: "",
        cantidadEfectivo: "",
        firmas: { reviso: "", autorizo: "", solicito: "" },
      });
    } catch (err) {
      // Manejo de errores
      console.error(err);
      alert("Error al guardar la orden: " + err.message);
    }
  };

  // Array de destinos disponibles para el selector
  const destinos = [
    "Ciudad de México",
    "Guadalajara",
    "Monterrey",
    "Puebla",
    "Querétaro",
    "Mérida",
    "Tijuana",
  ];

  return (
    <div className="container py-5">
      <form onSubmit={handleSubmit}>
        {/* Encabezado del formulario con branding y numeración */}
        <div className="text-center mb-4">
          <h1 className="text-primary">hulux®</h1>
          <h2 className="text-danger">{numeroOrdenActual}</h2>
          <h3>ORDEN DE TRABAJO EXTERNA/INTERNA</h3>
        </div>

        {/* Fila superior: Fecha, Destino, Hora */}
        <div className="row mb-3">
          <div className="col-md-4">Fecha: {formData.fecha}</div>
          <div className="col-md-4">
            <label className="form-label">Destino</label>
            <select className="form-select" name="destino" value={formData.destino} onChange={handleInputChange} required>
              <option value="">Seleccione un destino</option>
              {destinos.map((dest, i) => (
                <option key={i} value={dest}>{dest}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">Hora de salida: {formData.hora}</div>
        </div>

        {/* Sección de actividades con checkboxes dinámicos */}
        <div className="form-check mb-3">
          {Object.keys(formData.actividades).filter(k => k !== "otrosTexto").map((key) => (
            <div key={key} className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="checkbox"
                id={key}
                name={`actividad_${key}`}
                checked={formData.actividades[key]}
                onChange={handleInputChange}
              />
              <label className="form-check-label" htmlFor={key}>{key.replace(/([A-Z])/g, ' $1')}</label>
            </div>
          ))}
          {/* Campo de texto condicional para "Otros" */}
          {formData.actividades.otros && (
            <input
              type="text"
              name="otrosTexto"
              value={formData.actividades.otrosTexto}
              className="form-control mt-2"
              placeholder="Especificar otro..."
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                actividades: { ...prev.actividades, otrosTexto: e.target.value },
              }))}
            />
          )}
        </div>

        {/* Tabla dinámica de materiales */}
        <table className="table table-bordered">
          <thead className="table-primary">
            <tr>
              <th>Cantidad</th>
              <th>Descripción del Material</th>
            </tr>
          </thead>
          <tbody>
            {/* Renderizar filas dinámicamente basadas en el array de materiales */}
            {formData.materiales.map((mat, i) => (
              <tr key={i}>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={mat.cantidad}
                    onChange={(e) => handleMaterialChange(i, "cantidad", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    value={mat.descripcion}
                    onChange={(e) => handleMaterialChange(i, "descripcion", e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Botón para agregar más filas de materiales */}
        <button type="button" onClick={addMaterialRow} className="btn btn-success mb-4">+ Añadir material</button>

        {/* Sección de información de personal y recursos */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Conduce</label>
            <input className="form-control" type="text" name="conduce" value={formData.conduce} onChange={handleInputChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Unidad</label>
            <input className="form-control" type="text" name="unidad" value={formData.unidad} onChange={handleInputChange} />
          </div>
        </div>

        {/* Sección de auxiliares y manejo de efectivo */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Auxiliares</label>
            <input className="form-control" type="text" name="auxiliares" value={formData.auxiliares} onChange={handleInputChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label d-block">¿Usó efectivo?</label>
            {/* Radio buttons para selección de uso de efectivo */}
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="usoEfectivo" value="si" checked={formData.usoEfectivo === "si"} onChange={handleInputChange} />
              <label className="form-check-label">Sí</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="usoEfectivo" value="no" checked={formData.usoEfectivo === "no"} onChange={handleInputChange} />
              <label className="form-check-label">No</label>
            </div>
            {/* Campo condicional para cantidad de efectivo */}
            {formData.usoEfectivo === "si" && (
              <input
                type="number"
                className="form-control mt-2"
                name="cantidadEfectivo"
                value={formData.cantidadEfectivo}
                onChange={handleInputChange}
                placeholder="Cantidad $"
              />
            )}
          </div>
        </div>

        {/* Sección de firmas digitales */}
        <div className="row">
          {/* Generar componentes de firma para cada rol */}
          {['reviso','autorizo','solicito'].map(role => (
            <div className="col-md-4 mb-4" key={role}>
              <h5 className="text-center">{role.charAt(0).toUpperCase() + role.slice(1)}</h5>
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

        {/* Botón de envío del formulario */}
        <div className="text-center">
          <button type="submit" className="btn btn-danger btn-lg">Guardar Orden</button>
        </div>
      </form>
      
      {/* Contenedor de notificaciones toast */}
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default OrdenTrabajo;
