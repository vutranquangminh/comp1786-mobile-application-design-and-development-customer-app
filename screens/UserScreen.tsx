import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firestoreHelpers } from '../config/firebase';
import { ModernColors } from '../constants/Colors';
import { useAuth } from '../hooks/useFirestore';

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
};

type UserScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Props {
  navigation: UserScreenNavigationProp;
}

interface UserData {
  Id: number;
  Email: string;
  Password: string;
  Name: string;
  PhoneNumber: string;
  DateOfBirth: string;
  DateCreated: string;
  ImageUrl: string | null;
  Balance?: number;
}

const UserScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut, loading } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);



  useEffect(() => {
    loadUserData();
  }, [user]); // Re-run when user changes

  // Reload user data when screen comes into focus (e.g., returning from EditProfile)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadUserData();
      }
    }, [user])
  );

  const loadUserData = async () => {
    try {
      setLoadingUserData(true);
      setDataLoaded(false); // Reset data loaded state
      
      // Wait a bit to ensure auth state is stable
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // If we have a user from auth state, get latest data from database
      if (user) {
        // Get the latest user data from Firestore to ensure balance is current
        try {
          const users = await firestoreHelpers.queryDocuments('customers', [
            { field: 'Id', operator: '==', value: user.Id }
          ]);
          
          if (users.length > 0) {
            const latestUserData = users[0];
            setUserData(latestUserData);
          } else {
            setUserData(user);
          }
        } catch (error) {
          setUserData(user);
        }
        
        setDataLoaded(true);
        return;
      }
      
      // If no user in auth state, try to get from Firestore as fallback
      const allUsers = await firestoreHelpers.getCollection('customers');
      
      if (allUsers.length > 0) {
        // For demo purposes, use the first user
        setUserData(allUsers[0]);
        setDataLoaded(true);
      } else {
        setDataLoaded(true);
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      setDataLoaded(true);
    } finally {
      setLoadingUserData(false);
    }
  };



  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Navigate back to welcome screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };



  const renderInfoRow = (label: string, value: string) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  if (loading || loadingUserData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={ModernColors.primary.main} />
          <Text style={styles.loadingText}>Loading user data...</Text>
          <Text style={styles.loadingSubtext}>
            {user ? `Logged in as: ${user.Email}` : 'No user in auth state'}
          </Text>
          <Text style={styles.loadingSubtext}>
            Data loaded: {dataLoaded ? 'Yes' : 'No'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if data loading is complete and we have no user data
  if (dataLoaded && !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Unable to load user data</Text>
          <Text style={styles.loadingSubtext}>Please try again later</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Modern Header */}
        <LinearGradient
          colors={[ModernColors.primary.light, ModernColors.primary.main]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.userCard}>
              <View style={styles.avatarContainer}>
                {userData.ImageUrl ? (
                  <View style={styles.avatar}>
                    <Image
                      source={{ uri: userData.ImageUrl }}
                      style={styles.avatarImage}
                      onLoadStart={() => setImageLoading(true)}
                      onLoadEnd={() => setImageLoading(false)}
                      onError={() => {
                        console.log('❌ Failed to load image:', userData.ImageUrl);
                        setImageLoading(false);
                      }}
                    />
                    {imageLoading && (
                      <View style={styles.imageLoadingOverlay}>
                        <ActivityIndicator size="small" color={ModernColors.text.inverse} />
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.avatar}>
                    <Ionicons name="person" size={48} color={ModernColors.text.inverse} />
                  </View>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.name}>{userData.Name}</Text>
                <Text style={styles.memberSince}>Birth: {userData.DateOfBirth}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                ${userData.Balance ? userData.Balance.toFixed(2) : '0.00'}
              </Text>
            </View>
            <Ionicons name="wallet" size={24} color={ModernColors.primary.main} />
          </View>
          <TouchableOpacity 
            style={styles.transactionsButton}
            onPress={() => {
              (navigation as any).navigate('Transactions');
            }}
          >
            <LinearGradient
              colors={[ModernColors.primary.main, ModernColors.primary.dark]}
              style={styles.transactionsButtonGradient}
            >
              <Ionicons name="list" size={20} color={ModernColors.text.inverse} />
              <Text style={styles.transactionsButtonText}>View Transaction History</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Information</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => {
                (navigation as any).navigate('EditProfile', { userData: userData, focusPassword: false });
              }}
            >
              <Ionicons name="create" size={20} color={ModernColors.primary.main} />
            </TouchableOpacity>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="mail" size={16} color={ModernColors.text.tertiary} />
              </View>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userData.Email}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="call" size={16} color={ModernColors.text.tertiary} />
              </View>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{userData.PhoneNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIconContainer}>
                <Ionicons name="calendar" size={16} color={ModernColors.text.tertiary} />
              </View>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>{formatDate(userData.DateCreated)}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.changePasswordButton} 
            onPress={() => {
              (navigation as any).navigate('EditProfile', { userData: userData, focusPassword: true });
            }}
          >
            <LinearGradient
              colors={[ModernColors.primary.main, ModernColors.primary.dark]}
              style={styles.changePasswordButtonGradient}
            >
              <Ionicons name="lock-closed" size={20} color={ModernColors.text.inverse} />
              <Text style={styles.changePasswordText}>Change Password</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color={ModernColors.primary.main} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 16,
    width: '100%',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: ModernColors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: ModernColors.text.inverse,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  balanceCard: {
    backgroundColor: ModernColors.background.primary,
    marginHorizontal: 24,
    marginTop: 20,
    marginBottom: 16,
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
    marginBottom: 16,
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
  transactionsButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  transactionsButtonGradient: {
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  transactionsButtonText: {
    color: ModernColors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: ModernColors.background.primary,
    marginHorizontal: 24,
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 16,
    shadowColor: ModernColors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ModernColors.text.primary,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: ModernColors.background.tertiary,
  },
  infoContainer: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: ModernColors.border.light,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ModernColors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: ModernColors.text.secondary,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: ModernColors.text.primary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  actionButtonsContainer: {
    marginHorizontal: 24,
    marginTop: 16,
    gap: 12,
  },
  changePasswordButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  changePasswordButtonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  changePasswordText: {
    color: ModernColors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: ModernColors.primary.main,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    color: ModernColors.primary.main,
    fontSize: 16,
    fontWeight: '600',
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
  loadingSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: ModernColors.text.tertiary,
    textAlign: 'center',
  },
});

export default UserScreen; 