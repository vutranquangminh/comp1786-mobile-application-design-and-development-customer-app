// Test script to check Firestore access
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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
const db = getFirestore(app);

async function testFirestore() {
  try {
    console.log('Testing Firestore access...');
    
    // Test 1: Get all customers
    console.log('\n1. Getting all customers...');
    const customersSnapshot = await getDocs(collection(db, 'customers'));
    console.log('Total customers found:', customersSnapshot.size);
    
    customersSnapshot.forEach((doc) => {
      console.log('Customer:', doc.id, '=>', doc.data());
    });
    
    // Test 2: Query by email
    console.log('\n2. Querying for minh@gmail.com...');
    const q = query(collection(db, 'customers'), where('Email', '==', 'minh@gmail.com'));
    const querySnapshot = await getDocs(q);
    console.log('Users with minh@gmail.com:', querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      console.log('Found user:', doc.id, '=>', doc.data());
    });
    
    // Test 3: Query by email (bob)
    console.log('\n3. Querying for bob@example.com...');
    const q2 = query(collection(db, 'customers'), where('Email', '==', 'bob@example.com'));
    const querySnapshot2 = await getDocs(q2);
    console.log('Users with bob@example.com:', querySnapshot2.size);
    
    querySnapshot2.forEach((doc) => {
      console.log('Found user:', doc.id, '=>', doc.data());
    });
    
  } catch (error) {
    console.error('Error testing Firestore:', error);
  }
}

testFirestore(); 