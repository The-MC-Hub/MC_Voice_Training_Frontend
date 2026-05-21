import api from "./api";







export const createCoupon = async (couponData) => {
  const response = await api.post("/coupons", couponData);
  return response.data.data;
};


export const getActiveCoupons = async () => {
  const response = await api.get("/coupons");
  return response.data.data;
};


export const getAllCouponsAdmin = async () => {
  const response = await api.get("/coupons/admin");
  return response.data.data;
};


export const validateCoupon = async (code, bookingAmount) => {
  const response = await api.post("/coupons/validate", { code, bookingAmount });
  return response.data.data;
};


export const toggleCoupon = async (id) => {
  const response = await api.put(`/coupons/${id}/toggle`);
  return response.data.data;
};
