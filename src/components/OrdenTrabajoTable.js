// Importaciones necesarias para el componente de tabla de órdenes de trabajo
import React, { useEffect, useState } from 'react'; // React hooks para estado y efectos
import { db } from '../firebase/firebaseConfig'; // Configuración de Firebase
import { collection, onSnapshot } from 'firebase/firestore'; // Funciones de Firestore para tiempo real
import jsPDF from 'jspdf'; // Librería para generar documentos PDF
import autoTable from 'jspdf-autotable'; // Plugin para crear tablas automáticamente en PDF
import '../App.css'; // Importar estilos

/**
 * Componente OrdenTrabajoTable
 * 
 * Tabla que muestra todas las órdenes de trabajo registradas en el sistema
 * con funcionalidad de visualización y generación de reportes PDF que incluyen
 * firmas digitales.
 * 
 * Características principales:
 * - Visualización en tiempo real desde Firebase
 * - Ordenamiento automático por número de orden
 * - Generación de PDF con firmas digitales
 * - Procesamiento de imágenes base64 para PDF
 * - Tabla responsive con Bootstrap
 * - Manejo de estados vacíos
 * - Formateo inteligente de datos complejos (arrays, objetos)
 * 
 * Funcionalidades avanzadas:
 * - Conversión de URLs de firmas a base64 para PDF
 * - Renderizado condicional de actividades y materiales
 * - Integración completa con autoTable para PDFs profesionales
 */
