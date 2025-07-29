import React, { useEffect, useState } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MaterialTable = () => {
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'devolucionesMaterial'), (snapshot) => {
      setRegistros(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const generarPDF = (r) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Devolución de Material', 14, 20);

    const datos = [
      ['Número de Orden', r.numero_orden || '-'],
      ['Fecha', r.fecha || '-'],
      ['Cliente', r.cliente || '-'],
      ['Actividad', r.actividad || '-'],
      ['Modelo de ONU', r.modelo_onu_funcional || '-'],
      ['ONU RIP', r.onu_rip ? 'Sí' : 'No'],
      ['Modem Funcional', r.modem_funcional ? 'Sí' : 'No'],
      ['Modem RIP', r.modem_rip ? 'Sí' : 'No'],
      ['Cable Ethernet', r.cable_ethernet ? 'Sí' : 'No'],
      ['Roseta', r.roseta ? 'Sí' : 'No'],
      ['Drop', r.drop ? 'Sí' : 'No'],
      ['Cargador', r.cargador ? 'Sí' : 'No'],
      ['POE', r.poe ? 'Sí' : 'No'],
      ['Batería', r.bateria ? 'Sí' : 'No'],
      ['Observaciones', r.observaciones || 'Sin observaciones'],
    ];

    autoTable(doc, {
      startY: 30,
      head: [['Campo', 'Valor']],
      body: datos,
    });

    const nombre = r.cliente?.replaceAll(' ', '_') || 'registro';
    doc.save(`Devolucion_${r.numero_orden || nombre}.pdf`);
  };

  return (
    <div className="container mt-4">
      <h3 className="text-center text-primary mb-4">Registros de Devolución de Materiales</h3>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle text-center">
          <thead className="table-dark">
            <tr>
              <th># Orden</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Actividad</th>
              <th>Modelo ONU</th>
              <th>ONU RIP</th>
              <th>Modem Func.</th>
              <th>Modem RIP</th>
              <th>Cable Eth.</th>
              <th>Roseta</th>
              <th>Drop</th>
              <th>Cargador</th>
              <th>POE</th>
              <th>Batería</th>
              <th>Observaciones</th>
              <th>PDF</th>
            </tr>
          </thead>
          <tbody>
            {registros.length > 0 ? (
              registros.map(r => (
                <tr key={r.id}>
                  <td>{r.numero_orden || '-'}</td>
                  <td>{r.fecha || '-'}</td>
                  <td>{r.cliente || '-'}</td>
                  <td>{r.actividad || '-'}</td>
                  <td>{r.modelo_onu_funcional || '-'}</td>
                  <td>{r.onu_rip ? '✓' : '-'}</td>
                  <td>{r.modem_funcional ? '✓' : '-'}</td>
                  <td>{r.modem_rip ? '✓' : '-'}</td>
                  <td>{r.cable_ethernet ? '✓' : '-'}</td>
                  <td>{r.roseta ? '✓' : '-'}</td>
                  <td>{r.drop ? '✓' : '-'}</td>
                  <td>{r.cargador ? '✓' : '-'}</td>
                  <td>{r.poe ? '✓' : '-'}</td>
                  <td>{r.bateria ? '✓' : '-'}</td>
                  <td>{r.observaciones || 'Sin observaciones'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => generarPDF(r)}>
                      Descargar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="16">No hay registros de devolución</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialTable;
