// Import the functions you need from the SDKs you need

import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBp9SwLBFNKBQjorqlMMPmM2IBUbPB4v4E",
  authDomain: "prep-wise-42990.firebaseapp.com",
  projectId: "prep-wise-42990",
  storageBucket: "prep-wise-42990.firebasestorage.app",
  messagingSenderId: "1011600642092",
  appId: "1:1011600642092:web:abe6124db56e0bc9de0189",
  measurementId: "G-PYFSPXJ3SQ",
};
// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
console.log(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
