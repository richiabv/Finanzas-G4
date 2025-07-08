// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDZXfWY8gqb8EFnUvIH_2_X8icR1cRko3Y",
    authDomain: "finanzas-g4.firebaseapp.com",
    projectId: "finanzas-g4",
    storageBucket: "finanzas-g4.appspot.com",
    messagingSenderId: "345410434161",
    appId: "1:345410434161:web:e22f5f8a7a5a70a47ed7d0",
    measurementId: "G-51093SFF2C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };