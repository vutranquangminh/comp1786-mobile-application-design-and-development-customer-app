import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firestoreHelpers } from '../config/firebase';
import { useAuth } from '../hooks/useFirestore';

interface TransactionScreenProps {
  navigation: any;
}

interface Transaction {
  Id: number;
  CustomerId: number;
  Amount: string;
  DateTime: string;
  PaymentMethod: string;
  Status: boolean;
}

const TransactionScreen: React.FC<TransactionScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [updatingBalance, setUpdatingBalance] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, [user]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      
      if (user) {
        // Get user data first
        const users = await firestoreHelpers.queryDocuments('customers', [
          { field: 'Id', operator: '==', value: user.Id }
        ]);
        
        if (users.length > 0) {
          setUserData(users[0]);
        }

        // Load transactions for this user
        const userTransactions = await firestoreHelpers.queryDocuments('transactions', [
          { field: 'CustomerId', operator: '==', value: user.Id }
        ]);
        
        setTransactions(userTransactions);
      }
    } catch (error) {
      console.error('❌ Error loading transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUpdateBalance = async () => {
    if (!amount.trim()) {
      Alert.alert('Error', 'Please enter an amount');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid positive amount');
      return;
    }

    setUpdatingBalance(true);
    try {
      // Find the correct document ID by querying for the user
      const users = await firestoreHelpers.queryDocuments('customers', [
        { field: 'Id', operator: '==', value: user.Id }
      ]);
      
      if (users.length === 0) {
        throw new Error('User document not found');
      }
      
      // Get the Firestore document ID
      const userDoc = users[0];
      const documentId = userDoc.id;
      
      // Calculate new balance
      const currentBalance = userData.Balance || 0;
      const newBalance = currentBalance + numAmount;
      
      // Update balance in Firestore
      await firestoreHelpers.updateDocument('customers', documentId, {
        Balance: newBalance
      });

      // Get the next available transaction ID
      const transactionsSnapshot = await firestoreHelpers.getCollection('transactions');
      let nextTransactionId = 1;
      
      if (transactionsSnapshot.length > 0) {
        const maxId = Math.max(...transactionsSnapshot.map(transaction => transaction.Id || 0));
        nextTransactionId = maxId + 1;
      }

      // Create a transaction record for the balance update
      const transactionData = {
        Id: nextTransactionId,
        CustomerId: user.Id,
        Amount: numAmount.toString(),
        DateTime: new Date().toISOString().split('T')[0],
        PaymentMethod: 'Balance Update',
        Status: true
      };

      // Use custom integer document ID
      const docId = nextTransactionId.toString();
      await firestoreHelpers.addDocumentWithId('transactions', docId, transactionData);

      // Update local state
      setUserData({ ...userData, Balance: newBalance });
      setAmount('');
      
      // Reload transactions to show the new transaction
      await loadTransactions();

      Alert.alert('Success', `Balance updated successfully! New balance: $${newBalance.toFixed(2)}`);
    } catch (error) {
      console.error('❌ Error updating balance:', error);
      Alert.alert('Error', 'Failed to update balance. Please try again.');
    } finally {
      setUpdatingBalance(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* User Info */}
        {userData && (
          <View style={styles.userCard}>
            <Text style={styles.userName}>{userData.Name}</Text>
            <Text style={styles.userEmail}>{userData.Email}</Text>
          </View>
        )}

        {/* Balance Update Section */}
        {userData && (
          <View style={styles.balanceUpdateCard}>
            <Text style={styles.balanceUpdateTitle}>Update Account Balance</Text>
            <Text style={styles.currentBalanceText}>
              Current Balance: ${userData.Balance ? userData.Balance.toFixed(2) : '0.00'}
            </Text>
            
            <View style={styles.amountInputContainer}>
              <Text style={styles.amountLabel}>Amount to Add</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="Enter amount (e.g., 50.00)"
                placeholderTextColor="#94a3b8"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>
            
            <TouchableOpacity
              style={[styles.updateBalanceButton, updatingBalance && styles.updateBalanceButtonDisabled]}
              onPress={handleUpdateBalance}
              disabled={updatingBalance}
            >
              {updatingBalance ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.updateBalanceButtonText}>Add to Balance</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Transactions */}
        {transactions.length > 0 ? (
          <View style={styles.transactionsContainer}>
            {transactions.map((transaction, index) => (
              <View key={index} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.DateTime)}
                    </Text>
                    <Text style={styles.transactionTime}>
                      {formatTime(transaction.DateTime)}
                    </Text>
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text style={[
                      styles.amountText,
                      transaction.PaymentMethod === 'Balance Update' ? styles.positiveAmount : styles.negativeAmount
                    ]}>
                      {transaction.PaymentMethod === 'Balance Update' ? '+' : '-'}${parseFloat(transaction.Amount).toFixed(2)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.transactionDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Payment Method</Text>
                    <Text style={styles.detailValue}>{transaction.PaymentMethod}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <View style={styles.statusContainer}>
                      <Text style={[
                        styles.statusText,
                        transaction.Status ? styles.statusCompleted : styles.statusPending
                      ]}>
                        {transaction.Status ? 'Completed' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Transaction ID</Text>
                    <Text style={styles.detailValue}>#{transaction.Id}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptyText}>
              You haven't made any purchases yet. Start exploring our courses!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#1e293b',
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  userCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  balanceUpdateCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  balanceUpdateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  currentBalanceText: {
    fontSize: 16,
    color: '#8b5cf6',
    fontWeight: '600',
    marginBottom: 16,
  },
  amountInputContainer: {
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  updateBalanceButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  updateBalanceButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  updateBalanceButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  transactionsContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  transactionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 20,
    fontWeight: '700',
  },
  positiveAmount: {
    color: '#059669',
  },
  negativeAmount: {
    color: '#dc2626',
  },
  transactionDetails: {
    padding: 20,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusCompleted: {
    color: '#059669',
  },
  statusPending: {
    color: '#d97706',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default TransactionScreen; 