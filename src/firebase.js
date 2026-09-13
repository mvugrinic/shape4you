import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyAM5EyfWkaJOYT4OXSTOau_-TnlpdhFbdA",
  authDomain: "shape4you-8f657.firebaseapp.com",
  projectId: "shape4you-8f657",
  storageBucket: "shape4you-8f657.firebasestorage.app",
  messagingSenderId: "922642134663",
  appId: "1:922642134663:web:edb8759e24650ff627aa22",
  measurementId: "G-7YPXKEBE5T"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }
