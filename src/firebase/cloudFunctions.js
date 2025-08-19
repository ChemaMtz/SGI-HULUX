// Cliente para Cloud Functions (callable) relacionado con contadores seguros
// Requiere haber desplegado la función incrementCounter en el backend

import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebaseConfig';

const functions = getFunctions(app);

export async function obtenerSiguienteNumeroSeguro(tipo, prefijo = '', padding = 3) {
  const fn = httpsCallable(functions, 'incrementCounter');
  const res = await fn({ tipo, prefijo, padding });
  return res.data; // { numero, idFormateado }
}
