import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Create base axios instance pointing to Node Express API
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Synchronize token inside Axios headers
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load current user profile if token is present
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      setToken(response.data.token);
      setUser(response.data.user);
    }
    return response.data;
  };

  const register = async (name, email, password, phone) => {
    const response = await api.post('/auth/register', { name, email, password, phone });
    if (response.data.success) {
      setToken(response.data.token);
      setUser(response.data.user);
    }
    return response.data;
  };

  const registerBranchHead = async (payload) => {
    const response = await api.post('/auth/register-branch-head', payload);
    return response.data;
  };

  const loginGoogle = async (googleUser) => {
    // Sends Google profile fields to backend endpoint
    const response = await api.post('/auth/google', googleUser);
    if (response.data.success) {
      setToken(response.data.token);
      setUser(response.data.user);
    }
    return response.data;
  };

  const loginOTP = async (phone, code, step) => {
    const response = await api.post('/auth/otp', { phone, code, step });
    if (response.data.success && step === 'verify') {
      setToken(response.data.token);
      setUser(response.data.user);
    }
    return response.data;
  };

  const logout = () => {
    setToken('');
    setUser(null);
  };

  // Address Actions
  const addAddress = async (addressData) => {
    const response = await api.post('/auth/address', addressData);
    if (response.data.success) {
      setUser((prev) => ({ ...prev, addresses: response.data.addresses }));
    }
    return response.data;
  };

  const updateAddress = async (addressId, addressData) => {
    const response = await api.put(`/auth/address/${addressId}`, addressData);
    if (response.data.success) {
      setUser((prev) => ({ ...prev, addresses: response.data.addresses }));
    }
    return response.data;
  };

  const deleteAddress = async (addressId) => {
    const response = await api.delete(`/auth/address/${addressId}`);
    if (response.data.success) {
      setUser((prev) => ({ ...prev, addresses: response.data.addresses }));
    }
    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        login,
        register,
        registerBranchHead,
        loginGoogle,
        loginOTP,
        logout,
        addAddress,
        updateAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
