import { Navigate, Outlet } from 'react-router-dom';
import { UseAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const ProtectedRoute = () => {
  const { session } = UseAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Give a small delay to ensure session is properly loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [session]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-gray-700 font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  // If there's no session, redirect to sign in
  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  // If there is a session, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
