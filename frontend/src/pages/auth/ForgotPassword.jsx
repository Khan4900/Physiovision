import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import theme from '../../theme';
import { UseAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = UseAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      const result = await resetPassword(email);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to send reset email. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your email to receive a password reset link</p>
        </div>

        {success ? (
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-800 font-medium">Check your email!</p>
              <p className="text-green-600 text-sm mt-2">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
            <CustomButton
              text="Back to Sign In"
              onClick={() => navigate('/signin')}
              variant="primary"
              fullWidth
            />
          </Motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </Motion.div>
            )}

            <CustomInput
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              icon={Mail}
              required
            />

            <CustomButton
              text={loading ? 'Sending...' : 'Send Reset Link'}
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading}
            />

            <div className="text-center">
              <Link
                to="/signin"
                className="text-sm font-medium hover:underline"
                style={{
                  background: theme.gradients.instagram,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </Motion.div>
    </div>
  );
};

export default ForgotPassword;
