// Utilidad centralizada para manejar incrementos de contadores en Firestore
// Facilita futura migración a Cloud Functions (evitando lógica en el cliente)

import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { obtenerSiguienteNumeroSeguro } from './cloudFunctions';

// Obtiene siguiente número secuencial para un contador dado
export async function getNextSequence(contadorId) {
  if (!contadorId) throw new Error('contadorId requerido');
  return runTransaction(db, async (transaction) => {
    const ref = doc(db, 'contadores', contadorId);
    const snap = await transaction.get(ref);
    let next;
    if (!snap.exists()) {
      next = 1;
      transaction.set(ref, { ultimo: next, creadoEn: serverTimestamp(), actualizadoEn: serverTimestamp() });
    } else {
      const data = snap.data();
      const current = typeof data.ultimo === 'number' ? data.ultimo : 0;
      next = current + 1;
      transaction.update(ref, { ultimo: next, actualizadoEn: serverTimestamp() });
    }
    return next;
  });
}

// Obtiene número formateado con prefijo y padding
export async function getFormattedSequence(contadorId, { prefijo = '', padding = 3 } = {}) {
  const numero = await getNextSequence(contadorId);
  const idFormateado = `${prefijo}${String(numero).padStart(padding, '0')}`;
  return { numero, idFormateado };
}

// Obtiene número intentando primero Cloud Function segura; fallback local si falla
export async function getSafeFormattedSequence(contadorId, { prefijo = '', padding = 3 } = {}) {
  try {
    const { numero, idFormateado } = await obtenerSiguienteNumeroSeguro(contadorId, prefijo, padding);
    return { numero, idFormateado };
  } catch (err) {
    console.warn('[Counters] Fallback a transacción local por error en callable:', err?.message);
    return getFormattedSequence(contadorId, { prefijo, padding });
  }
}

export async function getSafeSequence(contadorId) {
  try {
    const { numero } = await obtenerSiguienteNumeroSeguro(contadorId);
    return numero;
  } catch (err) {
    console.warn('[Counters] Fallback a transacción local por error en callable:', err?.message);
    return getNextSequence(contadorId);
  }
}
