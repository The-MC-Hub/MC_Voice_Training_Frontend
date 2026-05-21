import api from "./api";







export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data; 
};


export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data; 
};




export const forgotPassword = async (email) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};


export const resetPassword = async (email, code, newPassword) => {
  const response = await api.post("/auth/reset-password", { email, code, newPassword });
  return response.data;
};


export const fixPasswords = async () => {
  const response = await api.get("/auth/fix-passwords");
  return response.data;
};


export const updateSettings = async (settings) => {
  const response = await api.put("/auth/settings", settings);
  return response.data;
};


export const submitKYC = async (kycData) => {
  const response = await api.post("/auth/kyc", kycData);
  return response.data;
};
