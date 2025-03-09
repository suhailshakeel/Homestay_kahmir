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
      // Get redirect sources in priority order
      const redirectSources = {
        fromState: location.state?.from,
        sessionStorage: sessionStorage.getItem('bookingIntent'),
        registrationRedirect: location.state?.registrationRedirect
      };

      // Clean up storage
      sessionStorage.removeItem('bookingIntent');

      // Determine final path
      let finalPath = '/profile';
      let finalSearch = '';

      if (redirectSources.fromState) {
        finalPath = redirectSources.fromState.pathname;
        finalSearch = redirectSources.fromState.search;
      } else if (redirectSources.sessionStorage) {
        const stored = JSON.parse(redirectSources.sessionStorage);
        finalPath = stored.path;
        finalSearch = stored.search;
      } else if (redirectSources.registrationRedirect) {
        const stored = redirectSources.registrationRedirect;
        finalPath = stored.path;
        finalSearch = stored.search;
      }

      // Admin override
      if (user.role === 'admin') finalPath = '/admin';

      navigate(
        { pathname: finalPath, search: finalSearch },
        { replace: true }
      );
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
