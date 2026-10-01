import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('helpdesk_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('helpdesk_token') || null);
  const [stats, setStats] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const currentToken = localStorage.getItem('helpdesk_token');
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data) {
        setUser(res.data.user);
        setStats(res.data.stats);
        setUnreadCount(res.data.stats?.unreadNotifications || 0);
        localStorage.setItem('helpdesk_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to fetch user session:', err);
      // If token expired, clear
      localStorage.removeItem('helpdesk_token');
      localStorage.removeItem('helpdesk_user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      const { user: userData, token: jwtToken } = res.data;
      localStorage.setItem('helpdesk_token', jwtToken);
      localStorage.setItem('helpdesk_user', JSON.stringify(userData));
      setUser(userData);
      setToken(jwtToken);
      await fetchProfile();
      return userData;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.success && res.data) {
      const { user: userData, token: jwtToken } = res.data;
      localStorage.setItem('helpdesk_token', jwtToken);
      localStorage.setItem('helpdesk_user', JSON.stringify(userData));
      setUser(userData);
      setToken(jwtToken);
      await fetchProfile();
      return userData;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('helpdesk_token');
    localStorage.removeItem('helpdesk_user');
    setUser(null);
    setToken(null);
    setStats(null);
    setUnreadCount(0);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        role: user?.role || 'guest',
        stats,
        unreadCount,
        setUnreadCount,
        loading,
        login,
        register,
        logout,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
