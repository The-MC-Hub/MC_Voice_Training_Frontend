import api from "./api";

// Public & Participant community routes
export const getStats = async () => {
  const response = await api.get("/community/stats");
  return response.data;
};

export const getLeaderboard = async ({ type = 'streak', period = 'all_time', page = 0, size = 20 } = {}) => {
  const response = await api.get("/community/leaderboard", { params: { type, period, page, size } });
  return response.data;
};

export const getMyRank = async ({ type = 'streak', period = 'all_time' } = {}) => {
  const response = await api.get("/community/leaderboard/me", { params: { type, period } });
  return response.data;
};

export const getFlashDeals = async () => {
  const response = await api.get("/payment/flash-deals");
  return response.data;
};

export const getActiveArenas = async () => {
  const response = await api.get("/community/active-arenas");
  return response.data;
};

// Admin CRUD routes for competitions
export const getAdminCompetitions = async () => {
  const response = await api.get("/admin/competitions");
  return response.data;
};

export const createAdminCompetition = async (competitionData) => {
  const response = await api.post("/admin/competitions", competitionData);
  return response.data;
};

export const updateAdminCompetition = async (id, competitionData) => {
  const response = await api.put(`/admin/competitions/${id}`, competitionData);
  return response.data;
};

export const deleteAdminCompetition = async (id) => {
  const response = await api.delete(`/admin/competitions/${id}`);
  return response.data;
};
