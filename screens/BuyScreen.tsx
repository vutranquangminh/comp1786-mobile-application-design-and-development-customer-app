import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firestoreHelpers } from '../config/firebase';
import { useAuth } from '../hooks/useFirestore';

interface BuyScreenProps {
  route: {
    params: {
      course: {
        id: string;
        title: string;
        instructor: string;
        duration: string;
        level: string;
        price: number;
        description: string;
      };
    };
  };
  navigation: any;
}

type PaymentMethod = 'credit_card' | 'debit_card' | 'apple_pay' | 'paypal' | 'bank_transfer';

const BuyScreen: React.FC<BuyScreenProps> = ({ route, navigation }) => {
  const { course } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [userBalance, setUserBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [teacherName, setTeacherName] = useState<string>('');

  useEffect(() => {
    loadUserBalance();
    loadTeacherName();
  }, []);

  // Reload balance when user changes
  useEffect(() => {
    if (user) {
      loadUserBalance();
    }
  }, [user]);

  const loadTeacherName = async () => {
    try {
      // Get the course details from Firestore to get TeacherId
      const courses = await firestoreHelpers.queryDocuments('courses', [
        { field: 'Id', operator: '==', value: parseInt(course.id) }
      ]);
      
      if (courses.length > 0) {
        const courseData = courses[0];
        const teacherId = courseData.TeacherId;
        
        // Get teacher name from teachers collection
        const teachers = await firestoreHelpers.queryDocuments('teachers', [
          { field: 'Id', operator: '==', value: teacherId }
        ]);
        
        if (teachers.length > 0) {
          const teacher = teachers[0];
          setTeacherName(teacher.Name);
        } else {
          setTeacherName(`Teacher ${teacherId}`);
        }
      } else {
        setTeacherName('Unknown Teacher');
      }
    } catch (error) {
      setTeacherName('Unknown Teacher');
    }
  };

  const loadUserBalance = async () => {
    try {
      setLoadingBalance(true);
      
      if (user) {
        // Get the latest user data from Firestore to get current balance
        const users = await firestoreHelpers.queryDocuments('customers', [
          { field: 'Id', operator: '==', value: user.Id }
        ]);
        
        if (users.length > 0) {
          const currentUser = users[0];
          const balance = currentUser.Balance || 0;
          setUserBalance(balance);
        } else {
          setUserBalance(0);
        }
      } else {
        setUserBalance(0);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load user balance: ' + error.message);
      setUserBalance(0);
    } finally {
      setLoadingBalance(false);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in to purchase courses');
      return;
    }

    if (userBalance < course.price) {
      Alert.alert(
        'Insufficient Balance',
        `You need $${course.price.toFixed(2)} but your balance is $${userBalance.toFixed(2)}. Please add more funds to your account.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Funds', onPress: () => navigation.navigate('AddFunds') }
        ]
      );
      return;
    }

        setLoading(true);
    try {
      // 1. Create the course purchase record
      const purchaseData = {
        customerId: user.Id,
        courseId: parseInt(course.id)
      };

      // 2. Add to course_customer_crossrefs
      await firestoreHelpers.addDocument('course_customer_crossrefs', purchaseData);

      // 3. Create transaction record
      const transactionData = {
        Id: Date.now(), // Generate a unique ID (timestamp)
        CustomerId: user.Id,
        Amount: course.price.toString(), // Convert to string to match your structure
        DateTime: new Date().toISOString().split('T')[0], // Format as "YYYY-MM-DD"
        PaymentMethod: paymentMethods.find(m => m.id === selectedPaymentMethod)?.label || 'Credit Card',
        Status: true // Boolean true for successful transaction
      };

      await firestoreHelpers.addDocument('transactions', transactionData);

      // 4. Update user balance
      const newBalance = userBalance - course.price;
      
      try {
        await firestoreHelpers.updateDocument('customers', user.Id.toString(), {
          Balance: newBalance
        });
      } catch (updateError) {
        // Try alternative approach - query and update
        try {
          const users = await firestoreHelpers.queryDocuments('customers', [
            { field: 'Id', operator: '==', value: user.Id }
          ]);

          if (users.length > 0) {
            const userDoc = users[0];
            await firestoreHelpers.updateDocument('customers', userDoc.id, {
              Balance: newBalance
            });
          }
        } catch (altError) {
          // Handle error silently
        }
      }

      // 5. Auto redirect to Courses tab after successful purchase
      navigation.navigate('MainTabs', { screen: 'Courses' });

    } catch (error) {
      Alert.alert('Purchase Failed', 'There was an error processing your purchase. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'credit_card', label: 'Credit Card', icon: '💳' },
    { id: 'debit_card', label: 'Debit Card', icon: '💳' },
    { id: 'apple_pay', label: 'Apple Pay', icon: '🍎' },
    { id: 'paypal', label: 'PayPal', icon: '📱' },
    { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  ];

  const renderPaymentMethod = (method: typeof paymentMethods[0]) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethodOption,
        selectedPaymentMethod === method.id && styles.selectedPaymentMethodOption
      ]}
      onPress={() => {
        setSelectedPaymentMethod(method.id as PaymentMethod);
        setShowPaymentModal(false);
      }}
    >
      <Text style={styles.paymentIcon}>{method.icon}</Text>
      <Text style={[
        styles.paymentOptionLabel,
        selectedPaymentMethod === method.id && styles.selectedPaymentOptionLabel
      ]}>
        {method.label}
      </Text>
    </TouchableOpacity>
  );

  if (loadingBalance) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#27ae60" />
          <Text style={styles.loadingText}>Loading payment details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Purchase Course</Text>
          </View>
        </View>

        {/* Course Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Details</Text>
          <View style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <View style={styles.courseTitleContainer}>
                <Text style={styles.courseTitle}>{course.title}</Text>
                <Text style={styles.courseInstructor}>by {teacherName || 'Loading...'}</Text>
              </View>
              <Text style={styles.coursePrice}>${course.price.toFixed(2)}</Text>
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.courseInfoText}>⏱️ {course.duration}</Text>
              <Text style={styles.courseInfoText}>📊 {course.level}</Text>
            </View>
            <Text style={styles.courseDescription}>{course.description}</Text>
          </View>
        </View>

        {/* User Balance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Balance</Text>
          <View style={styles.balanceCard}>
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>${userBalance.toFixed(2)}</Text>
            </View>
            {userBalance < course.price && (
              <Text style={styles.insufficientBalance}>
                ⚠️ Insufficient balance for this purchase
              </Text>
            )}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={styles.paymentDropdown}
            onPress={() => setShowPaymentModal(true)}
          >
            <View style={styles.paymentDropdownContent}>
              <Text style={styles.paymentIcon}>
                {paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon}
              </Text>
              <Text style={styles.paymentDropdownText}>
                {paymentMethods.find(m => m.id === selectedPaymentMethod)?.label}
              </Text>
            </View>
            <Text style={styles.paymentDropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Purchase Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purchase Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Course Price:</Text>
              <Text style={styles.summaryValue}>${course.price.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Payment Method:</Text>
              <Text style={styles.summaryValue}>
                {paymentMethods.find(m => m.id === selectedPaymentMethod)?.label}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${course.price.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.purchaseButton,
              (loading || userBalance < course.price) && styles.disabledButton
            ]}
            onPress={handlePurchase}
            disabled={loading || userBalance < course.price}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.purchaseButtonText}>
                {userBalance < course.price ? 'Insufficient Balance' : 'Confirm Purchase'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>


        </View>
      </ScrollView>

      {/* Payment Method Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Method</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScrollView}>
              {paymentMethods.map(renderPaymentMethod)}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  backButtonText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  courseCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  courseInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  courseInfoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 16,
  },
  courseDescription: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
    marginBottom: 12,
  },
  coursePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27ae60',
    textAlign: 'right',
  },
  balanceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  insufficientBalance: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '500',
  },

  paymentDropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentDropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentDropdownText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
    marginLeft: 12,
  },
  paymentDropdownArrow: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  selectedPaymentMethodOption: {
    backgroundColor: '#f8f9fa',
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentOptionLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  selectedPaymentOptionLabel: {
    color: '#27ae60',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 20,
    color: '#7f8c8d',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    marginTop: 8,
    paddingTop: 16,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  summaryValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    color: '#27ae60',
    fontWeight: 'bold',
  },
  actionContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  purchaseButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  purchaseButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
    fontWeight: '500',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
});

export default BuyScreen; 