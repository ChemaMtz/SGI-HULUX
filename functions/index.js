/**
 * Cloud Functions para manejar contadores seguros.
 * Instalar dependencias ejecutando en la carpeta 'functions':
 *   npm install firebase-admin firebase-functions
 * Luego desplegar:
 *   firebase deploy --only functions:incrementCounter
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializar admin (usa credenciales implícitas de Firebase Hosting / Service Account en deploy)
admin.initializeApp();
const db = admin.firestore();

/**
 * incrementCounter (callable)
 * Request: { tipo: string, prefijo?: string, padding?: number }
 * Response: { numero: number, idFormateado: string }
 */
exports.incrementCounter = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }

  const tipo = String(data.tipo || '').trim();
  if (!tipo) {
    throw new functions.https.HttpsError('invalid-argument', 'tipo es requerido');
  }

  const prefijo = data.prefijo ? String(data.prefijo) : '';
  const padding = typeof data.padding === 'number' ? data.padding : 3;

  const contadorRef = db.collection('contadores').doc(tipo);

  let numero;
  await db.runTransaction(async (t) => {
    const snap = await t.get(contadorRef);
    if (!snap.exists) {
      numero = 1;
      t.set(contadorRef, { ultimo: numero, creadoEn: admin.firestore.FieldValue.serverTimestamp(), actualizadoEn: admin.firestore.FieldValue.serverTimestamp() });
    } else {
      const data = snap.data();
      numero = (typeof data.ultimo === 'number' ? data.ultimo : 0) + 1;
      t.update(contadorRef, { ultimo: numero, actualizadoEn: admin.firestore.FieldValue.serverTimestamp() });
    }
  });

  const idFormateado = `${prefijo}${String(numero).padStart(padding, '0')}`;
  return { numero, idFormateado };
});
