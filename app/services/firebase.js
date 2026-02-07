import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
import { initializeAuth, getSecondaryAppAuth, getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAi9zA6vci_L9sK0PhoTHCWrIWuQ7rsNzo",
    authDomain: "foodie-83f4e.firebaseapp.com",
    projectId: "foodie-83f4e",
    storageBucket: "foodie-83f4e.firebasestorage.app",
    messagingSenderId: "73911216698",
    appId: "1:73911216698:web:317da5474b4eb4daba2303",
    measurementId: "G-TV16XZ859M"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app)