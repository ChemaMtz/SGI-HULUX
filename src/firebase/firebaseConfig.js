import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Configuración temporal con valores directos para debugging
const firebaseConfig = {
  apiKey: "AIzaSyDfMBIYYtkoC5dPWZIOac0dOLaiIR7SxYo",
  authDomain: "hulux-sgo.firebaseapp.com",
  projectId: "hulux-sgo",
  storageBucket: "hulux-sgo.firebasestorage.app",
  messagingSenderId: "622519982104",
  appId: "1:622519982104:web:4757827787cc1478348b6d",
  measurementId: "G-BDK2FC4EL2"
};

// Log para verificar la configuración
console.log('Firebase Config:', firebaseConfig);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };