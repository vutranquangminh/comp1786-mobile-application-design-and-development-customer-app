// Import the functions you need from the SDKs you need
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, limit, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";

// Your web app's Firebase configuration
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

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth with AsyncStorage persistence (handle already-initialized error)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // If auth is already initialized, get the existing instance
  if (error.code === 'auth/already-initialized') {
    console.log('⚠️ Firebase Auth already initialized, using existing instance');
    auth = getAuth(app);
  } else {
    throw error;
  }
}

export { auth };

// Firestore helper functions
export const firestoreHelpers = {
  // Get all documents from a collection
  async getCollection(collectionName: string) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error getting collection:", error);
      throw error;
    }
  },

  // Add a document to a collection
  async addDocument(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return docRef.id;
    } catch (error) {
      console.error("Error adding document:", error);
      throw error;
    }
  },

  // Add a document with custom ID
  async addDocumentWithId(collectionName: string, docId: string, data: any) {
    try {
      await setDoc(doc(db, collectionName, docId), data);
      return docId;
    } catch (error) {
      console.error("Error adding document with custom ID:", error);
      throw error;
    }
  },

  // Update a document
  async updateDocument(collectionName: string, docId: string, data: any) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  },

  // Delete a document
  async deleteDocument(collectionName: string, docId: string) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },

  // Query documents with filters
  async queryDocuments(collectionName: string, filters: any[] = [], orderByField?: string, limitCount?: number) {
    try {
      let q = collection(db, collectionName);
      
      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });

      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField));
      }

      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error("Error querying documents:", error);
      throw error;
    }
  }
};

// Custom Auth helper functions for Firestore-based authentication
export const authHelpers = {
  // Sign up with email and password
  async signUp(email: string, password: string, userData: any) {
    try {
      // Check if user already exists
      const existingUsers = await firestoreHelpers.queryDocuments('customers', [
        { field: 'Email', operator: '==', value: email }
      ]);
      
      if (existingUsers.length > 0) {
        throw new Error('User already exists');
      }

      // Get the next ID by finding the highest existing ID
      const allCustomers = await firestoreHelpers.getCollection('customers');
      let nextId = 1;
      
      if (allCustomers.length > 0) {
        const maxId = Math.max(...allCustomers.map(customer => customer.Id || 0));
        nextId = maxId + 1;
      }

      // Create new user in customers collection
      const newUser = {
        Id: nextId, // Integer ID
        Email: email,
        Password: password,
        Name: userData.fullName,
        PhoneNumber: userData.phone,
        DateOfBirth: userData.dateOfBirth,
        DateCreated: new Date().toISOString().split('T')[0],
        ImageUrl: null,
        Balance: 0
      };

      // Use custom integer document ID
      const docId = nextId.toString();
      console.log('🔧 Creating customer with document ID:', docId);
      await firestoreHelpers.addDocumentWithId('customers', docId, newUser);
      console.log('✅ Customer created successfully with ID:', docId);
      return { uid: docId, ...newUser };
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    try {
      console.log('🔐 authHelpers: Starting sign in for:', email);
      
      const users = await firestoreHelpers.queryDocuments('customers', [
        { field: 'Email', operator: '==', value: email }
      ]);
      console.log('📊 authHelpers: Found users with email:', users.length);
      console.log('📋 authHelpers: Users found:', JSON.stringify(users, null, 2));
      
      if (users.length === 0) {
        console.log('❌ authHelpers: No user found with email:', email);
        throw new Error('User not found');
      }

      const user = users[0];
      console.log('👤 authHelpers: User found:', JSON.stringify(user, null, 2));
      console.log('🔐 authHelpers: Checking password...');
      console.log('🔐 authHelpers: Provided password:', password);
      console.log('🔐 authHelpers: Stored password:', user.Password);
      
      if (user.Password !== password) {
        console.log('❌ authHelpers: Password mismatch');
        throw new Error('Invalid password');
      }

      console.log('✅ authHelpers: Password verified, returning user');
      return user;
    } catch (error) {
      console.error("❌ authHelpers: Error signing in:", error);
      throw error;
    }
  },

  // Sign out (just clear local state)
  async signOut() {
    // In this implementation, we don't need to do anything server-side
    // The local state will be cleared by the hook
  },

  // Get current user (will be managed by the hook)
  getCurrentUser() {
    return null; // This will be managed by the useAuth hook
  },

  // Listen to auth state changes (simplified for our use case)
  onAuthStateChange(callback: (user: any) => void) {
    // For simplicity, we'll just call the callback immediately
    // In a real app, you might want to persist the user state
    return () => {}; // Return unsubscribe function
  }
};

export default app; 