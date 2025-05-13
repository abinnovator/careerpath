// Import the functions you need from the SDKs you need

import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAZmUoS1EuJ31GvC2HNP97nSTh0wDvB2yw",
  authDomain: "careerpath-8d969.firebaseapp.com",
  projectId: "careerpath-8d969",
  storageBucket: "careerpath-8d969.firebasestorage.app",
  messagingSenderId: "220688754234",
  appId: "1:220688754234:web:0080f0281403481a703703",
  measurementId: "G-99R48GVZSR",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
