import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Chrome,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import theme from "../../theme";
import { UseAuth } from "../../context/AuthContext";
import { validatePassword } from "../../utils/passwordValidation";
import { updateUser } from "../../controllers/UserController";

const SignUp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, signUpNewUser } = UseAuth();

  // Get user responses from CreateProgram if available
  const userResponses = location.state?.userResponses || null;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const { isValid, errors: pwdErrors } = validatePassword(
        formData.password,
      );
      if (!isValid) {
        newErrors.password = pwdErrors.join(", ");
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      // Sign up the user with Supabase Auth
      const { data, error } = await signUpNewUser(
        formData.email,
        formData.password,
        formData.fullName,
        userResponses,
      );

      if (error) {
        throw error;
      }

      // If signup successful and we have user data, save to database immediately
      if (data?.user) {
        const schedule = Array.isArray(userResponses?.schedule)
          ? userResponses.schedule
          : [];

        const newUser = {
          id: data.user.id,
          name: formData.fullName,
          picture: data.user.user_metadata?.profile_picture_url || null,
          birthday: userResponses?.birthday,
          gender: userResponses?.gender,
          weight: userResponses?.weight,
          weight_unit: userResponses?.weight_unit,
          settings: userResponses,
          schedule,
        };

        // Save user details directly to Supabase
        await updateUser(data.user.id, newUser);
        console.log("User details saved to database after signup");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (error) {
      setErrors({ submit: error.message || "Failed to create account" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setErrors({ submit: "Google sign-up failed. Please try again." });
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
            Join Physiovision Today
          </Motion.h1>

          <Motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-center max-w-md opacity-90"
          >
            Start Your Fitness Revolution
          </Motion.p>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg"
          >
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-sm opacity-80">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">500K+</div>
              <div className="text-sm opacity-80">Workouts Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">4.9⭐</div>
              <div className="text-sm opacity-80">User Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-sm opacity-80">Support Available</div>
            </div>
          </Motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -ml-48 -mb-48"></div>
      </Motion.div>

      {/* Right Side - Sign Up Form */}
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
              Create Account
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Start your fitness journey today!
            </p>

            {/* Success Message */}
            {success && (
              <Motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Account created successfully!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Please Verify the email!
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Redirecting to sign in...
                  </p>
                </div>
              </Motion.div>
            )}

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

              <CustomInput
                label="Full Name"
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                icon={User}
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                required
              />

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
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
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

              <CustomInput
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
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

              {/* Terms & Conditions */}
              <p className="text-xs text-gray-600 mb-6">
                By creating an account, you agree to our{" "}
                <Link
                  to="/terms"
                  className="font-semibold hover:underline"
                  style={{ color: theme.colors.primary.pink }}
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="font-semibold hover:underline"
                  style={{ color: theme.colors.primary.pink }}
                >
                  Privacy Policy
                </Link>
              </p>

              {/* Create Account Button */}
              <div className="mb-4">
                <CustomButton
                  text="Sign Up"
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={success || loading}
                />
              </div>

              {/* Divider */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or sign up with
                  </span>
                </div>
              </div>

              {/* Google Sign Up */}
              <CustomButton
                text="Sign up with Google"
                onClick={handleGoogleSignUp}
                variant="outline"
                icon={Chrome}
                loading={loading}
                disabled={loading}
              />
            </form>

            {/* Sign In Link */}
            <p className="mt-8 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-semibold hover:underline"
                style={{ color: theme.colors.primary.pink }}
              >
                Sign In
              </Link>
            </p>
          </div>
        </Motion.div>
      </div>
    </div>
  );
};

export default SignUp;
