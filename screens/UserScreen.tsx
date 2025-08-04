import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

  // Add effect to log state changes
  useEffect(() => {
    console.log('🔄 userData state changed:', userData ? 'Has data' : 'No data');
    if (userData) {
      console.log('👤 Current userData:', JSON.stringify(userData, null, 2));
    }
  }, [userData]);

  // Add effect to track user state changes from useAuth
  useEffect(() => {
    console.log('🔄 UserScreen: user from useAuth changed:', user ? `User: ${user.Name} (${user.Email})` : 'No user');
    if (user) {
      console.log('👤 UserScreen: Full user from useAuth:', JSON.stringify(user, null, 2));
    }
  }, [user]);

  // Force re-render when data is loaded
  useEffect(() => {
    if (dataLoaded && userData) {
      console.log('🎉 Data loaded and user available - forcing re-render');
    }
  }, [dataLoaded, userData]);

  useEffect(() => {
    console.log('🏠 UserScreen: Component mounted/updated');
    console.log('🏠 UserScreen: Current user from useAuth:', user ? JSON.stringify(user, null, 2) : 'No user');
    loadUserData();
  }, [user]); // Re-run when user changes

  // Reload user data when user changes
  useEffect(() => {
    if (user) {
      console.log('👤 User changed in UserScreen, reloading data...');
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoadingUserData(true);
      setDataLoaded(false); // Reset data loaded state
      console.log('=== STARTING USER DATA LOAD ===');
      console.log('🔍 Current auth user:', user ? JSON.stringify(user, null, 2) : 'No user in auth state');
      
      // Wait a bit to ensure auth state is stable
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // If we have a user from auth state, get latest data from database
      if (user) {
        console.log('🔵 Using user from auth state:', JSON.stringify(user, null, 2));
        console.log('📝 User Name:', user.Name);
        console.log('📧 User Email:', user.Email);
        console.log('🆔 User ID:', user.Id);
        
        // Get the latest user data from Firestore to ensure balance is current
        try {
          const users = await firestoreHelpers.queryDocuments('customers', [
            { field: 'Id', operator: '==', value: user.Id }
          ]);
          
          if (users.length > 0) {
            const latestUserData = users[0];
            console.log('💰 Latest user data from database:', JSON.stringify(latestUserData, null, 2));
            console.log('💰 Current balance from database:', latestUserData.Balance);
            setUserData(latestUserData);
            console.log('✅ User data updated from database');
          } else {
            console.log('⚠️ No user found in database, using auth state');
            setUserData(user);
          }
        } catch (error) {
          console.log('⚠️ Failed to get latest data, using auth state');
          setUserData(user);
        }
        
        setDataLoaded(true);
        return;
      }
      
      // If no user in auth state, try to get from Firestore as fallback
      console.log('⚠️ No user in auth state, trying Firestore fallback...');
      const allUsers = await firestoreHelpers.getCollection('customers');
      console.log('📊 Found users in Firestore:', allUsers.length);
      
      // Try to find the user by checking recent login or session
      // For now, we'll show an error since we can't determine which user
      console.log('❌ Cannot determine which user to show - auth state is empty');
      console.log('📋 Available users in Firestore:', JSON.stringify(allUsers, null, 2));
      setDataLoaded(true);
      return;
      
      
    } catch (error) {
      console.error('💥 Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data: ' + error.message);
    } finally {
      setLoadingUserData(false);
      setDataLoaded(true);
      console.log('🏁 loadUserData completed');
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

  const handleSwitchUser = async () => {
    Alert.alert(
      'Switch User',
      'Choose a user to display:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Minh (minh@gmail.com)',
          onPress: async () => {
            const users = await firestoreHelpers.queryDocuments('customers', [
              { field: 'Email', operator: '==', value: 'minh@gmail.com' }
            ]);
            if (users.length > 0) {
              setUserData(users[0]);
            }
          },
        },
        {
          text: 'Bob (bob@example.com)',
          onPress: async () => {
            const users = await firestoreHelpers.queryDocuments('customers', [
              { field: 'Email', operator: '==', value: 'bob@example.com' }
            ]);
            if (users.length > 0) {
              setUserData(users[0]);
            }
          },
        },
        {
          text: 'Show All Users',
          onPress: async () => {
            try {
              const allUsers = await firestoreHelpers.getCollection('customers');
              console.log('All users in app:', allUsers);
              Alert.alert('All Users', `Found ${allUsers.length} users in database`);
              if (allUsers.length > 0) {
                setUserData(allUsers[0]);
              }
            } catch (error) {
              console.error('Error getting all users:', error);
              Alert.alert('Error', 'Failed to get users');
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
          <ActivityIndicator size="large" color="#27ae60" />
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
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <Text style={styles.subtitle}>User data not loaded</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Debug Options</Text>
            <TouchableOpacity style={styles.settingButton} onPress={loadUserData}>
              <Text style={styles.settingButtonText}>Refresh Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingButton} onPress={() => {
              console.log('🔍 Current auth state check:');
              console.log('👤 user from useAuth():', user ? JSON.stringify(user, null, 2) : 'No user');
              console.log('📊 userData state:', userData ? JSON.stringify(userData, null, 2) : 'No userData');
              console.log('📈 dataLoaded state:', dataLoaded);
              console.log('⏳ loadingUserData state:', loadingUserData);
              Alert.alert('Auth State', user ? 
                `Logged in as: ${user.Name} (${user.Email})\nID: ${user.Id}` : 
                'No user logged in'
              );
            }}>
              <Text style={styles.settingButtonText}>Check Auth State</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingButton} onPress={() => {
              console.log('🔄 Force reloading user data...');
              setUserData(null);
              setDataLoaded(false);
              loadUserData();
            }}>
              <Text style={styles.settingButtonText}>Force Reload User Data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingButton} onPress={async () => {
              try {
                console.log('🔍 Testing auth state by querying Firestore directly...');
                const allUsers = await firestoreHelpers.getCollection('customers');
                console.log('📊 All users in Firestore:', JSON.stringify(allUsers, null, 2));
                
                // Try to find the user by email (assuming they logged in as charlie@example.com)
                const charlieUser = allUsers.find(u => u.Email === 'charlie@example.com');
                if (charlieUser) {
                  console.log('✅ Found Charlie in Firestore:', JSON.stringify(charlieUser, null, 2));
                  setUserData(charlieUser);
                  Alert.alert('Success', 'Found Charlie in Firestore and set as current user!');
                } else {
                  console.log('❌ Charlie not found in Firestore');
                  Alert.alert('Not Found', 'Charlie not found in Firestore');
                }
              } catch (error) {
                console.error('💥 Error testing auth state:', error);
                Alert.alert('Error', 'Failed to test auth state: ' + error.message);
              }
            }}>
              <Text style={styles.settingButtonText}>Test Auth State</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingButton} onPress={async () => {
              try {
                console.log('Testing Firestore connection...');
                const allUsers = await firestoreHelpers.getCollection('customers');
                Alert.alert('Firestore Test', `Success! Found ${allUsers.length} users in database.`);
              } catch (error) {
                console.error('Firestore test failed:', error);
                Alert.alert('Firestore Test', 'Failed to connect to Firestore: ' + error.message);
              }
            }}>
              <Text style={styles.settingButtonText}>Test Firestore</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingButton} onPress={() => {
              navigation.navigate('TestFirestore');
            }}>
              <Text style={styles.settingButtonText}>Open Test Screen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingButton} onPress={async () => {
              try {
                console.log('🔄 Manual load triggered...');
                const allUsers = await firestoreHelpers.getCollection('customers');
                console.log('📊 Manual load found users:', allUsers.length);
                if (allUsers.length > 0) {
                  const selectedUser = allUsers[0];
                  console.log('🎯 Manually setting user:', JSON.stringify(selectedUser, null, 2));
                  setUserData(selectedUser);
                  console.log('✅ Manual user data set');
                  Alert.alert('Success', 'User data loaded manually!');
                }
              } catch (error) {
                console.error('💥 Manual load error:', error);
                Alert.alert('Error', 'Failed to load user: ' + error.message);
              }
            }}>
              <Text style={styles.settingButtonText}>Load User Manually</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
            <TouchableOpacity style={styles.settingButton}>
              <Text style={styles.settingButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingButton}>
              <Text style={styles.settingButtonText}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingButton}>
              <Text style={styles.settingButtonText}>Notification Settings</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
              {userData.Name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{userData.Name}</Text>
        <Text style={styles.memberSince}>Member since {formatDate(userData.DateCreated)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoContainer}>
          {renderInfoRow('Full Name', userData.Name)}
          {renderInfoRow('Email', userData.Email)}
          {renderInfoRow('Phone', userData.PhoneNumber)}
          {renderInfoRow('Date of Birth', userData.DateOfBirth)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Balance</Text>
        <View style={styles.balanceContainer}>
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              ${userData.Balance ? userData.Balance.toFixed(2) : '0.00'}
            </Text>
            <Text style={styles.balanceSubtext}>
              Use this balance to purchase courses
            </Text>
          </View>
        </View>
      </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Notification Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingButton} onPress={handleSwitchUser}>
            <Text style={styles.settingButtonText}>Switch User (Demo)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingButton} onPress={loadUserData}>
            <Text style={styles.settingButtonText}>Refresh Data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingButton} onPress={() => {
            console.log('🔄 Manual refresh triggered...');
            loadUserData();
            Alert.alert('Refresh', 'User data refreshed!');
          }}>
            <Text style={styles.settingButtonText}>Refresh Balance</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingButton} onPress={async () => {
            try {
              console.log('Testing Firestore connection...');
              const allUsers = await firestoreHelpers.getCollection('customers');
              Alert.alert('Firestore Test', `Success! Found ${allUsers.length} users in database.`);
            } catch (error) {
              console.error('Firestore test failed:', error);
              Alert.alert('Firestore Test', 'Failed to connect to Firestore: ' + error.message);
            }
          }}>
            <Text style={styles.settingButtonText}>Test Firestore</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingButton} onPress={() => {
            navigation.navigate('TestFirestore');
          }}>
            <Text style={styles.settingButtonText}>Open Test Screen</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingButton} onPress={async () => {
            try {
              console.log('💰 Testing balance functionality...');
              if (userData) {
                console.log('💰 Current balance:', userData.Balance);
                Alert.alert('Balance Info', `Current balance: $${userData.Balance ? userData.Balance.toFixed(2) : '0.00'}`);
              } else {
                Alert.alert('No User Data', 'No user data available to check balance');
              }
            } catch (error) {
              console.error('💥 Error checking balance:', error);
              Alert.alert('Error', 'Failed to check balance: ' + (error as Error).message);
            }
          }}>
            <Text style={styles.settingButtonText}>Debug: Check Balance</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Help & FAQ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingButton}>
            <Text style={styles.settingButtonText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
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
  infoContainer: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  infoLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#2c3e50',
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
    color: '#2c3e50',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    marginHorizontal: 24,
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  balanceContainer: {
    marginTop: 8,
  },
  balanceCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 12,
    color: '#95a5a6',
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
  loadingSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
});

export default UserScreen; 