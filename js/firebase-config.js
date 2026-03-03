// ============================================
// Firebase Configuration - PendejosUnite
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyBlVUrtOoaLvRB5avQoofrm2efDjXMppo4",
  authDomain: "lucy-c8e33.firebaseapp.com",
  projectId: "lucy-c8e33",
  storageBucket: "lucy-c8e33.firebasestorage.app",
  messagingSenderId: "1033897212842",
  appId: "1:1033897212842:web:689e1f0138181fd87549d3",
  measurementId: "G-GTWY1Y1XT6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
const storage = firebase.storage();

console.log("🔥 Firebase initialized - PendejosUnite is ready!");
