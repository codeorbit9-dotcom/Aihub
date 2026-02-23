import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBiACmPLrPK8yh3WGcx9-4JmvJFep_ZxnY",
  authDomain: "studio-2416347475-faeb3.firebaseapp.com",
  projectId: "studio-2416347475-faeb3",
  storageBucket: "studio-2416347475-faeb3.appspot.com",
  messagingSenderId: "796374984590",
  appId: "1:796374984590:web:2efde75086b2a4aab866df"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
