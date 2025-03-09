import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';
import UserTypeToggle from '../components/auth/UserTypeToggle';
import { useAuth } from '../contexts/AuthContext';

const SignIn = () => {
  const [isHomeStayer, setIsHomeStayer] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const path = location.state?.from?.pathname || '';
    if (path.startsWith('/book/')) {
      const roomId = path.split('/book/')[1];
      if (roomId) {
        window.__pendingBookingRoomId__ = roomId;
        localStorage.setItem('pendingBookingRoomId', roomId);
        console.log('Stored pending booking ID:', roomId);
      }
    }
  }, [location]);

  useEffect(() => {
    if (isAuthenticated) {
      const pendingRoomId = localStorage.getItem('pendingBookingRoomId') || 
                            window.__pendingBookingRoomId__;
      
      if (pendingRoomId) {
        console.log('Redirecting to booking:', pendingRoomId);
        
        localStorage.removeItem('pendingBookingRoomId');
        window.__pendingBookingRoomId__ = null;
        
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
