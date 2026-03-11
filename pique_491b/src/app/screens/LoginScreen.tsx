import { auth } from '@/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from 'firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { Check, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

const REMEMBER_ME_KEY = '@pique_remember_me';
const SAVED_EMAIL_KEY = '@pique_saved_email';

const logo = require('@/assets/images/temp_logo.png');
const { width } = Dimensions.get('window');
const LOGO_SIZE = width * 0.4;


const googleAuthConfig = Constants.expoConfig?.extra?.googleAuth as
  | { webClientId?: string }
  | undefined;

interface LoginScreenProps {
  onLogin: () => void;
  onNavigateToSignUp: () => void;
}

export function LoginScreen({ onLogin, onNavigateToSignUp }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const insets = useSafeAreaInsets();

  // Configure Google Sign-In once on mount
  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const [savedRememberMe, savedEmail] = await Promise.all([
          AsyncStorage.getItem(REMEMBER_ME_KEY),
          AsyncStorage.getItem(SAVED_EMAIL_KEY),
        ]);
        if (savedRememberMe === 'true' && savedEmail) {
          setRememberMe(true);
          setEmail(savedEmail);
        }
      } catch (err) {
        console.log('Error loading saved credentials:', err);
      }
    };
    loadSavedCredentials();
  }, []);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: googleAuthConfig?.webClientId,
      offlineAccess: true,
    });
  }, []);

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_ME_KEY, 'true');
        await AsyncStorage.setItem(SAVED_EMAIL_KEY, email.trim());
      } else {
        await AsyncStorage.removeItem(REMEMBER_ME_KEY);
        await AsyncStorage.removeItem(SAVED_EMAIL_KEY);
      }
      
      onLogin();
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Unable to sign in. Please try again.');
        console.log('Firebase login error:', err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();

      // Get the ID token from the sign-in result
      const idToken = signInResult.data?.idToken;
      if (!idToken) {
        setError('Google sign in failed — no ID token received.');
        return;
      }

      // Use the token to sign into Firebase
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      onLogin();
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled — not an error
        console.log('User cancelled Google sign in');
      } else if (err.code === statusCodes.IN_PROGRESS) {
        setError('Sign in already in progress.');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services not available.');
      } else {
        setError('Unable to sign in with Google. Please try again.');
        console.log('Google sign in error:', JSON.stringify(err, null, 2));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Logging in with ${provider}`);
    onLogin();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* Header with Logo */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Image
          source={logo}
          style={styles.logo}
          resizeMode="center"
        />
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      {/* Login Form */}
      <View style={styles.form}>

        {/* Email Input */}
        <Text style={styles.label}>Email or Username</Text>
        <View style={styles.inputWrapper}>
          <Mail size={20} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email or username"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {error && (
          <Text style={styles.errorMessage}>{error}</Text>
        )}

        {/* Password Input */}
        <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
        <View style={styles.inputWrapper}>
          <Lock size={20} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { paddingRight: 48 }]}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            {showPassword
              ? <EyeOff size={20} color="#9ca3af" />
              : <Eye size={20} color="#9ca3af" />
            }
          </TouchableOpacity>
        </View>

        {/* Remember Me & Forgot Password Row */}
        <View style={styles.rememberForgotRow}>
          <TouchableOpacity
            style={styles.rememberMeContainer}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && <Check size={14} color="#ffffff" strokeWidth={3} />}
            </View>
            <Text style={styles.rememberMeText}>Remember Me</Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.signInButtonText}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Button */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleGoogleSignIn}
          disabled={isSubmitting}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </Svg>
          <Text style={styles.socialButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        {/* Apple Button */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('Apple')}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
            <Path fill="#000000" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </Svg>
          <Text style={styles.socialButtonText}>Sign in with Apple</Text>
        </TouchableOpacity>

        {/* Microsoft Button */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('Microsoft')}
        >
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Rect fill="#f25022" x="1" y="1" width="10" height="10" />
            <Rect fill="#00a4ef" x="13" y="1" width="10" height="10" />
            <Rect fill="#7fba00" x="1" y="13" width="10" height="10" />
            <Rect fill="#ffb900" x="13" y="13" width="10" height="10" />
          </Svg>
          <Text style={styles.socialButtonText}>Sign in with Microsoft</Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={onNavigateToSignUp}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingBottom: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  logo: {
    height: 64,
    width: 150,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
  },
  form: {
    flex: 1,
    paddingHorizontal: 32,
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 13,
    color: '#dc2626',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
  },
  rememberForgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#374151',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 12,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  signUpText: {
    fontSize: 14,
    color: '#4b5563',
  },
  signUpLink: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '600',
  },
});
