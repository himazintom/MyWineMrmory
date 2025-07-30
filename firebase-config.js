// Firebase設定とサービス初期化
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6jnGUsdR9JDTZoDUq_QhM4Gr_gLVp3qA",
  authDomain: "mywinememory.firebaseapp.com",
  projectId: "mywinememory",
  storageBucket: "mywinememory.firebasestorage.app",
  messagingSenderId: "179280253269",
  appId: "1:179280253269:web:58330b5938412fafc21fdc",
  measurementId: "G-PP1B5425FD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Analytics (optional - only in production)
let analytics = null;
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  analytics = getAnalytics(app);
}
export { analytics };

// Development environment setup
if (window.location.hostname === 'localhost') {
  console.log('🔧 Development mode: Firebase services running locally');
  
  // Connect to Firebase Emulator Suite if running locally
  // Uncomment these lines if you want to use Firebase emulators
  /*
  if (!auth._delegate._config?.emulator) {
    connectAuthEmulator(auth, "http://localhost:9099");
  }
  
  if (!db._delegate._settings?.host?.includes('localhost')) {
    connectFirestoreEmulator(db, 'localhost', 8080);
  }
  
  if (!storage._delegate._location?.host?.includes('localhost')) {
    connectStorageEmulator(storage, "localhost", 9199);
  }
  */
}

console.log('🔥 Firebase initialized successfully');
console.log('📊 Project ID:', firebaseConfig.projectId);