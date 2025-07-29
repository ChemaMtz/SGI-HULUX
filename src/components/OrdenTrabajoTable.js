import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrdenTrabajoTable = () => {
  const [ordenes, setOrdenes] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'ordenesTrabajo'), (snapshot) => {
      setOrdenes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const urlToBase64 = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      img.onerror = () => resolve(null);
    });
  };

  const generarPDF = async (orden) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Orden de Trabajo #${orden.numero || 'N/A'}`, 14, 20);

    const datosTabla = [
      ['Fecha', orden.fecha || 'N/A'],
      ['Hora', orden.hora || 'N/A'],
      ['Destino', orden.destino || 'N/A'],
      ['Conduce', orden.conduce || 'N/A'],
      ['Unidad', orden.unidad || 'N/A'],
      ['Auxiliares', orden.auxiliares || 'N/A'],
      ['Uso Efectivo', orden.usoEfectivo || 'N/A'],
      ['Cantidad Efectivo', orden.cantidadEfectivo || 'N/A'],
      ['Actividades', (orden.actividades || []).join(', ') || 'Sin actividades'],
      ['Materiales', (orden.materiales || []).map(m => `${m.cantidad} - ${m.descripcion}`).join('\n') || 'Sin materiales'],
    ];

    autoTable(doc, {
      startY: 30,
      head: [['Campo', 'Valor']],
      body: datosTabla,
    });

    const firmas = orden.firmas || {};
    let yStart = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text('Firmas:', 14, yStart);
    yStart += 6;

    const firmasProcesadas = await Promise.all([
      { label: 'Revisó', src: firmas.reviso },
      { label: 'Autorizó', src: firmas.autorizo },
      { label: 'Solicitó', src: firmas.solicito }
    ].map(async ({ label, src }) => {
      const base64 = src ? await urlToBase64(src) : null;
      return { label, base64 };
    }));

    firmasProcesadas.forEach((firma, index) => {
      const yPos = yStart + index * 50;
      doc.text(firma.label, 14, yPos);
      if (firma.base64) {
        doc.addImage(firma.base64, 'PNG', 14, yPos + 4, 60, 30);
      } else {
        doc.text('Sin firma', 14, yPos + 20);
      }
    });

    doc.save(`OrdenTrabajo_${orden.numero || 'sin_numero'}.pdf`);
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center text-success mb-4">Órdenes de Trabajo</h3>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle text-center">
          <thead className="table-success">
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Destino</th>
              <th>Actividades</th>
              <th>Materiales</th>
              <th>Conduce</th>
              <th>Unidad</th>
              <th>Auxiliares</th>
              <th>Uso Efectivo</th>
              <th>Cantidad Efectivo</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.length > 0 ? (
              ordenes.map((o) => (
                <tr key={o.id}>
                  <td>{o.numero || 'N/A'}</td>
                  <td>{o.fecha || 'N/A'}</td>
                  <td>{o.hora || 'N/A'}</td>
                  <td>{o.destino || 'N/A'}</td>
                  <td>{Array.isArray(o.actividades) && o.actividades.length > 0
                    ? o.actividades.join(', ')
                    : <em className="text-muted">Sin actividades</em>}</td>
                  <td>
                    {Array.isArray(o.materiales) && o.materiales.length > 0
                      ? o.materiales.map((m, i) => (
                        <div key={i}>
                          {m.cantidad} - {m.descripcion}
                        </div>
                      ))
                      : <em className="text-muted">Sin materiales</em>}
                  </td>
                  <td>{o.conduce || 'N/A'}</td>
                  <td>{o.unidad || 'N/A'}</td>
                  <td>{o.auxiliares || 'N/A'}</td>
                  <td>{o.usoEfectivo || 'N/A'}</td>
                  <td>{o.cantidadEfectivo || 'N/A'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => generarPDF(o)}
                    >
                      Descargar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" className="text-center text-muted">
                  No hay órdenes de trabajo registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdenTrabajoTable;
