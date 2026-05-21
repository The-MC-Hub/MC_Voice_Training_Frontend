import api from "./api";

export const getComments = async (bookingId) => {
  const response = await api.get(`/scripts/collab/${bookingId}/comments`);
  return response.data;
};

export const addComment = async (bookingId, commentData) => {
  const response = await api.post(`/scripts/collab/${bookingId}/comments`, commentData);
  return response.data;
};

export const resolveComment = async (commentId) => {
  const response = await api.patch(`/scripts/collab/comments/${commentId}/resolve`);
  return response.data;
};
