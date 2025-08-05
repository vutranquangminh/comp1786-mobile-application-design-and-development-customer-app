import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
import { ModernColors } from '../constants/Colors';
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
    { id: 'credit_card', label: 'Credit Card', icon: 'card' },
    { id: 'debit_card', label: 'Debit Card', icon: 'card' },
    { id: 'apple_pay', label: 'Apple Pay', icon: 'logo-apple' },
    { id: 'paypal', label: 'PayPal', icon: 'logo-paypal' },
    { id: 'bank_transfer', label: 'Bank Transfer', icon: 'business' },
  ];

  if (loadingBalance) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ModernColors.primary.main} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Modern Header */}
        <LinearGradient
          colors={[ModernColors.background.primary, ModernColors.background.secondary]}
          style={styles.header}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={ModernColors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Purchase</Text>
          <View style={styles.headerSpacer} />
        </LinearGradient>

        {/* Course Card */}
        <View style={styles.courseCard}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseTitle}>{course.title}</Text>
            <Text style={styles.coursePrice}>${course.price}</Text>
          </View>
          <Text style={styles.courseInstructor}>by {teacherName || 'Loading...'}</Text>
          <View style={styles.courseMeta}>
            <View style={styles.metaItem}>
              <View style={styles.metaIconContainer}>
                <Ionicons name="time" size={16} color={ModernColors.text.tertiary} />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Duration</Text>
                <Text style={styles.metaValue}>{course.duration}</Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <View style={styles.metaIconContainer}>
                <Ionicons name="flower" size={16} color={ModernColors.text.tertiary} />
              </View>
              <View style={styles.metaContent}>
                <Text style={styles.metaLabel}>Level</Text>
                <Text style={styles.metaValue}>{course.level}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* User Balance */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={[styles.balanceAmount, userBalance < course.price && styles.insufficientBalance]}>
                ${userBalance.toFixed(2)}
              </Text>
            </View>
            <Ionicons name="wallet" size={24} color={ModernColors.primary.main} />
          </View>
          {userBalance < course.price && (
            <View style={styles.insufficientContainer}>
              <Ionicons name="warning" size={16} color={ModernColors.error.main} />
              <Text style={styles.insufficientText}>Insufficient balance</Text>
            </View>
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
              <View style={styles.paymentIconContainer}>
                <Ionicons 
                  name={paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon as any} 
                  size={20} 
                  color={ModernColors.primary.main} 
                />
              </View>
              <Text style={styles.paymentText}>
                {paymentMethods.find(m => m.id === selectedPaymentMethod)?.label}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={ModernColors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Data Summary */}
        <View style={styles.dataSection}>
          <Text style={styles.sectionTitle}>Summary</Text>
          
          {courseData && (
            <View style={styles.dataRow}>
              <View style={styles.dataIconContainer}>
                <Ionicons name="document-text" size={16} color={ModernColors.text.tertiary} />
              </View>
              <Text style={styles.dataLabel}>Course ID</Text>
              <Text style={styles.dataValue}>{course.id}</Text>
            </View>
          )}
          
          {teacherData && (
            <View style={styles.dataRow}>
              <View style={styles.dataIconContainer}>
                <Ionicons name="person" size={16} color={ModernColors.text.tertiary} />
              </View>
              <Text style={styles.dataLabel}>Instructor</Text>
              <Text style={styles.dataValue}>{teacherData.Name}</Text>
            </View>
          )}
          
          {userData && (
            <View style={styles.dataRow}>
              <View style={styles.dataIconContainer}>
                <Ionicons name="person-circle" size={16} color={ModernColors.text.tertiary} />
              </View>
              <Text style={styles.dataLabel}>Customer</Text>
              <Text style={styles.dataValue}>{userData.Name}</Text>
            </View>
          )}
          
          <View style={styles.dataRow}>
            <View style={styles.dataIconContainer}>
              <Ionicons name="calendar" size={16} color={ModernColors.text.tertiary} />
            </View>
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
            <LinearGradient
              colors={[ModernColors.primary.main, ModernColors.primary.dark]}
              style={styles.purchaseButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color={ModernColors.text.inverse} size="small" />
              ) : (
                <>
                  <Ionicons 
                    name={userBalance < course.price ? "warning" : "card"} 
                    size={20} 
                    color={ModernColors.text.inverse} 
                  />
                  <Text style={styles.purchaseButtonText}>
                    {userBalance < course.price ? 'Insufficient Balance' : 'Complete Purchase'}
                  </Text>
                </>
              )}
            </LinearGradient>
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
                <Ionicons name="close" size={20} color={ModernColors.text.secondary} />
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
                    <View style={styles.paymentOptionIconContainer}>
                      <Ionicons 
                        name={method.icon as any} 
                        size={20} 
                        color={selectedPaymentMethod === method.id ? ModernColors.primary.main : ModernColors.text.secondary} 
                      />
                    </View>
                    <Text style={[
                      styles.paymentOptionLabel,
                      selectedPaymentMethod === method.id && styles.selectedPaymentOptionLabel
                    ]}>
                      {method.label}
                    </Text>
                  </View>
                  {selectedPaymentMethod === method.id && (
                    <Ionicons name="checkmark-circle" size={20} color={ModernColors.primary.main} />
                  )}
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
                <Ionicons name="checkmark-circle" size={40} color={ModernColors.success.main} />
              </View>
              <Text style={styles.successModalTitle}>Purchase Successful!</Text>
              <Text style={styles.successModalSubtitle}>Your course has been purchased successfully</Text>
            </View>
            
            {purchaseDetails && (
              <View style={styles.purchaseDetailsContainer}>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="document-text" size={16} color={ModernColors.text.tertiary} />
                  </View>
                  <Text style={styles.detailLabel}>Course</Text>
                  <Text style={styles.detailValue}>{purchaseDetails.courseTitle}</Text>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="card" size={16} color={ModernColors.text.tertiary} />
                  </View>
                  <Text style={styles.detailLabel}>Amount Paid</Text>
                  <Text style={styles.detailValue}>${purchaseDetails.coursePrice}</Text>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="card" size={16} color={ModernColors.text.tertiary} />
                  </View>
                  <Text style={styles.detailLabel}>Payment Method</Text>
                  <Text style={styles.detailValue}>{purchaseDetails.paymentMethod}</Text>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="wallet" size={16} color={ModernColors.text.tertiary} />
                  </View>
                  <Text style={styles.detailLabel}>New Balance</Text>
                  <Text style={styles.detailValue}>${purchaseDetails.newBalance.toFixed(2)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="calendar" size={16} color={ModernColors.text.tertiary} />
                  </View>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{purchaseDetails.purchaseDate}</Text>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Ionicons name="receipt" size={16} color={ModernColors.text.tertiary} />
                  </View>
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
                <LinearGradient
                  colors={[ModernColors.primary.main, ModernColors.primary.dark]}
                  style={styles.viewCoursesButtonGradient}
                >
                  <Ionicons name="library" size={20} color={ModernColors.text.inverse} />
                  <Text style={styles.viewCoursesButtonText}>View My Courses</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.goBack();
                }}
              >
                <Ionicons name="close" size={20} color={ModernColors.text.secondary} />
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
    backgroundColor: ModernColors.background.secondary,
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
    color: ModernColors.text.secondary,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: ModernColors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  courseCard: {
    backgroundColor: ModernColors.background.primary,
    margin: 24,
    padding: 24,
    borderRadius: 16,
    shadowColor: ModernColors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
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
    color: ModernColors.text.primary,
    flex: 1,
    marginRight: 16,
  },
  coursePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: ModernColors.primary.main,
  },
  courseInstructor: {
    fontSize: 14,
    color: ModernColors.text.secondary,
    marginBottom: 16,
  },
  courseMeta: {
    flexDirection: 'row',
    gap: 24,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ModernColors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  metaContent: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: ModernColors.text.tertiary,
    fontWeight: '500',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    color: ModernColors.text.primary,
    fontWeight: '500',
  },
  balanceCard: {
    backgroundColor: ModernColors.background.primary,
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: ModernColors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: ModernColors.text.secondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: ModernColors.primary.main,
  },
  insufficientBalance: {
    color: ModernColors.error.main,
  },
  insufficientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  insufficientText: {
    fontSize: 12,
    color: ModernColors.error.main,
    fontWeight: '500',
  },
  section: {
    backgroundColor: ModernColors.background.primary,
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: ModernColors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: ModernColors.text.primary,
    marginBottom: 16,
  },
  paymentSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: ModernColors.background.tertiary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ModernColors.border.light,
  },
  paymentSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ModernColors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentText: {
    fontSize: 16,
    color: ModernColors.text.primary,
    fontWeight: '500',
  },
  dataSection: {
    backgroundColor: ModernColors.background.primary,
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: ModernColors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ModernColors.border.light,
  },
  dataIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ModernColors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dataLabel: {
    fontSize: 14,
    color: ModernColors.text.secondary,
    fontWeight: '500',
    flex: 1,
  },
  dataValue: {
    fontSize: 14,
    color: ModernColors.text.primary,
    fontWeight: '500',
  },
  actionContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  purchaseButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  purchaseButtonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: ModernColors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: ModernColors.background.primary,
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
    borderBottomColor: ModernColors.border.light,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ModernColors.text.primary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ModernColors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  paymentMethodOption: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: ModernColors.border.light,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedPaymentMethodOption: {
    backgroundColor: ModernColors.background.tertiary,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentOptionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ModernColors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentOptionLabel: {
    fontSize: 16,
    color: ModernColors.text.primary,
    fontWeight: '500',
  },
  selectedPaymentOptionLabel: {
    color: ModernColors.primary.main,
    fontWeight: '600',
  },
  // Success Modal Styles
  successModalContent: {
    backgroundColor: ModernColors.background.primary,
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
    borderBottomColor: ModernColors.border.light,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ModernColors.success.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: ModernColors.text.primary,
    marginBottom: 8,
  },
  successModalSubtitle: {
    fontSize: 16,
    color: ModernColors.text.secondary,
    textAlign: 'center',
  },
  purchaseDetailsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ModernColors.border.light,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ModernColors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: ModernColors.text.secondary,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: ModernColors.text.primary,
    fontWeight: '600',
  },
  successModalActions: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  viewCoursesButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  viewCoursesButtonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewCoursesButtonText: {
    color: ModernColors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: ModernColors.background.tertiary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  closeButtonText: {
    color: ModernColors.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BuyScreen; 