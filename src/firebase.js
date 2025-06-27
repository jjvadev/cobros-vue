import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCHjaOsz8qXxAyPWE2dyGO8FJl6lfsF210",
  authDomain: "krediler-61bad.firebaseapp.com",
  projectId: "krediler-61bad",
  storageBucket: "krediler-61bad.appspot.com",
  messagingSenderId: "318550330674",
  appId: "1:318550330674:web:4d2e616bd22cbc791b1b2b",
  measurementId: "G-7F7RK1PQLX"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Obtiene los servicios
const db = getFirestore(app);
const auth = getAuth(app);

// Activa la persistencia offline
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Probablemente hay varias pestañas abiertas
    console.warn('La persistencia offline solo puede estar habilitada en una pestaña a la vez.');
  } else if (err.code === 'unimplemented') {
    // El navegador no soporta todas las características necesarias
    console.warn('El navegador no soporta la persistencia offline de Firestore.');
  }
});

// Exporta los servicios que necesites
export { db, auth };