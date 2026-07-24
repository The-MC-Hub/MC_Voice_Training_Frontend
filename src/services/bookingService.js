import api from "./api";







export const createBooking = async (bookingData) => {
  const response = await api.post("/bookings", bookingData);
  return response.data.data;
};


export const getMyBookings = async (role = "client") => {
  const response = await api.get(`/bookings/my?role=${role}`);
  return response.data.data;
};


export const getClientBookings = async () => getMyBookings("client");


export const getMCBookings = async () => getMyBookings("mc");


export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data.data;
};


export const updateBookingStatus = async (id, status, price, rejectionReason) => {
  const response = await api.put(`/bookings/${id}/status`, {
    status,
    price,
    rejectionReason,
  });
  return response.data.data;
};


export const acceptBooking = async (bookingId, price) =>
  updateBookingStatus(bookingId, "ACCEPTED", price);


export const rejectBooking = async (bookingId, reason) =>
  updateBookingStatus(bookingId, "REJECTED", undefined, reason);


export const completeBooking = async (bookingId) =>
  updateBookingStatus(bookingId, "COMPLETED");


export const cancelBooking = async (id) => {
  const response = await api.put(`/bookings/${id}/cancel`);
  return response.data.data;
};
