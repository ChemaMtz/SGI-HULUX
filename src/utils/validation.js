// Utilidades de validación y sanitización centralizadas
// Objetivo: evitar lógica duplicada en formularios y reducir superficie de entrada maliciosa

// Sanitiza texto simple: recorta, elimina caracteres de control, neutraliza < >
export function sanitizeText(str, { max = 200 } = {}) {
  if (!str) return '';
  let s = String(str).trim();
  // Eliminar caracteres de control excepto tab/newline
  s = s.replace(/[\x00-\x08\x0B-\x1F\x7F]/g, '');
  // Neutralizar tags básicos
  s = s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  if (s.length > max) s = s.slice(0, max);
  return s;
}

export function sanitizeNumber(val, { min = 0, max = 9999 } = {}) {
  let n = parseInt(val, 10);
  if (isNaN(n)) n = 0; 
  if (n < min) n = min;
  if (n > max) n = max;
  return n;
}

// Valida Orden de Trabajo
export function validateOrdenTrabajo(data) {
  const errors = [];
  const clean = { ...data };

  clean.destino = sanitizeText(clean.destino, { max: 80 });
  if (!clean.destino) errors.push('Destino es requerido.');

  // Materiales: limpiar filas vacías y sanitizar
  clean.materiales = (clean.materiales || []).map(m => ({
    ...m,
    cantidad: sanitizeText(m.cantidad, { max: 10 }),
    descripcion: sanitizeText(m.descripcion, { max: 120 })
  })).filter(m => m.cantidad || m.descripcion);
  if (clean.materiales.length > 100) errors.push('Demasiadas filas de materiales (máx 100).');

  // Firmas: no forzamos requeridas pero validar longitud
  Object.keys(clean.firmas || {}).forEach(k => {
    if (clean.firmas[k] && clean.firmas[k].length > 50000) {
      errors.push(`Firma ${k} es demasiado grande.`);
    }
  });

  // Actividades: al menos una
  const actividadesKeys = Object.entries(clean.actividades || {}).filter(([k,v]) => !/otrosTexto/i.test(k) && v === true);
  if (actividadesKeys.length === 0) errors.push('Selecciona al menos una actividad.');

  return { valid: errors.length === 0, errors, clean };
}

// Valida Devolución de Material
export function validateDevolucion(data) {
  const errors = [];
  const clean = { ...data };

  clean.cliente = sanitizeText(clean.cliente, { max: 100 });
  if (!clean.cliente) errors.push('Cliente es requerido.');

  clean.actividad = sanitizeText(clean.actividad, { max: 120 });
  clean.observaciones = sanitizeText(clean.observaciones, { max: 500 });

  // Validar numerales y modelos
  const numberFields = ['onu_rip','modem_funcional','modem_rip','cable_ethernet','roseta','drop','cargador','poe','bateria','isbs','radios','nap','hcc','hsc','spliters','ccn','fleje','fibra_24h','preformado'];
  numberFields.forEach(f => {
    clean[f] = sanitizeNumber(clean[f], { min: 0, max: 999 });
  });

  // Si un equipo requiere modelo y cantidad > 0, el modelo debe existir
  const requiereModelo = ['onu_rip','modem_funcional','modem_rip'];
  requiereModelo.forEach(f => {
    if (clean[f] > 0) {
      const campoModelo = `${f}_modelo`;
      clean[campoModelo] = sanitizeText(clean[campoModelo], { max: 60 });
      if (!clean[campoModelo]) errors.push(`Modelo requerido para ${f.replace('_',' ')}`);
    }
  });

  return { valid: errors.length === 0, errors, clean };
}
