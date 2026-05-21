import api from "./api";







export const getMCDashboard = async () => {
  const response = await api.get("/mcs/dashboard");
  return response.data.data;
};


export const updateMCProfile = async (profileData) => {
  const response = await api.put("/mcs/profile", profileData);
  return response.data.data;
};


export const getMCCalendar = async () => {
  const response = await api.get("/mcs/calendar");
  return response.data.data;
};


export const createBlockout = async (blockoutData) => {
  const response = await api.post("/mcs/calendar/blockout", blockoutData);
  return response.data.data;
};


export const getMCWallet = async () => {
  const response = await api.get("/mcs/wallet");
  return response.data.data;
};


export const requestPayout = async (amount) => {
  const response = await api.post("/mcs/payout", { amount });
  return response.data.data;
};
