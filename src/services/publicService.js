import api from "./api";







export const getLandingData = async () => {
  const response = await api.get("/public/landing");
  return response.data.data; 
};


export const discoverMCs = async (filters = {}) => {
  const response = await api.get("/public/mcs", { params: filters });
  return response.data.data; 
};


export const getMCProfile = async (id) => {
  const response = await api.get(`/public/mcs/${id}`);
  return response.data.data; 
};


export const getResources = async () => {
  const response = await api.get("/public/resources");
  return response.data.data;
};



export const getScriptCategories = async () => {
  const response = await api.get("/public/enums/script-categories");
  return response.data.data;
};

export const getUserRoles = async () => {
  const response = await api.get("/public/enums/user-roles");
  return response.data.data;
};

export const getBookingStatuses = async () => {
  const response = await api.get("/public/enums/booking-statuses");
  return response.data.data;
};

export const getTransactionStatuses = async () => {
  const response = await api.get("/public/enums/transaction-statuses");
  return response.data.data;
};

export const getReportReasons = async () => {
  const response = await api.get("/public/enums/report-reasons");
  return response.data.data;
};

export const getFeaturedTrainingStats = async () => {
  const response = await api.get("/public/featured-training");
  return response.data.data;
};
