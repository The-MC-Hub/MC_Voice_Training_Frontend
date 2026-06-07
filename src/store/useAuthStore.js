

import { create } from 'zustand';
import api from '../services/api';


const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    // exp is in seconds, Date.now() is in milliseconds
    return payload.exp * 1000 < Date.now();
  } catch (e) {
    console.error('Error decoding token:', e);
    return true;
  }
};

// Helper: Parse initial state from localStorage or sessionStorage
const getStoredAuth = () => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const user = JSON.parse(
      localStorage.getItem('user') || sessionStorage.getItem('user') || 'null'
    );

    if (token && isTokenExpired(token)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      return { token: null, user: null, role: null, isAuthenticated: false };
    }

    return { token, user, role: user?.role || null, isAuthenticated: !!token && !!user };
  } catch {
    return { token: null, user: null, role: null, isAuthenticated: false };
  }
};

const initial = getStoredAuth();

export const useAuthStore = create((set, get) => ({

  user: initial.user,
  token: initial.token,
  role: initial.role,
  isAuthenticated: initial.isAuthenticated,
  loading: false,
  error: null,

  refreshUser: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      const user = res.data?.data?.user;
      if (!user) return;
      const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(user));
      set({ user, role: user.role });
    } catch (_) {}
  },

  

  
  login: async (email, password, rememberMe = true) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data.data;



      const { token, user } = data;
      const storage = rememberMe ? localStorage : sessionStorage;
      
      if (rememberMe) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      storage.setItem('token', token);
      storage.setItem('user', JSON.stringify(user));

      set({
        user,
        token,
        role: user.role,
        isAuthenticated: true,
        loading: false,
        error: null,
      });

      return { token, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      set({ loading: false, error: message, isAuthenticated: false });
      throw err;
    }
  },



  
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', userData);
      set({ loading: false, error: null });
      // Backend returns { requiresVerification: true, email } — no auto-login
      return res.data.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      set({ loading: false, error: message });
      throw err;
    }
  },

  verifyOtp: async (email, code) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/verify-otp', { email, code });
      const { token, user } = res.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, role: user.role, isAuthenticated: true, loading: false, error: null });
      return { token, user };
    } catch (err) {
      const message = err.response?.data?.message || 'Mã OTP không đúng';
      set({ loading: false, error: message });
      throw err;
    }
  },

  resendOtp: async (email) => {
    try {
      await api.post('/auth/resend-otp', { email });
    } catch (err) {
      throw err;
    }
  },

  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    set({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      error: null,
    });
  },

  
  updateUser: (updatedUser) => {
    const merged = { ...get().user, ...updatedUser };
    const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(merged));
    set({ user: merged, role: merged.role });
  },

  
  clearError: () => set({ error: null }),

  
  isRole: (targetRole) => get().role === targetRole,
  isMC: () => get().role === 'mc',
  isClient: () => get().role === 'client',
  isAdmin: () => get().role === 'admin',
}));
