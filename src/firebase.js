// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: "bdbdgmain.firebaseapp.com",
  databaseURL:
    "https://bdbdgmain-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bdbdgmain",
  storageBucket: "bdbdgmain.appspot.com",
  messagingSenderId: "193967452980",
  appId: "1:193967452980:web:c98e06d5312714483a6b61",
  measurementId: "G-JXECRGC3L2",
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); // GoogleAuthProvider 객체 초기화 및 export
