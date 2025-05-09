
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_QR6x-0ab_S7uTb0rTS01u9N62QNuq40",
  authDomain: "masruf-manager.firebaseapp.com",
  projectId: "masruf-manager",
  storageBucket: "masruf-manager.firebasestorage.app",
  messagingSenderId: "153141113612",
  appId: "1:153141113612:web:ef0420214d096938e2cf29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
