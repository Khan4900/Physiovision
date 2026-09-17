import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContextProvider, UseAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Profile from './pages/Profile/index';
import Analytics from './pages/Analytics/index';
import ExerciseLibrary from './pages/Exercise Library/ExerciseLibrary';
import Learn from './pages/Learn';
import LearnExercise from './pages/LearnExercise';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ExerciseSession from './TrainingSession/ExerciseSession';
import Landing from './pages/Landing';
import CreateProgram from './pages/CreateProgram';
import Onboarding from './pages/Onboarding';
import LiveStream from './pages/LiveStream2';

// Component to handle root redirect based on auth state
// Must be rendered inside AuthContextProvider
const RootRedirect = () => {
  const { session } = UseAuth();
  return <Navigate to={session ? "/home" : "/landing"} replace />;
};

// Main app content that uses auth context
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/createprogram" element={<CreateProgram />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes with Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/exerciselibrary" element={<ExerciseLibrary />} />
            <Route path="/learn" element={<Learn />} />
          </Route>
          <Route path="session" element={<ExerciseSession />} />
          <Route path="/learn/:id" element={<LearnExercise />} />
          <Route path="/livestream" element={<LiveStream />} />
        </Route>

        {/* Default route - redirect based on auth state */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Catch all route - redirect to landing */}
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthContextProvider>
      <AppRoutes />
    </AuthContextProvider>
  );
}

export default App;
