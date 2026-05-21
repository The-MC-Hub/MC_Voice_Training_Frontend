import * as communityService from "../services/communityService";

export const fetchStats = async () => {
  try {
    const result = await communityService.getStats();
    return result.data || {};
  } catch (error) {
    console.error("Failed to fetch community stats:", error);
    return {};
  }
};

export const fetchLeaderboards = async () => {
  try {
    const result = await communityService.getLeaderboards();
    return result.data || { diligent: [], precision: [], streak: [] };
  } catch (error) {
    console.error("Failed to fetch leaderboards:", error);
    return { diligent: [], precision: [], streak: [] };
  }
};

export const fetchActiveArenas = async () => {
  try {
    const result = await communityService.getActiveArenas();
    return result.data || [];
  } catch (error) {
    console.error("Failed to fetch active arenas:", error);
    return [];
  }
};

export const fetchAdminCompetitions = async () => {
  try {
    const result = await communityService.getAdminCompetitions();
    return result.data || [];
  } catch (error) {
    console.error("Failed to fetch admin competitions:", error);
    return [];
  }
};

export const addCompetition = async (data) => {
  try {
    const result = await communityService.createAdminCompetition(data);
    return result.data;
  } catch (error) {
    console.error("Failed to create competition:", error);
    throw error;
  }
};

export const updateCompetition = async (id, data) => {
  try {
    const result = await communityService.updateAdminCompetition(id, data);
    return result.data;
  } catch (error) {
    console.error("Failed to update competition:", error);
    throw error;
  }
};

export const deleteCompetition = async (id) => {
  try {
    await communityService.deleteAdminCompetition(id);
    return true;
  } catch (error) {
    console.error("Failed to delete competition:", error);
    throw error;
  }
};
