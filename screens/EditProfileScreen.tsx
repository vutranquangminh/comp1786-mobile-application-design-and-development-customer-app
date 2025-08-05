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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firestoreHelpers } from '../config/firebase';
import { useAuth } from '../hooks/useFirestore';
import { ModernColors } from '../constants/Colors';

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
    dateOfBirth: new Date(),
    imageUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);

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
      
      // Parse date of birth if it exists
      let dateOfBirth = new Date();
      if (passedUserData.DateOfBirth) {
        try {
          dateOfBirth = new Date(passedUserData.DateOfBirth);
        } catch (error) {
          console.log('⚠️ EditProfileScreen: Invalid date format, using current date');
        }
      }
      
      setFormData({
        fullName: passedUserData.Name || '',
        email: passedUserData.Email || '',
        phone: passedUserData.PhoneNumber || '',
        dateOfBirth: dateOfBirth,
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, dateOfBirth: selectedDate });
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
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
        DateOfBirth: formatDate(formData.dateOfBirth),
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
          <LinearGradient
            colors={[ModernColors.background.primary, ModernColors.background.secondary]}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={ModernColors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.title}>
                {showPasswordOnly ? 'Change Password' : 'Edit Profile'}
              </Text>
              <Text style={styles.subtitle}>
                {showPasswordOnly ? 'Update your password' : 'Update your information'}
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.form}>
            {/* Profile Fields - Show when editing profile or showing all */}
            {(showProfileOnly || showAll) && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor={ModernColors.text.tertiary}
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
                    placeholderTextColor={ModernColors.text.tertiary}
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
                    placeholderTextColor={ModernColors.text.tertiary}
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Date of Birth</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateInputText}>
                      {formatDate(formData.dateOfBirth)}
                    </Text>
                    <Ionicons name="calendar" size={20} color={ModernColors.text.secondary} />
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={formData.dateOfBirth}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      minimumDate={new Date(1900, 0, 1)}
                    />
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Profile Image URL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Paste image URL from internet (optional)"
                    placeholderTextColor={ModernColors.text.tertiary}
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
                      placeholderTextColor={ModernColors.text.tertiary}
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
                      <Ionicons 
                        name={showCurrentPassword ? 'eye-off' : 'eye'} 
                        size={20} 
                        color={ModernColors.text.secondary} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Enter new password (min 6 characters)"
                      placeholderTextColor={ModernColors.text.tertiary}
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
                      <Ionicons 
                        name={showNewPassword ? 'eye-off' : 'eye'} 
                        size={20} 
                        color={ModernColors.text.secondary} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={styles.passwordInputContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Confirm your new password"
                      placeholderTextColor={ModernColors.text.tertiary}
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
                      <Ionicons 
                        name={showConfirmPassword ? 'eye-off' : 'eye'} 
                        size={20} 
                        color={ModernColors.text.secondary} 
                      />
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
              <LinearGradient
                colors={[ModernColors.primary.main, ModernColors.primary.dark]}
                style={styles.saveButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color={ModernColors.text.inverse} size="small" />
                ) : (
                  <>
                    <Ionicons name="save" size={20} color={ModernColors.text.inverse} />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </LinearGradient>
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
    backgroundColor: ModernColors.background.secondary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: ModernColors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: ModernColors.text.secondary,
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: ModernColors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: ModernColors.background.primary,
    borderWidth: 1,
    borderColor: ModernColors.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: ModernColors.text.primary,
    shadowColor: ModernColors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  dateInput: {
    backgroundColor: ModernColors.background.primary,
    borderWidth: 1,
    borderColor: ModernColors.border.light,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: ModernColors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  dateInputText: {
    fontSize: 16,
    color: ModernColors.text.primary,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ModernColors.background.primary,
    borderWidth: 1,
    borderColor: ModernColors.border.light,
    borderRadius: 12,
    shadowColor: ModernColors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: ModernColors.text.primary,
  },
  passwordToggle: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  helperText: {
    fontSize: 12,
    color: ModernColors.text.secondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: ModernColors.text.inverse,
    fontSize: 18,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.6,
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
    borderTopColor: ModernColors.border.light,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: ModernColors.text.primary,
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: ModernColors.text.secondary,
    fontWeight: '500',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: ModernColors.text.tertiary,
    fontWeight: '400',
  },
});

export default EditProfileScreen; 