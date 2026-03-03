// ============================================
// Firebase Configuration
// ============================================
// INSTRUCTIONS: Replace these placeholder values with your actual Firebase project config.
// Go to Firebase Console > Project Settings > General > Your apps > Web app
// Copy the config object and paste the values below.

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
const storage = firebase.storage();

console.log("🔥 Firebase initialized - PendejosUnite is ready!");
