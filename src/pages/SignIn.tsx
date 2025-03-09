import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';
import UserTypeToggle from '../components/auth/UserTypeToggle';
import { useAuth } from '../contexts/AuthContext';

const SignIn = () => {
  const [isHomeStayer, setIsHomeStayer] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const pendingRoomId = localStorage.getItem('pendingBookingRoomId') || 
                          (window as any).__pendingBookingRoomId__;
      
      // Get redirect path in priority order:
      // 1. ProtectedRoute redirect state
      // 2. Pending booking from direct URL
      // 3. Default role-based redirect
      const returnPath = location.state?.from?.pathname || 
                       (pendingRoomId ? `/book/${pendingRoomId}` : null);

      // Clear any booking storage
      if (pendingRoomId) {
        localStorage.removeItem('pendingBookingRoomId');
        if ((window as any).__pendingBookingRoomId__) {
          (window as any).__pendingBookingRoomId__ = null;
        }
      }

      // Handle the redirect
      if (returnPath) {
        navigate(returnPath);
      } else {
        // Default role-based redirect
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/profile');
        }
      }
    }
  }, [isAuthenticated, navigate, location.state, user]);

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
