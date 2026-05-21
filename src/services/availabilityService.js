import api from "./api";







export const createAvailability = async (payload) => {
  const response = await api.post("/availability", payload);
  return response.data.data;
};


export const getMCAvailability = async (mcId) => {
  const response = await api.get(`/availability/${mcId}`);
  return response.data.data;
};


export const removeAvailability = async (id) => {
  const response = await api.delete(`/availability/${id}`);
  return response.data;
};
