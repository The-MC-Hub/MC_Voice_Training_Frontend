import * as mcService from "../services/mcService";



export const fetchDashboard = async () => {
  try {
    
    const result = await mcService.getMCDashboard();
    return result || {};
  } catch (error) {
    console.error("Failed to fetch dashboard:", error);
    return {};
  }
};

export const fetchCalendar = async () => {
  try {
    
    const result = await mcService.getMCCalendar();
    return Array.isArray(result) ? result : (result?.calendar ?? []);
  } catch (error) {
    console.error("Failed to fetch calendar:", error);
    return [];
  }
};

export const submitBlockout = async (blockoutData) => {
  
  return mcService.createBlockout(blockoutData);
};

export const fetchWallet = async () => {
  try {
    
    const result = await mcService.getMCWallet();
    return {
      stats: { balance: result?.balance ?? 0 },
      history: result?.transactions ?? [],
    };
  } catch (error) {
    console.error("Failed to fetch wallet:", error);
    return { stats: {}, history: [] };
  }
};

export const submitPayout = async (amount) => {
  
  return mcService.requestPayout(amount);
};

export const updateProfile = async (profileData) => {
  
  return mcService.updateMCProfile(profileData);
};

export const formatCalendarEvents = (calendar, bookings) => {
  return calendar.map((entry) => ({
    id: entry.id || entry._id,
    date: new Date(entry.date),
    startTime: entry.startTime,
    endTime: entry.endTime,
    status: entry.status,
    bookingId: entry.bookingId,
    title:
      entry.title ||
      (entry.status === "Busy"
        ? "Blocked"
        : entry.status === "Booked"
          ? bookings?.find((b) => b.id === entry.bookingId)?.eventType ||
            "Booked Event"
          : "Available"),
  }));
};
