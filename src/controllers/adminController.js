
import api from '../services/api';


export const fetchAllUsers = async () => {
  const response = await api.get('/admin/users');
  const rawUsers = response.data.data || [];
  return rawUsers.map(u => ({
    ...u,
    _id: u._id || u.id
  }));
};


export const verifyMC = async (id, isVerified, isActive = true) => {
  const response = await api.put(`/admin/users/${id}/status`, { isActive, isVerified });
  const user = response.data.data || {};
  return { ...user, _id: user._id || user.id };
};


export const suspendUser = async (id, isActive, isVerified = false) => {
  const response = await api.put(`/admin/users/${id}/status`, { isActive, isVerified });
  const user = response.data.data || {};
  return { ...user, _id: user._id || user.id };
};


export const fetchAllTransactions = async () => {
  const response = await api.get('/admin/transactions');
  return response.data.data || [];
};


export const fetchRevenueStats = async () => {
  const response = await api.get('/admin/revenue-stats');
  return response.data.data || {};
};


export const fetchDashboardStats = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data.data || {};
};
