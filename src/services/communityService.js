import api from "./api";

// Public & Participant community routes
export const getStats = async () => {
  const response = await api.get("/community/stats");
  return response.data;
};

export const getLeaderboards = async () => {
  const response = await api.get("/community/leaderboards");
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
