import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDzi_ljYIfo0mzf45XaYUIC2byqwnRehCU",
  authDomain: "mizan-8409b.firebaseapp.com",
  databaseURL: "https://mizan-8409b-default-rtdb.firebaseio.com",
  projectId: "mizan-8409b",
  storageBucket: "mizan-8409b.firebasestorage.app",
  messagingSenderId: "228742700141",
  appId: "1:228742700141:web:14ba252047849ab64af364",
  measurementId: "G-DNJDWXPB1D",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
