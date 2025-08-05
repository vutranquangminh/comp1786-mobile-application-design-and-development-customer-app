import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
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
          <ActivityIndicator size="large" color="#8b5cf6" />
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
        {/* Simple Header */}
        <View style={styles.header}>
          <View style={styles.headerBackground} />
          <View style={styles.headerContent}>
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
                      <ActivityIndicator size="small" color="#8b5cf6" />
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {userData.Name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.name}>{userData.Name}</Text>
            <Text style={styles.memberSince}>{formatDate(userData.DateCreated)}</Text>
          </View>
        </View>

        {/* Balance Card with Transaction Button */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              ${userData.Balance ? userData.Balance.toFixed(2) : '0.00'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.transactionsButton}
            onPress={() => {
              (navigation as any).navigate('Transactions');
            }}
          >
            <Text style={styles.transactionsButtonText}>View Transaction History</Text>
          </TouchableOpacity>
        </View>

        {/* Simple Information Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Information</Text>
            <TouchableOpacity 
              style={styles.editIcon}
              onPress={() => {
                (navigation as any).navigate('EditProfile', { userData: userData, focusPassword: false });
              }}
            >
              <Text style={styles.editIconText}>✏️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.infoContainer}>
            {renderInfoRow('Email', userData.Email)}
            {renderInfoRow('Phone', userData.PhoneNumber)}
            {renderInfoRow('Birth', userData.DateOfBirth)}
          </View>
        </View>

        {/* Simple Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.changePasswordButton} 
            onPress={() => {
              (navigation as any).navigate('EditProfile', { userData: userData, focusPassword: true });
            }}
          >
            <Text style={styles.changePasswordText}>Password</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    position: 'relative',
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#8b5cf6',
    opacity: 0.1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 1,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  avatarText: {
    fontSize: 60,
    fontWeight: '600',
    color: '#ffffff',
  },
  avatarImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  memberBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  memberSince: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  editIcon: {
    padding: 8,
  },
  editIconText: {
    fontSize: 20,
  },
  infoContainer: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  infoLabel: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  settingButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  settingButtonText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  actionButtonsContainer: {
    marginHorizontal: 24,
    marginTop: 16,
    gap: 16,
  },
  changePasswordButton: {
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
  changePasswordText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  logoutButtonText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '600',
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 16,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#8b5cf6',
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
  loadingSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  transactionsButton: {
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
  transactionsButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserScreen; 