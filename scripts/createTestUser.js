// Script to create a test user in Firebase Auth
// Run this script once to create a test user for login testing

const { initializeApp } = require('firebase/app');
const { initializeAuth, getReactNativePersistence, createUserWithEmailAndPassword } = require('firebase/auth');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIP60-mFuLl_qmxD3RawJB0Z5t2T2D0AY",
  authDomain: "yogamanagementsystem.firebaseapp.com",
  databaseURL: "https://yogamanagementsystem-default-rtdb.firebaseio.com",
  projectId: "yogamanagementsystem",
  storageBucket: "yogamanagementsystem.firebasestorage.app",
  messagingSenderId: "72895669586",
  appId: "1:72895669586:web:0b6725b093ee52544e468b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth (for Node.js environment, we don't need AsyncStorage)
const auth = initializeAuth(app);

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Create test user
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'minh@gmail.com', 
      '123456' // Using a stronger password
    );
    
    console.log('✅ Test user created successfully!');
    console.log('Email: minh@gmail.com');
    console.log('Password: 123456');
    console.log('User ID:', userCredential.user.uid);
    
    console.log('\nYou can now use these credentials to login in your app:');
    console.log('Email: minh@gmail.com');
    console.log('Password: 123456');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  User already exists. You can use these credentials:');
      console.log('Email: minh@gmail.com');
      console.log('Password: 123456');
    } else {
      console.error('❌ Error creating test user:', error.message);
    }
  }
}

// Run the function
createTestUser(); 