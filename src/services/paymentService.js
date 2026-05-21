import api from "./api";







export const createPaymentLink = async (bookingId) => {
  const response = await api.post(`/payments/${bookingId}/checkout`);
  return response.data.data;
};


export const getPaymentHistory = async () => {
  const response = await api.get("/payments/history");
  return response.data.data;
};


export const checkPaymentStatus = async (orderCode) => {
  const response = await api.get(`/payments/status/${orderCode}`);
  return response.data.data;
};
