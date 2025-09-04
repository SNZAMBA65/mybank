import React, { useState } from 'react';
import { Building2, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

/**
 * Login Component
 * 
 * Dual-purpose authentication component that handles both user login and registration
 * Features:
 * - Toggle between login and registration modes
 * - Form validation with error handling
 * - Password visibility toggle
 * - Loading states during authentication
 * - Demo account credentials display
 * - Responsive design with gradient background
 */
const Login: React.FC = () => {
  // Form state management
  const [email, setEmail] = useState(''); // User email input
  const [password, setPassword] = useState(''); // User password input
  const [firstName, setFirstName] = useState(''); // First name for registration
  const [lastName, setLastName] = useState(''); // Last name for registration
  const [showPassword, setShowPassword] = useState(false); // Password visibility toggle
  const [isLoading, setIsLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(''); // Error message display
  const [isRegistering, setIsRegistering] = useState(false); // Mode toggle (login/register)

  // Authentication store hooks
  const { login, register } = useAuthStore();

  /**
   * Handle form submission for both login and registration
   * Validates input, calls appropriate auth method, and handles errors
   * 
   * @param e - Form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call appropriate authentication method based on current mode
      const success = isRegistering 
        ? await register(email, password, firstName, lastName)
        : await login(email, password);
        
      // Handle authentication failure
      if (!success) {
        setError(isRegistering 
          ? 'Registration failed. Please try again.' 
          : 'Invalid email or password'
        );
      }
    } catch {
      // Handle unexpected errors
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Switch between login and registration modes
   * Clears all form data and error messages when switching
   */
  const switchMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Header section with logo and title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MyBank</h1>
            <p className="text-gray-600 mt-2">
              {isRegistering ? 'Create your account' : 'Sign in to your account'}
            </p>
          </div>

          {/* Authentication form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Registration-only fields (first name and last name) */}
            {isRegistering && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="First name"
                      required
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Last name"
                      required
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            )}

            {/* Email field (required for both login and registration) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="your@email.com"
                  required
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Password field with visibility toggle */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-11 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                {/* Password visibility toggle button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error message display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit button with loading state */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading 
                ? (isRegistering ? 'Creating account...' : 'Signing in...') 
                : (isRegistering ? 'Create Account' : 'Sign In')
              }
            </button>
          </form>

          {/* Mode switch button (login ↔ register) */}
          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {isRegistering 
                ? 'Already have an account? Sign in' 
                : 'Don\'t have an account? Create one'
              }
            </button>
          </div>

          {/* Demo account credentials (only shown in login mode) */}
          {!isRegistering && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">Demo Account:</p>
                <p className="text-sm text-blue-700">Email: test@mybank.com</p>
                <p className="text-sm text-blue-700">Password: password123</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;