// Importaciones necesarias para el componente
import React, { useEffect, useState } from 'react'; // React hooks para estado y efectos
import { db } from '../firebase/firebaseConfig'; // Configuración de Firebase
import { collection, onSnapshot } from 'firebase/firestore'; // Funciones de Firestore para escuchar cambios en tiempo real
import jsPDF from 'jspdf'; // Librería para generar documentos PDF
import autoTable from 'jspdf-autotable'; // Plugin para crear tablas automáticamente en PDF
import '../App.css'; // Importar estilos

/**
 * Componente MaterialTable
 * 
 * Este componente muestra una tabla con todos los registros de devolución de materiales
 * almacenados en Firebase Firestore. Permite visualizar la información en tiempo real
 * y generar reportes PDF individuales para cada registro.
 * 
 * Características principales:
 * - Escucha cambios en tiempo real desde Firebase
 * - Ordena registros por número de orden
 * - Genera reportes PDF personalizados
 * - Interfaz responsive con Bootstrap
 * - Indicadores visuales para materiales devueltos
 */
const MaterialTable = () => {
  // Estado para almacenar todos los registros de devolución
  const [registros, setRegistros] = useState([]);

  // Efecto para escuchar cambios en tiempo real desde Firebase
  useEffect(() => {
    // Configurar listener para la colección 'devolucionesMaterial'
    const unsub = onSnapshot(collection(db, 'devolucionesMaterial'), (snapshot) => {
      // Actualizar estado con los documentos obtenidos, incluyendo el ID
      setRegistros(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    // Cleanup: cancelar la suscripción cuando el componente se desmonte
    return () => unsub();
  }, []);

  /**
   * Función para generar un reporte PDF de un registro específico
   * 
   * @param {Object} r - Objeto del registro de devolución
   * 
   * Esta función crea un documento PDF personalizado que incluye:
   * - Título del documento
   * - Tabla con todos los campos del registro
   * - Formato profesional con autoTable
   * - Nombre de archivo basado en cliente y número de orden
   */
  const generarPDF = (r) => {
    // Crear nuevo documento PDF
    const doc = new jsPDF();
    
    // Configurar título del documento
    doc.setFontSize(16);
    doc.text('Devolución de Material', 14, 20);

    // Preparar datos para la tabla PDF
    // Cada elemento es un array con [etiqueta, valor]
    const datos = [
      ['Número de Orden', r.numero_orden || '-'],
      ['Fecha', r.fecha || '-'],
      ['Cliente', r.cliente || '-'],
      ['Actividad', r.actividad || '-'],
      ['ONU RIP', r.onu_rip > 0 ? `${r.onu_rip} unidades${r.onu_rip_modelo ? ` - Modelo: ${r.onu_rip_modelo}` : ''}` : '0'],
      ['Modem Funcional', r.modem_funcional > 0 ? `${r.modem_funcional} unidades${r.modem_funcional_modelo ? ` - Modelo: ${r.modem_funcional_modelo}` : ''}` : '0'],
      ['Modem RIP', r.modem_rip > 0 ? `${r.modem_rip} unidades${r.modem_rip_modelo ? ` - Modelo: ${r.modem_rip_modelo}` : ''}` : '0'],
      ['Cable Ethernet', r.cable_ethernet > 0 ? `${r.cable_ethernet} unidades` : '0'],
      ['Roseta', r.roseta > 0 ? `${r.roseta} unidades` : '0'],
      ['Drop', r.drop > 0 ? `${r.drop} unidades` : '0'],
      ['Cargador', r.cargador > 0 ? `${r.cargador} unidades` : '0'],
      ['POE', r.poe > 0 ? `${r.poe} unidades` : '0'],
      ['Batería', r.bateria > 0 ? `${r.bateria} unidades` : '0'],
      ['ISBS', r.isbs > 0 ? `${r.isbs} unidades` : '0'],
      ['RADIOS', r.radios > 0 ? `${r.radios} unidades` : '0'],
      ['NAP', r.nap > 0 ? `${r.nap} unidades` : '0'],
      ['H.C.C.', r.hcc > 0 ? `${r.hcc} unidades` : '0'],
      ['H.S.C', r.hsc > 0 ? `${r.hsc} unidades` : '0'],
      ['SPLITERS', r.spliters > 0 ? `${r.spliters} unidades` : '0'],
      ['C.C.N', r.ccn > 0 ? `${r.ccn} unidades` : '0'],
      ['FLEJE', r.fleje > 0 ? `${r.fleje} unidades` : '0'],
      ['FIBRA DE 24 H', r.fibra_24h > 0 ? `${r.fibra_24h} unidades` : '0'],
      ['PREFORMADO', r.preformado > 0 ? `${r.preformado} unidades` : '0'],
      ['Observaciones', r.observaciones || 'Sin observaciones'],
      ['Creado por', r.creadoPor ? `${r.creadoPor.nombreCompleto} (${r.creadoPor.email})` : 'Sin información'],
      ['Fecha de creación', r.creadoPor && r.creadoPor.fechaCreacion ? 
        (r.creadoPor.fechaCreacion.toDate ? r.creadoPor.fechaCreacion.toDate().toLocaleString('es-ES') : r.creadoPor.fechaCreacion.toString()) : 'N/A'],
    ];

    // Generar tabla automática en el PDF
    autoTable(doc, {
      startY: 30, // Posición Y donde comienza la tabla
      head: [['Campo', 'Valor']], // Encabezados de la tabla
      body: datos, // Datos de la tabla
    });

    // Generar nombre de archivo dinámico
    // Reemplazar espacios por guiones bajos para compatibilidad
    const nombre = r.cliente?.replaceAll(' ', '_') || 'registro';
    doc.save(`Devolucion_${r.numero_orden || nombre}.pdf`);
  };

  return (
    <div className="table-container">
      {/* Título principal de la tabla */}
      <h3 className="table-title">📦 Registros de Devolución de Materiales</h3>

      {/* Contenedor responsive para la tabla */}
      <div className="table-responsive">
        <table className="table custom-table table-hover align-middle text-center">
          {/* Encabezado de la tabla con estilos Bootstrap */}
          <thead>
            <tr>
              <th># Orden</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Actividad</th>
              <th>ONU RIP</th>
              <th>Modem Func.</th>
              <th>Modem RIP</th>
              <th>Cable Eth.</th>
              <th>Roseta</th>
              <th>Drop</th>
              <th>Cargador</th>
              <th>POE</th>
              <th>Batería</th>
              <th>ISBS</th>
              <th>RADIOS</th>
              <th>NAP</th>
              <th>H.C.C.</th>
              <th>H.S.C</th>
              <th>SPLITERS</th>
              <th>C.C.N</th>
              <th>FLEJE</th>
              <th>FIBRA 24H</th>
              <th>PREFORMADO</th>
              <th>Observaciones</th>
              <th>Creado Por</th>
              <th>PDF</th>
            </tr>
          </thead>
          {/* Cuerpo de la tabla con datos dinámicos */}
          <tbody>
            {registros.length > 0 ? (
              // Si hay registros, ordenarlos y mostrarlos
              [...registros].sort((a, b) => {
                // Algoritmo de ordenamiento por número de orden
                // Extraer solo los números, ignorando prefijos como 'ORD-'
                const numA = parseInt((a.numero_orden || '').replace(/\D/g, '')) || 0;
                const numB = parseInt((b.numero_orden || '').replace(/\D/g, '')) || 0;
                return numA - numB; // Orden ascendente
              }).map(r => (
                // Renderizar cada registro como una fila
                <tr key={r.id}>
                  {/* Información básica del registro */}
                  <td><strong>{r.numero_orden || '-'}</strong></td>
                  <td>{r.fecha || '-'}</td>
                  <td>{r.cliente || '-'}</td>
                  <td>{r.actividad || '-'}</td>
                  
                  {/* Materiales devueltos - Mostrar cantidad y modelo */}
                  <td>
                    {r.onu_rip > 0 ? (
                      <div>
                        <strong>{r.onu_rip}</strong>
                        {r.onu_rip_modelo && <div className="small text-muted">{r.onu_rip_modelo}</div>}
                      </div>
                    ) : '-'}
                  </td>
                  <td>
                    {r.modem_funcional > 0 ? (
                      <div>
                        <strong>{r.modem_funcional}</strong>
                        {r.modem_funcional_modelo && <div className="small text-muted">{r.modem_funcional_modelo}</div>}
                      </div>
                    ) : '-'}
                  </td>
                  <td>
                    {r.modem_rip > 0 ? (
                      <div>
                        <strong>{r.modem_rip}</strong>
                        {r.modem_rip_modelo && <div className="small text-muted">{r.modem_rip_modelo}</div>}
                      </div>
                    ) : '-'}
                  </td>
                  <td>{r.cable_ethernet > 0 ? <strong>{r.cable_ethernet}</strong> : '-'}</td>
                  <td>{r.roseta > 0 ? <strong>{r.roseta}</strong> : '-'}</td>
                  <td>{r.drop > 0 ? <strong>{r.drop}</strong> : '-'}</td>
                  <td>{r.cargador > 0 ? <strong>{r.cargador}</strong> : '-'}</td>
                  <td>{r.poe > 0 ? <strong>{r.poe}</strong> : '-'}</td>
                  <td>{r.bateria > 0 ? <strong>{r.bateria}</strong> : '-'}</td>
                  <td>{r.isbs > 0 ? <strong>{r.isbs}</strong> : '-'}</td>
                  <td>{r.radios > 0 ? <strong>{r.radios}</strong> : '-'}</td>
                  <td>{r.nap > 0 ? <strong>{r.nap}</strong> : '-'}</td>
                  <td>{r.hcc > 0 ? <strong>{r.hcc}</strong> : '-'}</td>
                  <td>{r.hsc > 0 ? <strong>{r.hsc}</strong> : '-'}</td>
                  <td>{r.spliters > 0 ? <strong>{r.spliters}</strong> : '-'}</td>
                  <td>{r.ccn > 0 ? <strong>{r.ccn}</strong> : '-'}</td>
                  <td>{r.fleje > 0 ? <strong>{r.fleje}</strong> : '-'}</td>
                  <td>{r.fibra_24h > 0 ? <strong>{r.fibra_24h}</strong> : '-'}</td>
                  <td>{r.preformado > 0 ? <strong>{r.preformado}</strong> : '-'}</td>
                  
                  {/* Observaciones y botón de descarga PDF */}
                  <td><em>{r.observaciones || 'Sin observaciones'}</em></td>
                  
                  {/* Información del usuario que creó la devolución */}
                  <td>
                    {r.creadoPor ? (
                      <div>
                        <strong>{r.creadoPor.nombreCompleto}</strong><br/>
                        <small className="text-muted">{r.creadoPor.email}</small><br/>
                        <small className="text-muted">
                          {r.creadoPor.fechaCreacion && r.creadoPor.fechaCreacion.toDate ? 
                            r.creadoPor.fechaCreacion.toDate().toLocaleString('es-ES') : 
                            'N/A'}
                        </small>
                      </div>
                    ) : (
                      <em className="text-muted">Sin información</em>
                    )}
                  </td>
                  
                  <td>
                    {/* Botón para generar y descargar PDF del registro */}
                    <button className="btn btn-download" onClick={() => generarPDF(r)}>
                      📄 Descargar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              // Si no hay registros, mostrar mensaje informativo
              <tr>
                <td colSpan="26" className="empty-state">
                  📝 No hay registros de devolución disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MaterialTable;
