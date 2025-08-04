import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { authHelpers, firestoreHelpers } from '../config/firebase';

export const useFirestore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Get all documents from a collection
  const getCollection = async (collectionName: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await firestoreHelpers.getCollection(collectionName);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
      throw err;
    }
  };

  // Add a document to a collection
  const addDocument = async (collectionName: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const docId = await firestoreHelpers.addDocument(collectionName, data);
      setLoading(false);
      return docId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
      throw err;
    }
  };

  // Update a document
  const updateDocument = async (collectionName: string, docId: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      await firestoreHelpers.updateDocument(collectionName, docId, data);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
      throw err;
    }
  };

  // Delete a document
  const deleteDocument = async (collectionName: string, docId: string) => {
    setLoading(true);
    setError(null);
    try {
      await firestoreHelpers.deleteDocument(collectionName, docId);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
      throw err;
    }
  };

  // Query documents with filters
  const queryDocuments = async (
    collectionName: string, 
    filters: any[] = [], 
    orderByField?: string, 
    limitCount?: number
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await firestoreHelpers.queryDocuments(collectionName, filters, orderByField, limitCount);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
      throw err;
    }
  };

  return {
    loading,
    error,
    clearError,
    getCollection,
    addDocument,
    updateDocument,
    deleteDocument,
    queryDocuments,
  };
};

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Initialize user state from AsyncStorage on mount
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('currentUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('📱 useAuth: Loaded user from storage:', parsedUser.Name);
          setUser(parsedUser);
        }
      } catch (error) {
        console.log('📱 useAuth: No stored user found');
      }
    };
    
    loadUserFromStorage();
  }, []);

  // Debug: Log user state changes
  useEffect(() => {
    console.log('🔄 useAuth: user state changed:', user ? `User: ${user.Name} (${user.Email})` : 'No user');
    if (user) {
      console.log('👤 useAuth: User details:');
      console.log('   - ID:', user.Id);
      console.log('   - Name:', user.Name);
      console.log('   - Email:', user.Email);
      console.log('   - Phone:', user.PhoneNumber);
      console.log('   - DOB:', user.DateOfBirth);
      console.log('   - Created:', user.DateCreated);
      console.log('👤 useAuth: Full user object:', JSON.stringify(user, null, 2));
    } else {
      console.log('❌ useAuth: No user in state');
    }
  }, [user]);

  const signUp = async (email: string, password: string, userData: any) => {
    setError(null);
    setLoading(true);
    try {
      const userCredential = await authHelpers.signUp(email, password, userData);
      setUser(userCredential);
      setLoading(false);
      return userCredential;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      console.log('🔐 useAuth: Attempting sign in for:', email);
      console.log('🔐 useAuth: Password provided:', password ? 'Yes' : 'No');
      
      const userCredential = await authHelpers.signIn(email, password);
      console.log('✅ useAuth: Sign in successful!');
      console.log('✅ useAuth: User credential details:');
      console.log('   - User ID:', userCredential.Id);
      console.log('   - User Name:', userCredential.Name);
      console.log('   - User Email:', userCredential.Email);
      console.log('   - User Phone:', userCredential.PhoneNumber);
      console.log('✅ useAuth: Full user credential JSON:', JSON.stringify(userCredential, null, 2));
      
      console.log('🔄 useAuth: Setting user state...');
      setUser(userCredential);
      console.log('✅ useAuth: User state set successfully');
      
      // Store user in AsyncStorage for persistence
      try {
        await AsyncStorage.setItem('currentUser', JSON.stringify(userCredential));
        console.log('📱 useAuth: User stored in AsyncStorage');
      } catch (error) {
        console.error('❌ useAuth: Failed to store user in AsyncStorage:', error);
      }
      
      // Add a small delay to ensure state is properly set
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('✅ useAuth: Delay completed, user state should be stable');
      
      setLoading(false);
      return userCredential;
    } catch (err) {
      console.error('❌ useAuth: Sign in failed:', err);
      console.error('❌ useAuth: Error details:', JSON.stringify(err, null, 2));
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    setError(null);
    try {
      await authHelpers.signOut();
      setUser(null);
      
      // Clear stored user from AsyncStorage
      try {
        await AsyncStorage.removeItem('currentUser');
        console.log('📱 useAuth: User cleared from AsyncStorage');
      } catch (error) {
        console.error('❌ useAuth: Failed to clear user from AsyncStorage:', error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    clearError,
    signUp,
    signIn,
    signOut,
  };
}; 