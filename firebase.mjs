import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import dotenv from 'dotenv';
dotenv.config();
const firebaseConfig = {
  apiKey: process.env.FIREBASE_KEY,
  authDomain: "fall-hackathon-project.firebaseapp.com",
  projectId: "fall-hackathon-project",
  storageBucket: "fall-hackathon-project.appspot.com",
  messagingSenderId: "632720354381",
  appId: "1:632720354381:web:daea3ee0426227c7e70004"
};
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };







