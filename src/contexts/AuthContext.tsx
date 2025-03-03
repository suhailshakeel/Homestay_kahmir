import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'home-stayer' | 'admin';
  phone?: string;
  address?: string;
  aadhaarNumber?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('https://homestaykashmir.onrender.com/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data.user);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, userType: string) => {
    try {
      const response = await axios.post('https://homestaykashmir.onrender.com/api/auth/login', {
        email,
        password,
        userType
      });

      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);

      toast.success('Login successful!');

      // Role-based redirection
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      await axios.post('https://homestaykashmir.onrender.com/api/auth/register', userData);
      toast.success('Registration successful! Please login.');
      navigate('/signin');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await axios.put('https://homestaykashmir.onrender.com/api/users/profile', data);
      setUser(response.data);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export default AuthContext;