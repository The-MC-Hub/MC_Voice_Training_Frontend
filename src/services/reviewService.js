import api from "./api";







export const createReview = async (reviewData) => {
  const response = await api.post("/reviews", reviewData);
  return response.data.data;
};


export const getMCReviews = async (mcId) => {
  const response = await api.get(`/reviews/mc/${mcId}`);
  return response.data.data;
};


export const updateReview = async (id, reviewData) => {
  const response = await api.patch(`/reviews/${id}`, reviewData);
  return response.data.data;
};


export const deleteReview = async (id) => {
  const response = await api.delete(`/reviews/${id}`);
  return response.data;
};
