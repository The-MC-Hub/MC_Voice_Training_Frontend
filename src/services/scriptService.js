import api from "./api";







export const getScripts = async (filters = {}) => {
  const response = await api.get("/scripts", { params: filters });
  return response.data.data;
};


export const getScriptById = async (id) => {
  const response = await api.get(`/scripts/${id}`);
  return response.data.data;
};


export const favoriteScript = async (id) => {
  const response = await api.post(`/scripts/${id}/favorite`);
  return response.data.data;
};


export const getScriptReader = async (id) => {
  const response = await api.get(`/scripts/${id}/reader`);
  return response.data.data;
};
