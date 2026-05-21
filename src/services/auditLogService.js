import api from "./api";







export const getAllLogs = async () => {
  const response = await api.get("/audit-logs");
  return response.data.data;
};


export const getUserLogs = async (userId) => {
  const response = await api.get(`/audit-logs/user/${userId}`);
  return response.data.data;
};
