import { getApps, initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAcVGQO6L2-rhPRDCQvWNqFQjPpQ6KVENE",
  authDomain: "blackout-a0ac3.firebaseapp.com",
  projectId: "blackout-a0ac3",
  storageBucket: "blackout-a0ac3.firebasestorage.app",
  messagingSenderId: "427274772266",
  appId: "1:427274772266:web:724df2eb29524179358853",
  measurementId: "G-B50Y3ZCY3Q"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app!);
const analytics = getAnalytics(app);
