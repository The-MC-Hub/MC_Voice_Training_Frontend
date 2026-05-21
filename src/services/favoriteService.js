import api from "./api";







export const toggleFavorite = async (mcUserId) => {
  const response = await api.post(`/favorites/${mcUserId}`);
  return response.data.data;
};


export const getMyFavorites = async () => {
  const response = await api.get("/favorites/my");
  return response.data.data;
};


export const checkFavorite = async (mcUserId) => {
  const response = await api.get(`/favorites/check/${mcUserId}`);
  return response.data.data;
};
