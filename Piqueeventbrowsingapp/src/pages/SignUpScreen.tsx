import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Check, X, Calendar } from 'lucide-react';
import logo from 'figma:asset/976db71848c7d73a74d52b0e198c294a490be21e.png';
import { IOSDatePicker } from '../components/IOSDatePicker';

interface SignUpScreenProps {
  onSignUp: () => void;
  onNavigateToLogin: () => void;
}

export function SignUpScreen({ onSignUp, onNavigateToLogin }: SignUpScreenProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Date of Birth state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const currentYear = new Date().getFullYear();
  const [dateOfBirth, setDateOfBirth] = useState({
    month: 4,  // April
    day: 8,
    year: currentYear - 18
  });

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return checks;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordStrengthCount = Object.values(passwordStrength).filter(Boolean).length;

  // Validate individual fields
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
        if (!passwordStrength.uppercase || !passwordStrength.lowercase) {
          return 'Password must contain uppercase and lowercase letters';
        }
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
    
    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    // If changing password, revalidate confirm password if it's been touched
    if (name === 'password' && touched.confirmPassword) {
      const confirmError = formData.confirmPassword !== value ? 'Passwords do not match' : '';
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof typeof formData]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof typeof formData]);
      if (error) newErrors[key] = error;
    });

    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    setTouched({
      fullName: true,
      username: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    // If no errors, proceed with sign up
    if (Object.keys(newErrors).length === 0) {
      // In a real app, you would send this data to your backend
      console.log('Sign up data:', formData);
      onSignUp();
    }
  };

  const handleSocialSignUp = (provider: string) => {
    // In a real app, this would handle OAuth flow
    console.log(`Signing up with ${provider}`);
    onSignUp();
  };

  return (
    <div className="h-full w-full bg-white flex flex-col overflow-y-auto">
      {/* Header with Logo */}
      <div className="pt-12 pb-6 px-8 flex flex-col items-center">
        <img 
          src={logo} 
          alt="Pique" 
          className="h-14 w-auto object-contain mb-6"
        />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-sm text-gray-600">Join Pique to discover events</p>
      </div>

      {/* Sign Up Form */}
      <div className="flex-1 px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Input */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder="Enter your full name"
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all ${
                  errors.fullName && touched.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.fullName && touched.fullName && (
              <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                onBlur={() => handleBlur('username')}
                placeholder="Choose a username"
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all ${
                  errors.username && touched.username ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.username && touched.username && (
              <p className="mt-1 text-xs text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="Enter your email"
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all ${
                  errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.email && touched.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Date of Birth Input */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <button
              type="button"
              onClick={() => setShowDatePicker(true)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all text-left flex items-center justify-between"
            >
              <span className={dateOfBirth ? 'text-gray-900' : 'text-gray-400'}>
                {`${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][dateOfBirth.month - 1]} ${dateOfBirth.day}, ${dateOfBirth.year}`}
              </span>
              <Calendar className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="Create a password"
                className={`w-full pl-11 pr-11 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all ${
                  errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && touched.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
            
            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        level <= passwordStrengthCount
                          ? passwordStrengthCount <= 2
                            ? 'bg-red-500'
                            : passwordStrengthCount <= 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs space-y-0.5">
                  <div className={`flex items-center gap-1 ${passwordStrength.length ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.uppercase && passwordStrength.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.uppercase && passwordStrength.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>Uppercase & lowercase letters</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordStrength.number ? 'text-green-600' : 'text-gray-500'}`}>
                    {passwordStrength.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>At least one number</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Confirm your password"
                className={`w-full pl-11 pr-11 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all ${
                  errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
            )}
            {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Passwords match
              </p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (e.target.checked) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.terms;
                    return newErrors;
                  });
                }
              }}
              className="mt-1 w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{' '}
              <button type="button" className="text-sky-600 hover:text-sky-700 font-medium">
                Terms of Service
              </button>
              {' '}and{' '}
              <button type="button" className="text-sky-600 hover:text-sky-700 font-medium">
                Privacy Policy
              </button>
            </label>
          </div>
          {errors.terms && (
            <p className="text-xs text-red-600">{errors.terms}</p>
          )}

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full bg-sky-500 text-white py-3 rounded-lg font-semibold hover:bg-sky-600 transition-colors shadow-md mt-2"
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">or sign up with</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Social Sign Up Buttons */}
        <div className="space-y-3">
          {/* Google */}
          <button
            onClick={() => handleSocialSignUp('Google')}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium text-gray-700">Sign up with Google</span>
          </button>

          {/* Apple */}
          <button
            onClick={() => handleSocialSignUp('Apple')}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            <span className="font-medium text-gray-700">Sign up with Apple</span>
          </button>

          {/* Microsoft */}
          <button
            onClick={() => handleSocialSignUp('Microsoft')}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#f25022" d="M1 1h10v10H1z" />
              <path fill="#00a4ef" d="M13 1h10v10H13z" />
              <path fill="#7fba00" d="M1 13h10v10H1z" />
              <path fill="#ffb900" d="M13 13h10v10H13z" />
            </svg>
            <span className="font-medium text-gray-700">Sign up with Microsoft</span>
          </button>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-8 mb-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button 
              onClick={onNavigateToLogin}
              className="text-sky-600 hover:text-sky-700 font-semibold"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-3xl pt-4 pb-6 px-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowDatePicker(false)}
                className="text-sky-600 font-medium text-[17px]"
              >
                Cancel
              </button>
              <h3 className="text-[17px] font-semibold">Date of Birth</h3>
              <button
                onClick={() => setShowDatePicker(false)}
                className="text-sky-600 font-semibold text-[17px]"
              >
                Done
              </button>
            </div>

            {/* iOS Date Picker */}
            <IOSDatePicker
              value={dateOfBirth}
              onChange={setDateOfBirth}
              minAge={13}
            />
          </div>
        </div>
      )}
    </div>
  );
}