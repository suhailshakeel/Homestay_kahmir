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
      // Get all possible redirect sources
      const redirectSources = {
        fromProtectedRoute: location.state?.from,
        pendingBooking: sessionStorage.getItem('pendingBooking'),
        queryParam: new URLSearchParams(location.search).get('redirect')
      };

      // Clean up storage
      sessionStorage.removeItem('pendingBooking');
      
      // Determine redirect path with priority
      const redirectPath = redirectSources.fromProtectedRoute?.pathname ||
                         (redirectSources.pendingBooking ? JSON.parse(redirectSources.pendingBooking).path : null) ||
                         redirectSources.queryParam;

      // Preserve query parameters
      const searchParams = new URLSearchParams(
        redirectSources.fromProtectedRoute?.search ||
        (redirectSources.pendingBooking ? JSON.parse(redirectSources.pendingBooking).search : '') ||
        location.search
      );

      if (redirectPath) {
        navigate({
          pathname: redirectPath,
          search: searchParams.toString()
        }, { replace: true });
      } else {
        // Default role-based redirect
        navigate(user.role === 'admin' ? '/admin' : '/profile', { replace: true });
      }
    }
  }, [isAuthenticated, navigate, location, user]);

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
