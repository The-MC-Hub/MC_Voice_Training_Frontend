import * as bookingService from "../services/bookingService";

export const fetchMCBookings = async () => {
  try {
    const result = await bookingService.getMCBookings();
    return result || [];
  } catch (error) {
    console.error("Failed to fetch MC bookings:", error);
    return [];
  }
};
