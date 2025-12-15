// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// --- PASTE YOUR FIREBASE CONFIG HERE ---
const firebaseConfig = {
  apiKey: "AIzaSyB-xjc9LouLl5AigCgnXOupW7AYoZtPNsM",
  authDomain: "true-poker.firebaseapp.com",
  projectId: "true-poker",
  storageBucket: "true-poker.firebasestorage.app",
  messagingSenderId: "1071141148684",
  appId: "1:1071141148684:web:a0fe5a7dccf774e60df629",
  measurementId: "G-7LNBJ4CZDF"
};
// ---------------------------------------

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();