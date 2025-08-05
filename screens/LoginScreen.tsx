import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
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
import { ModernColors } from '../constants/Colors';
import { useAuth } from '../hooks/useFirestore';

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading, error } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      console.log('🔐 LoginScreen: Starting login for:', email);
      console.log('🔐 LoginScreen: Password provided:', password ? 'Yes' : 'No');
      
      const userCredential = await signIn(email, password);
      console.log('✅ LoginScreen: Login successful!');
      console.log('✅ LoginScreen: User credential details:');
      console.log('   - User ID:', userCredential.Id);
      console.log('   - User Name:', userCredential.Name);
      console.log('   - User Email:', userCredential.Email);
      console.log('   - User Phone:', userCredential.PhoneNumber);
      console.log('   - User DOB:', userCredential.DateOfBirth);
      console.log('   - User Created:', userCredential.DateCreated);
      console.log('✅ LoginScreen: Full user credential JSON:', JSON.stringify(userCredential, null, 2));
      
      // Navigate to main tabs after successful login
      console.log('🚀 LoginScreen: Navigating to MainTabs');
      navigation.replace('MainTabs');
    } catch (err) {
      console.error('❌ LoginScreen: Login failed:', err);
      console.error('❌ LoginScreen: Error details:', JSON.stringify(err, null, 2));
      Alert.alert('Error', 'Invalid email or password');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[ModernColors.background.primary, ModernColors.background.secondary]}
        style={styles.gradient}
      >
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
              <Text style={styles.title}>Welcome Back</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={ModernColors.text.tertiary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Enter your password"
                    placeholderTextColor={ModernColors.text.tertiary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? 'eye-off' : 'eye'} 
                      size={20} 
                      color={ModernColors.text.tertiary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[ModernColors.primary.main, ModernColors.primary.dark]}
                  style={styles.loginButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color={ModernColors.text.inverse} size="small" />
                  ) : (
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {error && (
                <Text style={styles.errorText}>{error}</Text>
              )}

              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text style={styles.linkText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 32,
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
    color: ModernColors.primary.main,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: ModernColors.text.primary,
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: ModernColors.text.primary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ModernColors.background.primary,
    borderWidth: 1,
    borderColor: ModernColors.border.light,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: ModernColors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: ModernColors.text.primary,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ModernColors.background.primary,
    borderWidth: 1,
    borderColor: ModernColors.border.light,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: ModernColors.shadow.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: ModernColors.text.primary,
  },
  passwordToggle: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  loginButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 24,
    shadowColor: ModernColors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  loginButtonText: {
    color: ModernColors.text.inverse,
    fontSize: 18,
    fontWeight: '700',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: ModernColors.error.main,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 16,
    color: ModernColors.text.secondary,
  },
  linkText: {
    fontSize: 16,
    color: ModernColors.primary.main,
    fontWeight: '700',
  },
});

export default LoginScreen; 