import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firestoreHelpers } from '../config/firebase';

const TestFirestoreScreen: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testFirestoreConnection = async () => {
    try {
      addResult('Testing Firestore connection...');
      
      const allUsers = await firestoreHelpers.getCollection('customers');
      addResult(`✅ Success! Found ${allUsers.length} users`);
      
      if (allUsers.length > 0) {
        const firstUser = allUsers[0];
        addResult(`First user: ${firstUser.Name} (${firstUser.Email})`);
      }
      
    } catch (error) {
      addResult(`❌ Error: ${error.message}`);
      console.error('Firestore test failed:', error);
    }
  };

  const testQuery = async () => {
    try {
      addResult('Testing query for minh@gmail.com...');
      
      const users = await firestoreHelpers.queryDocuments('customers', [
        { field: 'Email', operator: '==', value: 'minh@gmail.com' }
      ]);
      
      addResult(`✅ Query successful! Found ${users.length} users`);
      
      if (users.length > 0) {
        const user = users[0];
        addResult(`User found: ${user.Name} (${user.Email})`);
      }
      
    } catch (error) {
      addResult(`❌ Query error: ${error.message}`);
      console.error('Query test failed:', error);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Firestore Test Screen</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={testFirestoreConnection}>
            <Text style={styles.buttonText}>Test Connection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={testQuery}>
            <Text style={styles.buttonText}>Test Query</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={clearResults}>
            <Text style={styles.buttonText}>Clear Results</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>{result}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#2c3e50',
  },
  buttonContainer: {
    gap: 15,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#34495e',
    fontFamily: 'monospace',
  },
});

export default TestFirestoreScreen; 