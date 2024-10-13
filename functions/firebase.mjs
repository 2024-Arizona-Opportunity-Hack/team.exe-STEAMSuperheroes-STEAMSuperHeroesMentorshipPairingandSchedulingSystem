import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import * as functions from 'firebase-functions'; 
import dotenv from 'dotenv';
import { defineSecret } from "firebase-functions/params";
dotenv.config();
const databaseKey = defineSecret("DATABASE_KEY").value();
const firebaseConfig = {
  apiKey: databaseKey,
  authDomain: "fall-hackathon-project.firebaseapp.com",
  projectId: "fall-hackathon-project",
  storageBucket: "fall-hackathon-project.appspot.com",
  messagingSenderId: "632720354381",
  appId: "1:632720354381:web:daea3ee0426227c7e70004"
};
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };