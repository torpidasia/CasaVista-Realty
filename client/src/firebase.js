// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "real-estate-a4a05.firebaseapp.com",
  projectId: "real-estate-a4a05",
  storageBucket: "real-estate-a4a05.appspot.com",
  messagingSenderId: "23589135897",
  appId: "1:23589135897:web:6f1f5035a5f18c86922c88"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);