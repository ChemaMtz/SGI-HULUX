// Importaciones necesarias para el componente
import React, { useEffect, useState } from 'react'; // React hooks para estado y efectos
import { db } from '../firebase/firebaseConfig'; // Configuración de Firebase
import { collection, onSnapshot } from 'firebase/firestore'; // Funciones de Firestore para escuchar cambios en tiempo real
import jsPDF from 'jspdf'; // Librería para generar documentos PDF
import autoTable from 'jspdf-autotable'; // Plugin para crear tablas automáticamente en PDF

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
    <div className="container mt-4">
      {/* Título principal de la tabla */}
      <h3 className="text-center text-primary mb-4">Registros de Devolución de Materiales</h3>

      {/* Contenedor responsive para la tabla */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle text-center">
          {/* Encabezado de la tabla con estilos Bootstrap */}
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
                  <td>{r.numero_orden || '-'}</td>
                  <td>{r.fecha || '-'}</td>
                  <td>{r.cliente || '-'}</td>
                  <td>{r.actividad || '-'}</td>
                  <td>{r.modelo_onu_funcional || '-'}</td>
                  
                  {/* Materiales devueltos - Mostrar checkmark (✓) si está marcado */}
                  <td>{r.onu_rip ? '✓' : '-'}</td>
                  <td>{r.modem_funcional ? '✓' : '-'}</td>
                  <td>{r.modem_rip ? '✓' : '-'}</td>
                  <td>{r.cable_ethernet ? '✓' : '-'}</td>
                  <td>{r.roseta ? '✓' : '-'}</td>
                  <td>{r.drop ? '✓' : '-'}</td>
                  <td>{r.cargador ? '✓' : '-'}</td>
                  <td>{r.poe ? '✓' : '-'}</td>
                  <td>{r.bateria ? '✓' : '-'}</td>
                  
                  {/* Observaciones y botón de descarga PDF */}
                  <td>{r.observaciones || 'Sin observaciones'}</td>
                  <td>
                    {/* Botón para generar y descargar PDF del registro */}
                    <button className="btn btn-sm btn-outline-primary" onClick={() => generarPDF(r)}>
                      Descargar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              // Si no hay registros, mostrar mensaje informativo
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
