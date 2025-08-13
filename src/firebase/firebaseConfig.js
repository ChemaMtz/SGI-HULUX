import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuración usando variables de entorno del archivo .env
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Log para verificar que las variables de entorno se están cargando
console.log('Firebase Config from ENV:', {
  apiKey: firebaseConfig.apiKey ? 'Loaded ✅' : 'Missing ❌',
  authDomain: firebaseConfig.authDomain ? 'Loaded ✅' : 'Missing ❌',
  projectId: firebaseConfig.projectId ? 'Loaded ✅' : 'Missing ❌',
  storageBucket: firebaseConfig.storageBucket ? 'Loaded ✅' : 'Missing ❌',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'Loaded ✅' : 'Missing ❌',
  appId: firebaseConfig.appId ? 'Loaded ✅' : 'Missing ❌',
  measurementId: firebaseConfig.measurementId ? 'Loaded ✅' : 'Missing ❌'
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };