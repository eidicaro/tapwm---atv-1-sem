// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDB87ZuFKWJPz20MHGjI9CbkDhi8Z4DAXU",
  authDomain: "dicionario-dev-cb079.firebaseapp.com",
  projectId: "dicionario-dev-cb079",
  storageBucket: "dicionario-dev-cb079.firebasestorage.app",
  messagingSenderId: "737789555594",
  appId: "1:737789555594:web:7bfe701160e465dfd4ce73",
  measurementId: "G-M9CC2SQWPR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);