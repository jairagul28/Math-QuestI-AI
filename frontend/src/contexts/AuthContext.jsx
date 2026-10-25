import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('mq_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('mq_token'));
  const [loading, setLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('mq_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data && res.data.data) {
            setUser(res.data.data);
            localStorage.setItem('mq_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          console.warn('[AuthContext] Session expired or invalid, logging out...');
          localStorage.removeItem('mq_token');
          localStorage.removeItem('mq_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('mq_token', receivedToken);
      localStorage.setItem('mq_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('mq_token', receivedToken);
      localStorage.setItem('mq_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);

      return { success: true, user: receivedUser };
    } catch (error) {
      const message =
        error.response?.data?.message || 'Registration failed. Please check the entered details.';
      return { success: false, error: message };
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('mq_token');
    localStorage.removeItem('mq_user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      if (res.data?.data) {
        setUser(res.data.data);
        localStorage.setItem('mq_user', JSON.stringify(res.data.data));
      }
    } catch (error) {
      console.error('[AuthContext] Error refreshing user profile:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

