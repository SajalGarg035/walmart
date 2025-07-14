import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (userData: User, token: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Set up axios interceptor for automatic token inclusion
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = token || localStorage.getItem('token') || sessionStorage.getItem('token');
        if (currentToken && config.headers) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [token]);

  // Set up response interceptor for handling 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && token) {
          // Token is invalid, logout user
          logout();
          toast.error('Session expired. Please log in again.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token]);

  const login = async (userData: User, userToken: string) => {
    try {
      setUser(userData);
      setToken(userToken);
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      
    } catch (error) {
      console.error('Login context error:', error);
      throw error;
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      
      const response = await axios.post('http://localhost:3001/api/auth/register', userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const { token: userToken, user: userResponse } = response.data;
      
      if (!userToken || !userResponse) {
        throw new Error('Invalid response from server');
      }

      // Store token
      localStorage.setItem('token', userToken);
      
      // Update state
      await login(userResponse, userToken);
      
      toast.success(`Welcome to Walmart, ${userResponse.firstName}!`);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.response) {
        const message = error.response.data?.message || 'Registration failed';
        toast.error(message);
      } else {
        toast.error('Registration failed. Please try again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    toast.success('Logged out successfully');
  };

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (storedToken) {
          // Set token first
          setToken(storedToken);
          
          // Set axios header
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Verify token with server
          const response = await axios.get('http://localhost:3001/api/auth/me');
          
          if (response.data.user) {
            setUser(response.data.user);
          } else {
            // Invalid token, clear it
            logout();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid token
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};