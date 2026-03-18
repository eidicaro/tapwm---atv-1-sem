import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// sua config
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "dicionario-dev-cb079.firebaseapp.com",
  projectId: "dicionario-dev-cb079",
  storageBucket: "dicionario-dev-cb079.firebasestorage.app",
  messagingSenderId: "737789555594",
  appId: "1:737789555594:web:7bfe701160e465dfd4ce73",
  measurementId: "G-M9CC2SQWPR"
};

// inicializa
const app = initializeApp(firebaseConfig);

// 🔥 AQUI É O MAIS IMPORTANTE
export const db = getFirestore(app);