const OrdenTrabajoTable = () => {
  // Estado para almacenar todas las órdenes de trabajo
  const [ordenes, setOrdenes] = useState([]);

  // Efecto para escuchar cambios en tiempo real desde Firebase
  useEffect(() => {
    // Configurar listener para la colección 'ordenesTrabajo'
    const unsub = onSnapshot(collection(db, 'ordenesTrabajo'), (snapshot) => {
      // Actualizar estado con los documentos obtenidos, incluyendo el ID
      setOrdenes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    // Cleanup: cancelar la suscripción cuando el componente se desmonte
    return () => unsub();
  }, []);

  /**
   * Función para convertir URLs de imágenes a base64
   * 
   * @param {string} url - URL de la imagen a convertir
   * @returns {Promise<string|null>} - Promise que resuelve con la imagen en base64 o null si falla
   * 
   * Esta función es necesaria para incluir las firmas digitales en el PDF,
   * ya que jsPDF requiere imágenes en formato base64 para la inclusión.
   * Maneja errores de CORS y imágenes no válidas.
   */
  const urlToBase64 = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; // Permitir CORS para imágenes externas
      img.src = url;
      
      img.onload = () => {
        // Crear canvas temporal para convertir imagen a base64
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Convertir canvas a data URL (base64)
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      
      // Manejar errores de carga de imagen
      img.onerror = () => resolve(null);
    });
  };

  /**
   * Función para generar PDF completo de una orden de trabajo
   * 
   * @param {Object} orden - Objeto de la orden de trabajo
   * 
   * Genera un PDF profesional que incluye:
   * - Información básica de la orden en formato tabla
   * - Firmas digitales convertidas de base64
   * - Formateo profesional con autoTable
   * - Manejo asíncrono de imágenes
   * - Descarga automática del archivo
   */
  const generarPDF = async (orden) => {
    // Crear nuevo documento PDF
    const doc = new jsPDF();
    
    // Configurar título del documento
    doc.setFontSize(16);
    doc.text(`Orden de Trabajo #${orden.numero || 'N/A'}`, 14, 20);

    // Preparar datos de la orden para la tabla principal
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

    // Generar tabla principal con autoTable
    autoTable(doc, {
      startY: 30, // Posición Y donde comienza la tabla
      head: [['Campo', 'Valor']], // Encabezados
      body: datosTabla, // Datos
    });

    // Sección de firmas digitales
    const firmas = orden.firmas || {};
    let yStart = doc.lastAutoTable.finalY + 10; // Posición después de la tabla
    doc.setFontSize(12);
    doc.text('Firmas:', 14, yStart);
    yStart += 6;

    // Procesar firmas: convertir URLs a base64 de forma asíncrona
    const firmasProcesadas = await Promise.all([
      { label: 'Revisó', src: firmas.reviso },
      { label: 'Autorizó', src: firmas.autorizo },
      { label: 'Solicitó', src: firmas.solicito }
    ].map(async ({ label, src }) => {
      // Convertir cada firma de URL a base64
      const base64 = src ? await urlToBase64(src) : null;
      return { label, base64 };
    }));

    // Agregar cada firma al PDF
    firmasProcesadas.forEach((firma, index) => {
      const yPos = yStart + index * 50; // Espaciado vertical entre firmas
      doc.text(firma.label, 14, yPos); // Etiqueta de la firma
      
      if (firma.base64) {
        // Si hay firma, agregar imagen al PDF
        doc.addImage(firma.base64, 'PNG', 14, yPos + 4, 60, 30);
      } else {
        // Si no hay firma, mostrar texto alternativo
        doc.text('Sin firma', 14, yPos + 20);
      }
    });

    // Descargar el PDF con nombre dinámico
    doc.save(`OrdenTrabajo_${orden.numero || 'sin_numero'}.pdf`);
  };

  return (
    <div className="table-container">
      {/* Título principal de la tabla */}
      <h3 className="table-title">📋 Órdenes de Trabajo</h3>

      {/* Contenedor responsive para la tabla */}
      <div className="table-responsive">
        <table className="table custom-table table-hover align-middle text-center">
          {/* Encabezado de la tabla con estilos Bootstrap */}
          <thead>
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
          
          {/* Cuerpo de la tabla con datos dinámicos */}
          <tbody>
            {ordenes.length > 0 ? (
              // Si hay órdenes, ordenarlas y mostrarlas
              [...ordenes].sort((a, b) => {
                // Algoritmo de ordenamiento por número de orden
                const numA = parseInt(a.numero || a.numero_orden || 0);
                const numB = parseInt(b.numero || b.numero_orden || 0);
                return numA - numB; // Orden ascendente
              }).map((o) => (
                // Renderizar cada orden como una fila
                <tr key={o.id}>
                  {/* Información básica de la orden */}
                  <td><strong>{o.numero || 'N/A'}</strong></td>
                  <td>{o.fecha || 'N/A'}</td>
                  <td>{o.hora || 'N/A'}</td>
                  <td>{o.destino || 'N/A'}</td>
                  
                  {/* Actividades - Renderizado condicional de array */}
                  <td>
                    {Array.isArray(o.actividades) && o.actividades.length > 0
                      ? o.actividades.join(', ')
                      : <em className="text-muted">Sin actividades</em>}
                  </td>
                  
                  {/* Materiales - Renderizado complejo de array de objetos */}
                  <td>
                    {Array.isArray(o.materiales) && o.materiales.length > 0
                      ? o.materiales.map((m, i) => (
                        <div key={i}>
                          {m.cantidad} - {m.descripcion}
                        </div>
                      ))
                      : <em className="text-muted">Sin materiales</em>}
                  </td>
                  
                  {/* Información adicional de la orden */}
                  <td>{o.conduce || 'N/A'}</td>
                  <td>{o.unidad || 'N/A'}</td>
                  <td>{o.auxiliares || 'N/A'}</td>
                  <td>{o.usoEfectivo || 'N/A'}</td>
                  <td>{o.cantidadEfectivo || 'N/A'}</td>
                  
                  {/* Botón para generar y descargar PDF */}
                  <td>
                    <button
                      className="btn btn-download-success"
                      onClick={() => generarPDF(o)}
                    >
                      📄 Descargar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              // Si no hay órdenes, mostrar mensaje informativo
              <tr>
                <td colSpan="12" className="empty-state">
                  📋 No hay órdenes de trabajo registradas
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
