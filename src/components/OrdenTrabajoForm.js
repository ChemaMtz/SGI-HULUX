import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, onSnapshot } from "firebase/firestore";
import SignaturePad from "../components/SignaturePad";
import "bootstrap/dist/css/bootstrap.min.css";

const OrdenTrabajo = () => {
  const [ordenes, setOrdenes] = useState([]);
  const numeroBase = 1;
  const numeroOrdenActual = numeroBase + ordenes.length;

  const [formData, setFormData] = useState({
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
    materiales: [{ cantidad: "", descripcion: "" }],
    conduce: "",
    unidad: "",
    auxiliares: "",
    usoEfectivo: "",
    cantidadEfectivo: "",
    firmas: {
      reviso: "",
      autorizo: "",
      solicito: "",
    },
  });

  useEffect(() => {
    const today = new Date();
    setFormData((prev) => ({
      ...prev,
      fecha: today.toLocaleDateString("es-ES"),
      hora: today.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    }));

    const interval = setInterval(() => {
      const now = new Date();
      setFormData((prev) => ({
        ...prev,
        hora: now.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      }));
    }, 60000);

    const unsub = onSnapshot(collection(db, "ordenesTrabajo"), (snap) => {
      setOrdenes(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("actividad_")) {
      const key = name.split("_")[1];
      setFormData((prev) => ({
        ...prev,
        actividades: {
          ...prev.actividades,
          [key]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMaterialChange = (i, field, val) => {
    const mats = [...formData.materiales];
    mats[i][field] = val;
    setFormData((prev) => ({ ...prev, materiales: mats }));
  };

  const addMaterialRow = () => {
    setFormData((prev) => ({
      ...prev,
      materiales: [...prev.materiales, { cantidad: "", descripcion: "" }],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const acts = Object.entries(formData.actividades)
        .filter(([k, v]) => k !== "otrosTexto" && v)
        .map(([k]) => k);
      if (formData.actividades.otros && formData.actividades.otrosTexto)
        acts.push(formData.actividades.otrosTexto);

      await addDoc(collection(db, "ordenesTrabajo"), {
        ...formData,
        actividades: acts,
        numero: numeroOrdenActual,
      });

      alert("Orden guardada exitosamente!");
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
      console.error(err);
      alert("Error al guardar la orden: " + err.message);
    }
  };

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
        <div className="text-center mb-4">
          <h1 className="text-primary">hulux®</h1>
          <h2 className="text-danger">{numeroOrdenActual}</h2>
          <h3>ORDEN DE TRABAJO EXTERNA/INTERNA</h3>
        </div>

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

        <table className="table table-bordered">
          <thead className="table-primary">
            <tr>
              <th>Cantidad</th>
              <th>Descripción del Material</th>
            </tr>
          </thead>
          <tbody>
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
        <button type="button" onClick={addMaterialRow} className="btn btn-success mb-4">+ Añadir material</button>

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

        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label">Auxiliares</label>
            <input className="form-control" type="text" name="auxiliares" value={formData.auxiliares} onChange={handleInputChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label d-block">¿Usó efectivo?</label>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="usoEfectivo" value="si" checked={formData.usoEfectivo === "si"} onChange={handleInputChange} />
              <label className="form-check-label">Sí</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="radio" name="usoEfectivo" value="no" checked={formData.usoEfectivo === "no"} onChange={handleInputChange} />
              <label className="form-check-label">No</label>
            </div>
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

        <div className="row">
          {['reviso','autorizo','solicito'].map(role => (
            <div className="col-md-4 mb-4" key={role}>
              <h5 className="text-center">{role.charAt(0).toUpperCase() + role.slice(1)}</h5>
              <SignaturePad
                onSave={(sig) => {
                  setFormData(prev => ({ ...prev, firmas: { ...prev.firmas, [role]: sig } }));
                  toast.success(`Firma de "${role}" guardada correctamente!`);
                }}
                onClear={() => setFormData(prev => ({ ...prev, firmas: { ...prev.firmas, [role]: '' } }))}
              />
            </div>
          ))}
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-danger btn-lg">Guardar Orden</button>
        </div>
      </form>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default OrdenTrabajo;
