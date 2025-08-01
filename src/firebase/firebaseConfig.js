import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDBvgB2hXAidJ0QkDz0iGo1gAVWfbWHM0k",
  authDomain: "huluxsgi.firebaseapp.com",
  databaseURL: "https://huluxsgi-default-rtdb.firebaseio.com",
  projectId: "huluxsgi",
  storageBucket: "huluxsgi.firebasestorage.app",
  messagingSenderId: "609299509435",
  appId: "1:609299509435:web:cef1f7a1cea5cc604ff99e",
  measurementId: "G-FV8SY6C7XB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };