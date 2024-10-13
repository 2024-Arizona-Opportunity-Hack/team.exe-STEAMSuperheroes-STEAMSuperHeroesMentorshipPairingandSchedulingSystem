import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyD0R8Lu3eMTWOMmCyXa6m6dRGlY4tjh3Mc",
  authDomain: "fall-hackathon-project.firebaseapp.com",
  projectId: "fall-hackathon-project",
  storageBucket: "fall-hackathon-project.appspot.com",
  messagingSenderId: "632720354381",
  appId: "1:632720354381:web:daea3ee0426227c7e70004"
};
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };







