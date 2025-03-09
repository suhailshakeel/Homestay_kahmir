import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';
import UserTypeToggle from '../components/auth/UserTypeToggle';
import { useAuth } from '../contexts/AuthContext';

const SignIn = () => {
  const [isHomeStayer, setIsHomeStayer] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Check for pending booking when component mounts or auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      // Get the pending booking room ID if any
      const pendingRoomId = localStorage.getItem('pendingBookingRoomId') || 
                            (window as any).__pendingBookingRoomId__;
      
      if (pendingRoomId) {
        // Clear storage
        localStorage.removeItem('pendingBookingRoomId');
        if ((window as any).__pendingBookingRoomId__) {
          (window as any).__pendingBookingRoomId__ = null;
        }
        
        // Redirect to booking page
        navigate(`/book/${pendingRoomId}`);
      }
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthLayout 
      title={isHomeStayer ? 'Sign in as Home Stayer' : 'Welcome back'}
      subtitle="Please enter your details to continue"
    >
      <LoginForm userType={isHomeStayer ? 'home-stayer' : 'user'} />
      
      <div className="mt-6">
        <UserTypeToggle
          isHomeStayer={isHomeStayer}
          onToggle={() => setIsHomeStayer(!isHomeStayer)}
        />
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default SignIn;
