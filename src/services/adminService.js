import api from "./api";







export const getAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data.data;
};


export const getAllUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data.data;
};


export const getAllMCs = async () => {
  const response = await api.get("/admin/users/mcs");
  return response.data.data;
};


export const getAllClients = async () => {
  const response = await api.get("/admin/users/clients");
  return response.data.data;
};


export const updateUserStatus = async (id, data) => {
  const response = await api.put(`/admin/users/${id}/status`, data);
  return response.data.data;
};


export const getAllBookings = async () => {
  const response = await api.get("/admin/bookings");
  return response.data.data;
};
