import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Chrome, Eye, EyeOff, AlertCircle } from 'lucide-react';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import theme from '../../theme';
import { UseAuth } from '../../context/AuthContext';

const SignIn = () => {
  const navigate = useNavigate();
  const { signInUser, signInWithGoogle } = UseAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const { success, error } = await signInUser(formData.email, formData.password);

      if (!success) {
        setErrors({ submit: error || 'Failed to sign in' });
        return;
      }

      navigate('/home');
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to sign in' });
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    setErrors({});
    setLoading(true);
    try {
      const { success, error } = await signInWithGoogle();

      if (!success) {
        setErrors({ submit: error || 'Google sign-in failed. Please try again.' });
        return;
      }
    } catch {
      setErrors({ submit: 'Google sign-in failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Gradient Background */}
      <Motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: theme.gradients.primary }}
      >
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          {/* Logo */}
          <Motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center mb-8"
          >
            <img 
              src="/src/assets/logo.png" 
              alt="Physiovision Logo" 
              className="h-20 w-auto object-contain mb-4" 
            />
          </Motion.div>
          
          <Motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-5xl font-bold mb-4 text-center"
          >
            Welcome to Physiovision
          </Motion.h1>
          
          <Motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-center max-w-md opacity-90"
          >
            AI-powered Fitness Experience
          </Motion.p>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-lg opacity-80">
              Transform your fitness journey with personalized workouts,
              real-time analytics, and AI-driven insights.
            </p>
          </Motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -ml-48 -mb-48"></div>
      </Motion.div>

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {/* Mobile Logo */}
            <div className="lg:hidden flex justify-center mb-6">
                <img 
                  src="/src/assets/logo.png" 
                  alt="Physiovision Logo" 
                  className="h-12 w-auto object-contain" 
                />
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Sign In
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Welcome back! Please enter your details.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Error message */}
              {errors.submit && (
                <Motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </Motion.div>
              )}

              {loading && (
                <Motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3"
                  role="status"
                  aria-live="polite"
                >
                  <span className="flex h-5 w-5">
                    <span className="animate-spin rounded-full border-2 border-blue-400 border-t-transparent h-5 w-5" />
                  </span>
                  <p className="text-sm text-blue-800">Processing your request...</p>
                </Motion.div>
              )}

              <CustomInput
                label="Email"
                type="email"
                name="email"
                placeholder="Enter your email"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
              />

              <CustomInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <Eye className="w-5 h-5 text-gray-400" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                }
              />

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-semibold hover:underline"
                  style={{ color: theme.colors.primary.pink }}
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <div className="mb-4">
                <CustomButton
                  text="Sign In"
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                />
              </div>

              {/* Divider */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google Sign In */}
              <CustomButton
                text="Sign in with Google"
                onClick={handleGoogleSignIn}
                variant="outline"
                icon={Chrome}
                loading={loading}
                disabled={loading}
              />
            </form>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/createprogram"
                className="font-semibold hover:underline"
                style={{ color: theme.colors.primary.pink }}
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* Footer Text */}
          <p className="mt-6 text-center text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </Motion.div>
      </div>
    </div>
  );
};

export default SignIn;
