import * as paymentService from "../services/paymentService";

export const createPayOSLink = async (bookingId) => {
  try {
    const result = await paymentService.createPaymentLink(bookingId);
    return result.data; 
  } catch (error) {
    console.error("Failed to create payment link:", error);
    throw error;
  }
};

export const fetchPaymentHistory = async () => {
  try {
    const result = await paymentService.getPaymentHistory();
    return result.data?.transactions || [];
  } catch (error) {
    console.error("Failed to fetch payment history:", error);
    return [];
  }
};

export const formatAmount = (amount) => {
  if (!amount || isNaN(amount)) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};
