// Script to fix customer document IDs to use integers instead of GUIDs
// This script will recreate all customers with proper integer document IDs

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, setDoc, doc, deleteDoc } = require('firebase/firestore');

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

async function fixCustomerIds() {
  try {
    console.log('🔧 Starting to fix customer document IDs...');
    
    // Get all existing customers
    const customersSnapshot = await getDocs(collection(db, 'customers'));
    const customers = customersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`📊 Found ${customers.length} customers to fix`);
    
    // Sort customers by their Id field to maintain order
    customers.sort((a, b) => (a.Id || 0) - (b.Id || 0));
    
    // Recreate each customer with proper integer document ID
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      const newDocId = (i + 1).toString(); // 1, 2, 3, 4, 5...
      
      console.log(`🔄 Processing customer ${customer.Id} (${customer.Name})...`);
      console.log(`   Old document ID: ${customer.id}`);
      console.log(`   New document ID: ${newDocId}`);
      
      // Create new document with integer ID
      const customerData = {
        Id: customer.Id,
        Email: customer.Email,
        Password: customer.Password,
        Name: customer.Name,
        PhoneNumber: customer.PhoneNumber,
        DateOfBirth: customer.DateOfBirth,
        DateCreated: customer.DateCreated,
        ImageUrl: customer.ImageUrl,
        Balance: customer.Balance || 0
      };
      
      // Create new document with integer ID
      await setDoc(doc(db, 'customers', newDocId), customerData);
      console.log(`   ✅ Created new document with ID: ${newDocId}`);
      
      // Delete old document with GUID
      if (customer.id !== newDocId) {
        await deleteDoc(doc(db, 'customers', customer.id));
        console.log(`   🗑️  Deleted old document with ID: ${customer.id}`);
      }
    }
    
    console.log('✅ Successfully fixed all customer document IDs!');
    console.log('📋 Summary:');
    console.log(`   - Processed ${customers.length} customers`);
    console.log(`   - All customers now have integer document IDs (1, 2, 3, 4, 5...)`);
    console.log(`   - Old GUID document IDs have been removed`);
    
  } catch (error) {
    console.error('❌ Error fixing customer IDs:', error);
  }
}

// Run the function
fixCustomerIds(); 