import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDB87ZuFKWJPz20MHGjI9CbkDhi8Z4DAXU",
  authDomain: "dicionario-dev-cb079.firebaseapp.com",
  projectId: "dicionario-dev-cb079",
  storageBucket: "dicionario-dev-cb079.firebasestorage.app",
  messagingSenderId: "737789555594",
  appId: "1:737789555594:web:7bfe701160e465dfd4ce73",
  measurementId: "G-M9CC2SQWPR"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);