import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCoI_rv6-5KmFxeLJpbhtZn53jlCugId44",
  authDomain: "appprueba-1a664.firebaseapp.com",
  projectId: "appprueba-1a664",
  storageBucket: "appprueba-1a664.firebasestorage.app",
  messagingSenderId: "927024311005",
  appId: "1:927024311005:web:edc2df495f188d4e0cc934",
  measurementId: "G-9Q38BPJD7R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };