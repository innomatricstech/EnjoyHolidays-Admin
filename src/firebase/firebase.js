// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// 🔥 REAL Firebase config (ONLY ONE)
const firebaseConfig = {
  apiKey: "AIzaSyDZC8f2nQWGKteYDloAjjyrWoeZp56RniA",
  authDomain: "enjoy-holidays-aeec1.firebaseapp.com",
  projectId: "enjoy-holidays-aeec1",
  storageBucket: "enjoy-holidays-aeec1.firebasestorage.app",
  messagingSenderId: "190429549450",
  appId: "1:190429549450:web:720d54bf203da5b6d72e73",
  measurementId: "G-TY0D6C9H6Q"
};

// ✅ Initialize Firebase ONCE
export const app = initializeApp(firebaseConfig);

// ✅ Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
