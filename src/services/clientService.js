import api from "./api";

export const getClientProfile = async () => {
  const response = await api.get("/client/profile");
  return response.data.data;
};

export const updateClientProfile = async (profileData) => {
  const response = await api.put("/client/profile", profileData);
  return response.data.data;
};

export const createClientProfile = async (profileData) => {
  const response = await api.post("/client/profile", profileData);
  return response.data.data;
};
