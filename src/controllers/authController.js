import * as authService from "../services/authService";

export const handleLogin = async (email, password) => {
  const result = await authService.login(email, password);
  if (result.status === "success") {
    localStorage.setItem("token", result.data.token);
    localStorage.setItem("user", JSON.stringify(result.data.user));
  }
  return result;
};



export const handleRegister = async (userData) => {
  const result = await authService.register(userData);
  if (result.status === "success") {
    localStorage.setItem("token", result.data.token);
    localStorage.setItem("user", JSON.stringify(result.data.user));
  }
  return result;
};

export const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const handleUpdateSettings = async (settings) => {
  const result = await authService.updateSettings(settings);
  if (result.status === "success") {
    localStorage.setItem("user", JSON.stringify(result.data.user));
  }
  return result;
};



export const handleSubmitKYC = async (kycData) => {
  const result = await authService.submitKYC(kycData);
  if (result.status === "success") {
    localStorage.setItem("user", JSON.stringify(result.data.user));
  }
  return result;
};
