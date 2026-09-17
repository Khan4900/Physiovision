import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { supabase } from '../../supabaseClient';

import { validatePassword } from '../../utils/passwordValidation';


const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const navigate = useNavigate();

  // Get access_token from URL
  const getAccessToken = () => {
    const params = new URLSearchParams(window.location.hash.replace('#', '?'));
    return params.get('access_token') || new URLSearchParams(window.location.search).get('access_token');
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const { errors } = validatePassword(newPassword);
    setValidationErrors(errors);
    setErrors((prev) => ({ ...prev, password: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    setLoading(true);

    const { isValid, errors: pwdErrors } = validatePassword(password);
    if (!isValid) {
      setErrors({ submit: 'Please fix the password requirements', password: pwdErrors.join(', ') });
      setValidationErrors(pwdErrors);
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ submit: 'Passwords do not match', confirmPassword: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      const access_token = getAccessToken();
      let updateError = null;
      if (access_token) {
        // Set session using access_token
        const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token: access_token });
        if (sessionError) {
          setErrors({ submit: sessionError.message });
          setLoading(false);
          return;
        }
        // Now update password
        const { error } = await supabase.auth.updateUser({ password });
        updateError = error;
      } else {
        // Try updateUser directly (if session exists)
        const { error } = await supabase.auth.updateUser({ password });
        updateError = error;
      }
      if (updateError) {
        setErrors({ submit: updateError.message });
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      }
    } catch {
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/src/assets/logo.png" 
              alt="Physiovision Logo" 
              className="h-16 w-auto object-contain" 
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Set New Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        {success ? (
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-800 font-medium">Password Reset Successful!</p>
              <p className="text-green-600 text-sm mt-2">
                Redirecting to sign in...
              </p>
            </div>
          </Motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errors.submit}</p>
              </Motion.div>
            )}

            <CustomInput
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={password}
              onChange={handlePasswordChange}
              error={errors.password}
              icon={Lock}
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <Lock className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              }
            />
            {validationErrors.length > 0 && (
              <div className="mt-2 text-sm text-red-500">
                <ul className="list-disc list-inside">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <CustomInput
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors({ ...errors, confirmPassword: '' });
              }}
              error={errors.confirmPassword}
              icon={Lock}
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <Eye className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              }
            />

            <CustomButton
              text={loading ? 'Resetting...' : 'Reset Password'}
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading || validationErrors.length > 0}
            />
          </form>
        )}
      </Motion.div>
    </div>
  );
};

export default ResetPassword;
