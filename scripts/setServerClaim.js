/**
 * Script para asignar un custom claim `server: true` a un usuario.
 * Úsalo SOLO si decides permitir escritura directa en /contadores a ciertos usuarios.
 * Normalmente no es necesario: la Cloud Function con Admin SDK ya puede escribir ignorando reglas.
 *
 * Instrucciones:
 * 1. Asegúrate de haber instalado firebase-admin: npm install firebase-admin
 * 2. Exporta la variable GOOGLE_APPLICATION_CREDENTIALS apuntando a tu service account JSON
 *    (o inicializa con admin.initializeApp({ credential: admin.credential.cert({...}) }))
 * 3. Ejecuta: node scripts/setServerClaim.js <uid>
 */

const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

async function setClaim() {
  const uid = process.argv[2];
  if (!uid) {
    console.error('Uso: node scripts/setServerClaim.js <uid>');
    process.exit(1);
  }
  try {
    await admin.auth().setCustomUserClaims(uid, { server: true });
    console.log(`Custom claim { server: true } asignado al usuario: ${uid}`);
    const user = await admin.auth().getUser(uid);
    console.log('Claims actuales:', user.customClaims);
  } catch (e) {
    console.error('Error asignando claim:', e);
    process.exit(1);
  }
}

setClaim();
