// Importaciones necesarias para el componente de tabla de órdenes de trabajo
import React, { useEffect, useState, useMemo } from 'react'; // React hooks para estado y efectos
import { paginate, getTotalPages, clampPage } from '../utils/pagination';
import { db } from '../firebase/firebaseConfig'; // Configuración de Firebase
import { collection, onSnapshot } from 'firebase/firestore'; // Funciones de Firestore para tiempo real
import jsPDF from 'jspdf'; // Librería para generar documentos PDF
import autoTable from 'jspdf-autotable'; // Plugin para crear tablas automáticamente en PDF
import logo from '../assets/logo.png';
import { loadImageToBase64, setDocMeta, addHeader, addFooter, defaultTableTheme } from '../utils/pdf';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const ordenesFiltradas = useMemo(() => {
    const t = filtro.trim().toLowerCase();
    if (!t) return ordenes;
    return ordenes.filter(o =>
      String(o.numero || '').toLowerCase().includes(t) ||
      (o.destino || '').toLowerCase().includes(t) ||
      (Array.isArray(o.actividades) ? o.actividades.join(' ').toLowerCase() : '').includes(t)
    );
  }, [ordenes, filtro]);

  const ordenesOrdenadas = useMemo(() => {
    const extractNum = (v) => {
      if (typeof v === 'number') return v;
      const digits = String(v || '').replace(/\D/g, '');
      return parseInt(digits, 10) || 0;
    };
    return [...ordenesFiltradas].sort((a, b) => {
      const numA = extractNum(a.numeroSecuencial || a.numero || a.numero_orden);
      const numB = extractNum(b.numeroSecuencial || b.numero || b.numero_orden);
      return numA - numB;
    });
  }, [ordenesFiltradas]);

  const totalPages = useMemo(() => getTotalPages(ordenesOrdenadas.length, pageSize === 'all' ? 'all' : pageSize), [ordenesOrdenadas.length, pageSize]);

  useEffect(() => { setPage(p => clampPage(p, totalPages)); }, [totalPages]);

  const ordenesPagina = useMemo(() => paginate(ordenesOrdenadas, page, pageSize === 'all' ? 'all' : pageSize), [ordenesOrdenadas, page, pageSize]);

  // Efecto para escuchar cambios en tiempo real desde Firebase
  useEffect(() => {
    // Configurar listener para la colección 'ordenesTrabajo'
    const unsub = onSnapshot(
      collection(db, 'ordenesTrabajo'),
      (snapshot) => {
        setOrdenes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Error escuchando ordenesTrabajo:', err);
        setError(err);
        setLoading(false);
      }
    );
    
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
    const doc = new jsPDF({ compress: true, unit: 'mm', format: 'a4' });
    setDocMeta(doc, { title: `OrdenTrabajo_${orden.numero || 'N/A'}`, subject: 'Orden de Trabajo' });
    const logoBase64 = await loadImageToBase64(logo);
    addHeader(doc, `Orden de Trabajo #${orden.numero || 'N/A'}`, logoBase64);

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
      ['Creado por', orden.creadoPor ? `${orden.creadoPor.nombreCompleto} (${orden.creadoPor.email})` : 'Sin información'],
      // Se elimina 'Fecha de creación' para evitar duplicado de fecha solicitado por el usuario
    ];

    // Generar tabla principal con autoTable
    autoTable(doc, {
      startY: 25,
      head: [['Campo', 'Valor']],
      body: datosTabla,
      ...defaultTableTheme,
    });

    // Sección de firmas digitales
    const firmas = orden.firmas || {};
    let yStart = doc.lastAutoTable.finalY + 10;
    // Si no cabe la sección de firmas mínima en la página actual, crear nueva página
    const minAlturaFirmas = 60; // altura mínima para el bloque de firmas en formato horizontal
    if (yStart + minAlturaFirmas > 270) { // margen inferior ~ 290 - footer
      doc.addPage();
      yStart = 20;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Firmas:', 14, yStart);
    yStart += 6;

    const firmasDef = [
      { label: 'Revisó', src: firmas.reviso },
      { label: 'Autorizó', src: firmas.autorizo },
      { label: 'Solicitó', src: firmas.solicito },
    ];

    // Convertir en paralelo
    const firmasProcesadas = await Promise.all(firmasDef.map(async f => ({
      label: f.label,
      base64: f.src ? await urlToBase64(f.src) : null,
    })));

    // Layout horizontal
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 14;
    const usableWidth = pageWidth - marginX * 2;
    const gap = 6;
    const blockWidth = (usableWidth - gap * 2) / 3; // 3 bloques
    const blockHeight = 40; // área para la imagen
    const lineY = yStart + blockHeight + 10;

    firmasProcesadas.forEach((firma, idx) => {
      const x = marginX + idx * (blockWidth + gap);
      // Etiqueta
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(firma.label, x, yStart + 4);
      // Marco / imagen
      if (firma.base64) {
        // Ajustar imagen preservando proporción dentro de blockWidth x blockHeight
        try {
          // jsPDF no expone dimensiones de la imagen antes, usamos aproximación fija
          const imgW = blockWidth;
            const imgH = blockHeight;
          doc.addImage(firma.base64, 'PNG', x, yStart + 6, imgW, imgH, undefined, 'FAST');
        } catch (_) {
          doc.setFont('helvetica', 'normal');
          doc.text('Error firma', x + 2, yStart + 20);
        }
      } else {
        doc.setFont('helvetica', 'normal');
        doc.text('Sin firma', x + 2, yStart + 20);
      }
      // Línea de firma
      doc.setDrawColor(50);
      doc.line(x, lineY, x + blockWidth, lineY);
    });

    // Etiquetas debajo de la línea (nombre de campo ya usado como label arriba, opcional repetir)
    // doc.setFontSize(9);
    // firmasProcesadas.forEach((firma, idx) => {
    //   const x = marginX + idx * (blockWidth + gap);
    //   doc.text(firma.label, x + blockWidth / 2, lineY + 5, { align: 'center' });
    // });

  addFooter(doc);
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
              <th>Creado Por</th>
              <th>PDF</th>
            </tr>
          </thead>
          
          {/* Cuerpo de la tabla con datos dinámicos */}
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="13" className="empty-state" aria-busy="true">⏳ Cargando órdenes...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="13" className="empty-state text-danger">⚠️ Error cargando datos: {error.message || 'Desconocido'}</td>
              </tr>
            ) : ordenesPagina.length > 0 ? (
              ordenesPagina.map((o) => (
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
                  
                  {/* Información del usuario que creó la orden */}
                  <td>
                    {o.creadoPor ? (
                      <div>
                        <strong>{o.creadoPor.nombreCompleto}</strong><br/>
                        <small className="text-muted">{o.creadoPor.email}</small><br/>
                        <small className="text-muted">
                          {o.creadoPor.fechaCreacion && o.creadoPor.fechaCreacion.toDate ? 
                            o.creadoPor.fechaCreacion.toDate().toLocaleString('es-ES') : 
                            'N/A'}
                        </small>
                      </div>
                    ) : (
                      <em className="text-muted">Sin información</em>
                    )}
                  </td>
                  
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
                <td colSpan="13" className="empty-state">
                  📋 No hay órdenes que coincidan con el filtro
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <input
          type="search"
          className="form-control"
          placeholder="Filtrar por número, destino o actividad..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          aria-label="Filtrar órdenes"
        />
      </div>
      <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mt-3">
        <div className="d-flex align-items-center gap-2">
          <label className="form-label m-0" htmlFor="pageSizeOrdenes">Filas:</label>
          <select
            id="pageSizeOrdenes"
            className="form-select"
            style={{ width: 'auto' }}
            value={pageSize}
            onChange={e => { const val = e.target.value === 'all' ? 'all' : parseInt(e.target.value,10); setPageSize(val); setPage(1); }}
            aria-label="Tamaño de página"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value="all">Todos</option>
          </select>
          <span className="text-muted small">{ordenesFiltradas.length} registros</span>
        </div>
        {pageSize !== 'all' && totalPages > 1 && (
          <nav aria-label="Paginación órdenes" className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(1)} aria-label="Primera página">«</button>
            <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p-1))} aria-label="Página anterior">‹</button>
            <span className="small">Página {page} / {totalPages}</span>
            <button className="btn btn-sm btn-outline-secondary" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p+1))} aria-label="Página siguiente">›</button>
            <button className="btn btn-sm btn-outline-secondary" disabled={page === totalPages} onClick={() => setPage(totalPages)} aria-label="Última página">»</button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default OrdenTrabajoTable;
