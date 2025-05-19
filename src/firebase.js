// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Optional: Analytics if you want to use it
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA7-Y2_KOD3Y30tYm1QRYu5_iFWizbSAHk",
  authDomain: "expense-tracker-5e8be.firebaseapp.com",
  projectId: "expense-tracker-5e8be",
  storageBucket: "expense-tracker-5e8be.firebasestorage.app",
  messagingSenderId: "568956625716",
  appId: "1:568956625716:web:b8377d1f65633cd3a4fb61",
  measurementId: "G-XGKY9146P3",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// Optional if you want Analytics
// export const analytics = getAnalytics(app);
