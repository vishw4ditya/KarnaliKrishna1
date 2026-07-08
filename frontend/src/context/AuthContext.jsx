import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Create base axios instance pointing to Node Express API
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api'),
});

// Helper function to resolve relative asset uploads to backend URL
export const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  // Resolve base URL of backend
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const backendBaseUrl = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
  
  return `${backendBaseUrl}${path}`;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  const prevUserRef = useRef(null);

  // Isolate and sync cart items uniquely per user email
  useEffect(() => {
    const prevUser = prevUserRef.current;

    // 1. Save current active cart to the previous user's isolated key (or cart_guest)
    if (prevUser && prevUser.email) {
      const currentCart = localStorage.getItem('cart');
      if (currentCart) {
        localStorage.setItem(`cart_${prevUser.email}`, currentCart);
      } else {
        localStorage.removeItem(`cart_${prevUser.email}`);
      }
    } else if (!prevUser) {
      const currentCart = localStorage.getItem('cart');
      if (currentCart) {
        localStorage.setItem('cart_guest', currentCart);
      } else {
        localStorage.removeItem('cart_guest');
      }
    }

    // 2. Load the isolated cart of the new user (or guest) into the active 'cart' key
    if (user && user.email) {
      const userCart = localStorage.getItem(`cart_${user.email}`);
      if (userCart) {
        localStorage.setItem('cart', userCart);
      } else {
        localStorage.removeItem('cart');
      }
    } else {
      const guestCart = localStorage.getItem('cart_guest');
      if (guestCart) {
        localStorage.setItem('cart', guestCart);
      } else {
        localStorage.removeItem('cart');
      }
    }

    // Notify other components (Navbar, Cart) to recalculate quantities
    window.dispatchEvent(new Event('cart-updated'));

    // Update ref to the current user state
    prevUserRef.current = user;
  }, [user]);

  // Synchronize any cart changes immediately to the correct user isolated storage key
  useEffect(() => {
    const syncUserCart = () => {
      const currentCart = localStorage.getItem('cart');
      if (user && user.email) {
        if (currentCart) {
          localStorage.setItem(`cart_${user.email}`, currentCart);
        } else {
          localStorage.removeItem(`cart_${user.email}`);
        }
      } else {
        if (currentCart) {
          localStorage.setItem('cart_guest', currentCart);
        } else {
          localStorage.removeItem('cart_guest');
        }
      }
    };

    window.addEventListener('cart-updated', syncUserCart);
    return () => {
      window.removeEventListener('cart-updated', syncUserCart);
    };
  }, [user]);

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
