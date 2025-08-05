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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [teacherName, setTeacherName] = useState<string>('');
  const [courseData, setCourseData] = useState<any>(null);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoadingBalance(true);
      
      // Load course details
      const courses = await firestoreHelpers.queryDocuments('courses', [
        { field: 'Id', operator: '==', value: parseInt(course.id) }
      ]);
      
      if (courses.length > 0) {
        const courseInfo = courses[0];
        setCourseData(courseInfo);
        
        // Load teacher data
        if ((courseInfo as any).TeacherId) {
          const teachers = await firestoreHelpers.queryDocuments('teachers', [
            { field: 'Id', operator: '==', value: (courseInfo as any).TeacherId }
          ]);
          
          if (teachers.length > 0) {
            setTeacherData(teachers[0]);
            setTeacherName((teachers[0] as any).Name);
          }
        }
      }

      // Load user data and balance
      if (user) {
        await loadUserData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingBalance(false);
    }
  };

  const loadUserData = async () => {
    try {
      const users = await firestoreHelpers.queryDocuments('customers', [
        { field: 'Id', operator: '==', value: user.Id }
      ]);
      
      if (users.length > 0) {
        const currentUser = users[0];
        setUserData(currentUser);
        setUserBalance((currentUser as any).Balance || 0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
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

      // 2. Add to course_customer_crossrefs with custom document ID
      const crossrefDocId = `${user.Id}_${course.id}`;
      await firestoreHelpers.addDocumentWithId('course_customer_crossrefs', crossrefDocId, purchaseData);

      // Get the next available transaction ID
      const transactionsSnapshot = await firestoreHelpers.getCollection('transactions');
      let nextTransactionId = 1;
      
      if (transactionsSnapshot.length > 0) {
        const maxId = Math.max(...transactionsSnapshot.map(transaction => transaction.Id || 0));
        nextTransactionId = maxId + 1;
      }

      // 3. Create transaction record
      const transactionData = {
        Id: nextTransactionId,
        CustomerId: user.Id,
        Amount: course.price.toString(),
        DateTime: new Date().toISOString().split('T')[0],
        PaymentMethod: paymentMethods.find(m => m.id === selectedPaymentMethod)?.label || 'Credit Card',
        Status: true
      };

      // Use custom integer document ID
      const docId = nextTransactionId.toString();
      await firestoreHelpers.addDocumentWithId('transactions', docId, transactionData);

      // 4. Update user balance
      const newBalance = userBalance - course.price;
      
      try {
        await firestoreHelpers.updateDocument('customers', user.Id.toString(), {
          Balance: newBalance
        });
      } catch (updateError) {
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
          console.error('Error updating balance:', altError);
        }
      }

      // Set purchase details for success modal
      setPurchaseDetails({
        courseTitle: course.title,
        coursePrice: course.price,
        paymentMethod: paymentMethods.find(m => m.id === selectedPaymentMethod)?.label || 'Credit Card',
        newBalance: newBalance,
        purchaseDate: new Date().toLocaleDateString(),
        transactionId: nextTransactionId
      });

      // Show success modal instead of navigating immediately
      setShowSuccessModal(true);

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

  if (loadingBalance) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Modern Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Purchase</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Course Card */}
        <View style={styles.courseCard}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.coursePrice}>${course.price}</Text>
          </View>
          <Text style={styles.courseInstructor}>by {teacherName || 'Loading...'}</Text>
          <View style={styles.courseMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Duration</Text>
              <Text style={styles.metaValue}>{course.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Level</Text>
              <Text style={styles.metaValue}>{course.level}</Text>
            </View>
          </View>
        </View>

        {/* User Balance */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={[styles.balanceAmount, userBalance < course.price && styles.insufficientBalance]}>
              ${userBalance.toFixed(2)}
            </Text>
          </View>
          {userBalance < course.price && (
            <Text style={styles.insufficientText}>Insufficient balance</Text>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity
            style={styles.paymentSelector}
            onPress={() => setShowPaymentModal(true)}
          >
            <View style={styles.paymentSelectorContent}>
              <Text style={styles.paymentIcon}>
                {paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon}
              </Text>
              <Text style={styles.paymentText}>
                {paymentMethods.find(m => m.id === selectedPaymentMethod)?.label}
              </Text>
            </View>
            <Text style={styles.selectorArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Data Summary */}
        <View style={styles.dataSection}>
          <Text style={styles.sectionTitle}>Summary</Text>
          
          {courseData && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Course ID</Text>
              <Text style={styles.dataValue}>{course.id}</Text>
            </View>
          )}
          
          {teacherData && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Instructor</Text>
              <Text style={styles.dataValue}>{teacherData.Name}</Text>
            </View>
          )}
          
          {userData && (
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Customer</Text>
              <Text style={styles.dataValue}>{userData.Name}</Text>
            </View>
          )}
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Date</Text>
            <Text style={styles.dataValue}>{new Date().toLocaleDateString()}</Text>
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
                {userBalance < course.price ? 'Insufficient Balance' : 'Complete Purchase'}
              </Text>
            )}
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
              {paymentMethods.map((method) => (
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
                  <View style={styles.paymentOptionContent}>
                    <Text style={styles.paymentOptionIcon}>{method.icon}</Text>
                    <Text style={[
                      styles.paymentOptionLabel,
                      selectedPaymentMethod === method.id && styles.selectedPaymentOptionLabel
                    ]}>
                      {method.label}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Purchase Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successModalHeader}>
              <View style={styles.successIconContainer}>
                <Text style={styles.successIcon}>✅</Text>
              </View>
              <Text style={styles.successModalTitle}>Purchase Successful!</Text>
              <Text style={styles.successModalSubtitle}>Your course has been purchased successfully</Text>
            </View>
            
            {purchaseDetails && (
              <View style={styles.purchaseDetailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Course</Text>
                  <Text style={styles.detailValue}>{purchaseDetails.courseTitle}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount Paid</Text>
                  <Text style={styles.detailValue}>${purchaseDetails.coursePrice}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment Method</Text>
                  <Text style={styles.detailValue}>{purchaseDetails.paymentMethod}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>New Balance</Text>
                  <Text style={styles.detailValue}>${purchaseDetails.newBalance.toFixed(2)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{purchaseDetails.purchaseDate}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Transaction ID</Text>
                  <Text style={styles.detailValue}>#{purchaseDetails.transactionId}</Text>
                </View>
              </View>
            )}

            <View style={styles.successModalActions}>
              <TouchableOpacity
                style={styles.viewCoursesButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.navigate('MainTabs', { screen: 'Courses' });
                }}
              >
                <Text style={styles.viewCoursesButtonText}>View My Courses</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#475569',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerSpacer: {
    width: 40,
  },
  courseCard: {
    backgroundColor: '#ffffff',
    margin: 24,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 16,
  },
  coursePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8b5cf6',
  },
  courseInstructor: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  courseMeta: {
    flexDirection: 'row',
    gap: 24,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8b5cf6',
  },
  insufficientBalance: {
    color: '#dc2626',
  },
  insufficientText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  paymentSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  paymentSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  paymentText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  selectorArrow: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '300',
  },
  dataSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dataLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  actionContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  purchaseButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#8b5cf6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  purchaseButtonText: {
    color: '#ffffff',
    fontSize: 16,
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
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  paymentMethodOption: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedPaymentMethodOption: {
    backgroundColor: '#f8fafc',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  paymentOptionLabel: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  selectedPaymentOptionLabel: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  // Success Modal Styles
  successModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  successModalHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 40,
  },
  successModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  successModalSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  purchaseDetailsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  successModalActions: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  viewCoursesButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#8b5cf6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  viewCoursesButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BuyScreen; 