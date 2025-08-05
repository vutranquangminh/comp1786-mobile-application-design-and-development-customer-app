// Script to create a test user in Firebase Auth and Firestore
// Run this script once to create a test user for login testing

const { initializeApp } = require('firebase/app');
const { initializeAuth, getReactNativePersistence, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

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

// Initialize Firestore
const db = getFirestore(app);

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Create test user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'minh@gmail.com', 
      '123456' // Using a stronger password
    );
    
    console.log('✅ Firebase Auth user created successfully!');
    console.log('User ID:', userCredential.user.uid);
    
    // Create corresponding user in Firestore customers collection
    const customerData = {
      Id: 1, // Unique ID for the customer
      Email: 'minh@gmail.com',
      Password: '123456',
      Name: 'Minh Nguyen',
      PhoneNumber: '+1234567890',
      DateOfBirth: '1990-01-01',
      DateCreated: new Date().toISOString(),
      ImageUrl: null,
      Balance: 100.00
    };
    
    const customerDoc = await addDoc(collection(db, 'customers'), customerData);
    
    console.log('✅ Firestore customer created successfully!');
    console.log('Customer document ID:', customerDoc.id);
    
    console.log('\n🎉 Test user created successfully!');
    console.log('Email: minh@gmail.com');
    console.log('Password: 123456');
    console.log('Name: Minh Nguyen');
    console.log('Balance: $100.00');
    
    console.log('\nYou can now use these credentials to login in your app:');
    console.log('Email: minh@gmail.com');
    console.log('Password: 123456');
    
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Firebase Auth user already exists.');
      
      // Try to create just the Firestore customer
      try {
        const customerData = {
          Id: 1,
          Email: 'minh@gmail.com',
          Password: '123456',
          Name: 'Minh Nguyen',
          PhoneNumber: '+1234567890',
          DateOfBirth: '1990-01-01',
          DateCreated: new Date().toISOString(),
          ImageUrl: null,
          Balance: 100.00
        };
        
        const customerDoc = await addDoc(collection(db, 'customers'), customerData);
        console.log('✅ Firestore customer created successfully!');
        console.log('Customer document ID:', customerDoc.id);
        
        console.log('\nYou can now use these credentials to login:');
        console.log('Email: minh@gmail.com');
        console.log('Password: 123456');
      } catch (firestoreError) {
        console.log('ℹ️  Customer might already exist in Firestore.');
        console.log('You can try using these credentials:');
        console.log('Email: minh@gmail.com');
        console.log('Password: 123456');
      }
    } else {
      console.error('❌ Error creating test user:', error.message);
    }
  }
}

// Run the function
createTestUser(); 