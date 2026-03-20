import { auth } from '@/firebase';
import { apiRegister } from '@/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Calendar, Check, Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react-native';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

const colorScheme = useColorScheme();
const logo = require('@/assets/images/temp_logo.png');

interface SignUpScreenProps {
  onSignUp: () => void;
  onNavigateToLogin: () => void;
}

export function SignUpScreen({ onSignUp, onNavigateToLogin }: SignUpScreenProps) {
  const [formData, setFormData] = useState({ fullName: '', username: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const currentYear = new Date().getFullYear();
  const [dateOfBirth, setDateOfBirth] = useState(
    new Date(currentYear - 18, 3, 8) // April 8, 18 years ago
  );
  const insets = useSafeAreaInsets();

  const getPasswordStrength = (password: string) => ({
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  });

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordStrengthCount = Object.values(passwordStrength).filter(Boolean).length;

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        return '';
      case 'username':
        if (!value.trim()) return 'Username is required';
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!passwordStrength.uppercase || !passwordStrength.lowercase)
          return 'Password must contain uppercase and lowercase letters';
        if (!passwordStrength.number) return 'Password must contain at least one number';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    }
    if (name === 'password' && touched.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: formData.confirmPassword !== value ? 'Passwords do not match' : '',
      }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, formData[name as keyof typeof formData]),
    }));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });
    if (!acceptedTerms) newErrors.terms = 'You must accept the terms and conditions';

    setErrors(newErrors);
    setTouched({
      fullName: true,
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(newErrors).length === 0) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        await updateProfile(userCredential.user, {
          displayName: formData.fullName,
        });
        await apiRegister({
          fullName: formData.fullName,
          username: formData.username,
          dateOfBirth: dateOfBirth.toISOString().split('T')[0],
        });
        console.log('Firebase user created:', userCredential.user);
        onSignUp();
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
        } else if (error.code === 'auth/invalid-email') {
          setErrors(prev => ({ ...prev, email: 'Invalid email address' }));
        } else {
          console.log('Sign up error:', error);
        }
      }
    }
  };

  const handleSocialSignUp = (provider: string) => {
    console.log(`Signing up with ${provider}`);
    onSignUp();
  };

  const formatDate = (date: Date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getStrengthColor = () => {
    if (passwordStrengthCount <= 2) return '#ef4444';
    if (passwordStrengthCount <= 3) return '#eab308';
    return '#22c55e';
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>

      {/* Header */}
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Pique to discover events</Text>
      </View>

      <View style={styles.form}>

        {/* Full Name */}
        <Text style={styles.label}>Full Name</Text>
        <View style={[styles.inputWrapper, errors.fullName && touched.fullName && styles.inputError]}>
          <User size={20} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(v) => handleInputChange('fullName', v)}
            onBlur={() => handleBlur('fullName')}
            placeholder="Enter your full name"
            placeholderTextColor="#9ca3af"
          />
        </View>
        {errors.fullName && touched.fullName && (
          <Text style={styles.errorText}>{errors.fullName}</Text>
        )}

        {/* Username */}
        <Text style={[styles.label, { marginTop: 16 }]}>Username</Text>
        <View style={[styles.inputWrapper, errors.username && touched.username && styles.inputError]}>
          <User size={20} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={formData.username}
            onChangeText={(v) => handleInputChange('username', v)}
            onBlur={() => handleBlur('username')}
            placeholder="Choose a username"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
          />
        </View>
        {errors.username && touched.username && (
          <Text style={styles.errorText}>{errors.username}</Text>
        )}

        {/* Email */}
        <Text style={[styles.label, { marginTop: 16 }]}>Email</Text>
        <View style={[styles.inputWrapper, errors.email && touched.email && styles.inputError]}>
          <Mail size={20} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(v) => handleInputChange('email', v)}
            onBlur={() => handleBlur('email')}
            placeholder="Enter your email"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        {errors.email && touched.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}

        {/* Date of Birth */}
        <Text style={[styles.label, { marginTop: 16 }]}>Date of Birth</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>{formatDate(dateOfBirth)}</Text>
          <Calendar size={20} color="#9ca3af" />
        </TouchableOpacity>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDateOfBirth(selectedDate);
            }}
            maximumDate={new Date(currentYear - 13, 11, 31)}
          />
        )}

        {/* Password */}
        <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
        <View style={[styles.inputWrapper, errors.password && touched.password && styles.inputError]}>
          <Lock size={20} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { paddingRight: 48 }]}
            value={formData.password}
            onChangeText={(v) => handleInputChange('password', v)}
            onBlur={() => handleBlur('password')}
            placeholder="Create a password"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            {showPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
          </TouchableOpacity>
        </View>
        {errors.password && touched.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        {/* Password Strength */}
        {formData.password.length > 0 && (
          <View style={styles.strengthContainer}>
            <View style={styles.strengthBars}>
              {[1, 2, 3, 4, 5].map((level) => (
                <View
                  key={level}
                  style={[
                    styles.strengthBar,
                    { backgroundColor: level <= passwordStrengthCount ? getStrengthColor() : '#e5e7eb' },
                  ]}
                />
              ))}
            </View>
            <View style={styles.strengthChecks}>
              <View style={styles.strengthRow}>
                {passwordStrength.length
                  ? <Check size={12} color="#22c55e" />
                  : <X size={12} color="#9ca3af" />}
                <Text style={[styles.strengthText, { color: passwordStrength.length ? '#22c55e' : '#9ca3af' }]}>
                  At least 8 characters
                </Text>
              </View>
              <View style={styles.strengthRow}>
                {passwordStrength.uppercase && passwordStrength.lowercase
                  ? <Check size={12} color="#22c55e" />
                  : <X size={12} color="#9ca3af" />}
                <Text style={[styles.strengthText, { color: passwordStrength.uppercase && passwordStrength.lowercase ? '#22c55e' : '#9ca3af' }]}>
                  Uppercase & lowercase letters
                </Text>
              </View>
              <View style={styles.strengthRow}>
                {passwordStrength.number
                  ? <Check size={12} color="#22c55e" />
                  : <X size={12} color="#9ca3af" />}
                <Text style={[styles.strengthText, { color: passwordStrength.number ? '#22c55e' : '#9ca3af' }]}>
                  At least one number
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Confirm Password */}
        <Text style={[styles.label, { marginTop: 16 }]}>Confirm Password</Text>
        <View style={[styles.inputWrapper, errors.confirmPassword && touched.confirmPassword && styles.inputError]}>
          <Lock size={20} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { paddingRight: 48 }]}
            value={formData.confirmPassword}
            onChangeText={(v) => handleInputChange('confirmPassword', v)}
            onBlur={() => handleBlur('confirmPassword')}
            placeholder="Confirm your password"
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            {showConfirmPassword ? <EyeOff size={20} color="#9ca3af" /> : <Eye size={20} color="#9ca3af" />}
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && touched.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}
        {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
          <View style={styles.strengthRow}>
            <Check size={12} color="#22c55e" />
            <Text style={[styles.strengthText, { color: '#22c55e' }]}>Passwords match</Text>
          </View>
        )}

        {/* Terms and Conditions */}
        <View style={styles.termsRow}>
          <TouchableOpacity
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
          >
            {acceptedTerms && <Check size={12} color="#ffffff" />}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
        {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

        {/* Create Account Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleSubmit}>
          <Text style={styles.signUpButtonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or sign up with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google */}
        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialSignUp('Google')}>
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <Path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </Svg>
          <Text style={styles.socialButtonText}>Sign up with Google</Text>
        </TouchableOpacity>

        {/* Microsoft */}
        <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialSignUp('Microsoft')}>
          <Svg width={20} height={20} viewBox="0 0 24 24">
            <Rect fill="#f25022" x="1" y="1" width="10" height="10" />
            <Rect fill="#00a4ef" x="13" y="1" width="10" height="10" />
            <Rect fill="#7fba00" x="1" y="13" width="10" height="10" />
            <Rect fill="#ffb900" x="13" y="13" width="10" height="10" />
          </Svg>
          <Text style={styles.socialButtonText}>Sign up with Microsoft</Text>
        </TouchableOpacity>

        {/* Sign In Link */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <TouchableOpacity onPress={onNavigateToLogin}>
            <Text style={styles.signInLink}>Sign In</Text>
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
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  logo: {
    height: 64,
    width: 150,
    borderRadius: 8,
    marginTop: 20,
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
    paddingBottom: 32,
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
  inputError: {
    borderColor: '#ef4444',
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
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#111827',
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 9999,
  },
  strengthChecks: {
    gap: 2,
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  strengthText: {
    fontSize: 12,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 16,
    marginBottom: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
  },
  termsLink: {
    color: '#0ea5e9',
    fontWeight: '500',
  },
  signUpButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpButtonText: {
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  signInText: {
    fontSize: 14,
    color: '#4b5563',
  },
  signInLink: {
    fontSize: 14,
    color: '#0ea5e9',
    fontWeight: '600',
  },
});

export default SignUpScreen;