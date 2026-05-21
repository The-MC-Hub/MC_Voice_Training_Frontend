import api from "./api";








export const getBookingDetail = async (bookingId) => {
  const response = await api.get(`/bookings/${bookingId}/detail`);
  return response.data.data;
};


export const saveBookingDetail = async (bookingId, detailData) => {
  const response = await api.put(`/bookings/${bookingId}/detail`, detailData);
  return response.data.data;
};


export const updateMcNotes = async (bookingId, mcNotes) => {
  const response = await api.put(`/bookings/${bookingId}/detail/mc-notes`, {
    mcNotes,
  });
  return response.data.data;
};
