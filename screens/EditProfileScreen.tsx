import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  EditProfile: { userData: any; focusPassword?: boolean };
};

type EditProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'EditProfile'>;

interface Props {
  navigation: EditProfileScreenNavigationProp;
  route: {
    params: {
      userData: any;
      focusPassword?: boolean;
    };
  };
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

const EditProfileScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const passwordSectionRef = useRef<View>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    imageUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    console.log('🚀 EditProfileScreen: Component mounted, calling loadUserData');
    loadUserData();
  }, []);

  useEffect(() => {
    if (route.params.focusPassword && passwordSectionRef.current) {
      // Scroll to password section after a short delay to ensure layout is complete
      setTimeout(() => {
        passwordSectionRef.current?.measureInWindow((x, y) => {
          // Scroll to the password section
          // This will be handled by the ScrollView
        });
      }, 500);
    }
  }, [route.params.focusPassword]);

  // Determine which sections to show based on the navigation source
  const showPasswordOnly = route.params.focusPassword === true;
  const showProfileOnly = route.params.focusPassword === false;
  const showAll = route.params.focusPassword === undefined;

  const loadUserData = () => {
    console.log('🔄 EditProfileScreen: Loading user data from route params...');
    console.log('👤 EditProfileScreen: User data from route:', route.params.userData);
    
    // Use the userData passed from UserScreen
    const passedUserData = route.params.userData;
    
    if (passedUserData) {
      console.log('✅ EditProfileScreen: Using user data from route params');
      setUserData(passedUserData);
      setFormData({
        fullName: passedUserData.Name || '',
        email: passedUserData.Email || '',
        phone: passedUserData.PhoneNumber || '',
        dateOfBirth: passedUserData.DateOfBirth || '',
        imageUrl: passedUserData.ImageUrl || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      console.log('✅ EditProfileScreen: Form data set from route params');
    } else {
      console.log('❌ EditProfileScreen: No user data in route params');
    }
  };

  const handleSave = async () => {
    console.log('💾 EditProfileScreen: Starting to save profile data...');
    console.log('💾 EditProfileScreen: Form data to save:', formData);
    
    if (!userData) {
      console.log('❌ EditProfileScreen: No user data available');
      Alert.alert('Error', 'No user data available');
      return;
    }

    if (!formData.fullName.trim() || !formData.email.trim()) {
      console.log('❌ EditProfileScreen: Required fields missing');
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Check if user wants to update password
    const isUpdatingPassword = formData.currentPassword.trim() || formData.newPassword.trim() || formData.confirmPassword.trim();
    
    if (isUpdatingPassword) {
      // Validate password fields
      if (!formData.currentPassword.trim()) {
        Alert.alert('Error', 'Please enter your current password');
        return;
      }
      
      if (!formData.newPassword.trim()) {
        Alert.alert('Error', 'Please enter a new password');
        return;
      }
      
      if (formData.newPassword.trim().length < 6) {
        Alert.alert('Error', 'New password must be at least 6 characters long');
        return;
      }
      
      if (formData.newPassword.trim() !== formData.confirmPassword.trim()) {
        Alert.alert('Error', 'New passwords do not match');
        return;
      }
      
      // Verify current password
      if (formData.currentPassword.trim() !== userData.Password) {
        Alert.alert('Error', 'Current password is incorrect');
        return;
      }
    }

    setLoading(true);
    try {
      console.log('💾 EditProfileScreen: Updating user data in Firestore...');
      
      // Prepare update data
      const updateData: any = {
        Name: formData.fullName.trim(),
        Email: formData.email.trim(),
        PhoneNumber: formData.phone.trim(),
        DateOfBirth: formData.dateOfBirth.trim(),
        ImageUrl: formData.imageUrl.trim() || null,
      };
      
      // Add password update if provided
      if (isUpdatingPassword) {
        updateData.Password = formData.newPassword.trim();
      }
      
      // Find the correct document ID by querying for the user
      const users = await firestoreHelpers.queryDocuments('customers', [
        { field: 'Id', operator: '==', value: userData.Id }
      ]);
      
      if (users.length === 0) {
        throw new Error('User document not found');
      }
      
      // Get the Firestore document ID (not the user's ID)
      const userDoc = users[0];
      const documentId = userDoc.id; // This is the Firestore document ID
      
      console.log('💾 EditProfileScreen: Found user document with ID:', documentId);
      
      // Update user data in Firestore using the correct document ID
      await firestoreHelpers.updateDocument('customers', documentId, updateData);

      console.log('✅ EditProfileScreen: Profile updated successfully in Firestore');
      
      // Show success message and redirect
      Alert.alert(
        'Success',
        isUpdatingPassword ? 'Profile and password updated successfully!' : 'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('✅ EditProfileScreen: User confirmed success, navigating back');
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ EditProfileScreen: Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!userData) {
    console.log('❌ EditProfileScreen: No user data available');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No user data available</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  console.log('✅ EditProfileScreen: Rendering main component - userData loaded');
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {showPasswordOnly ? 'Change Password' : 'Edit Profile'}
            </Text>
            <Text style={styles.subtitle}>
              {showPasswordOnly ? 'Update your password' : 'Update your information'}
            </Text>
          </View>

          <View style={styles.form}>
            {/* Profile Fields - Show when editing profile or showing all */}
            {(showProfileOnly || showAll) && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#94a3b8"
                    value={formData.fullName}
                    onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#94a3b8"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    placeholderTextColor="#94a3b8"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Date of Birth</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor="#94a3b8"
                    value={formData.dateOfBirth}
                    onChangeText={(text) => setFormData({ ...formData, dateOfBirth: text })}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Profile Image URL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Paste image URL from internet (optional)"
                    placeholderTextColor="#94a3b8"
                    value={formData.imageUrl}
                    onChangeText={(text) => setFormData({ ...formData, imageUrl: text })}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Text style={styles.helperText}>
                    Paste a direct image URL from the internet to set your profile picture. 
                    Examples: Unsplash, Imgur, or any direct image link ending in .jpg, .png, etc.
                  </Text>
                </View>
              </>
            )}

            {/* Password Fields - Show when changing password or showing all */}
            {(showPasswordOnly || showAll) && (
              <>
                {showAll && (
                  <View style={styles.sectionDivider}>
                    <Text style={styles.sectionTitle}>Change Password (Optional)</Text>
                  </View>
                )}
                
                {showPasswordOnly && (
                  <View style={styles.sectionDivider} ref={passwordSectionRef}>
                    <Text style={styles.sectionTitle}>Change Password</Text>
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Current Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Enter your current password"
                      placeholderTextColor="#94a3b8"
                      value={formData.currentPassword}
                      onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
                      secureTextEntry={!showCurrentPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      <Text style={styles.passwordToggleText}>
                        {showCurrentPassword ? '🙈' : '👁️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Enter new password (min 6 characters)"
                      placeholderTextColor="#94a3b8"
                      value={formData.newPassword}
                      onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      <Text style={styles.passwordToggleText}>
                        {showNewPassword ? '🙈' : '👁️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Confirm your new password"
                      placeholderTextColor="#94a3b8"
                      value={formData.confirmPassword}
                      onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      style={styles.passwordToggle}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <Text style={styles.passwordToggleText}>
                        {showConfirmPassword ? '🙈' : '👁️'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
  },
  passwordToggle: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  passwordToggleText: {
    fontSize: 18,
  },
  helperText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#8b5cf6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionDivider: {
    marginTop: 30,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '400',
  },
});

export default EditProfileScreen; 