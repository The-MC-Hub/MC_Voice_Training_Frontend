import * as publicService from "../services/publicService";



export const fetchLandingData = async () => {
  try {
    
    const result = await publicService.getLandingData();
    return result || {};
  } catch (error) {
    console.error("Failed to fetch landing data:", error);
    return {};
  }
};

export const fetchMCs = async (filters = {}) => {
  try {
    
    const result = await publicService.discoverMCs(filters);
    return result?.mcs ?? [];
  } catch (error) {
    console.error("Failed to fetch MCs:", error.response?.data || error.message);
    return [];
  }
};

export const fetchMCProfile = async (id) => {
  try {
    
    const result = await publicService.getMCProfile(id);
    return result?.profile ?? null;
  } catch (error) {
    console.error("Failed to fetch MC profile:", error);
    return null;
  }
};

export const fetchResources = async () => {
  try {
    
    const result = await publicService.getResources();
    return result?.resources ?? [];
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    return [];
  }
};



export const fetchVenueTypes = async () => {
  try {
    const result = await publicService.getVenueTypes();
    return result || [];
  } catch (error) {
    console.error("Failed to fetch venue types:", error);
    return [];
  }
};

export const fetchScriptCategories = async () => {
  try {
    const result = await publicService.getScriptCategories();
    return result || [];
  } catch (error) {
    console.error("Failed to fetch script categories:", error);
    return [];
  }
};

export const fetchUserRoles = async () => {
  try {
    const result = await publicService.getUserRoles();
    return result || [];
  } catch (error) {
    console.error("Failed to fetch user roles:", error);
    return [];
  }
};

export const fetchBookingStatuses = async () => {
  try {
    const result = await publicService.getBookingStatuses();
    return result || [];
  } catch (error) {
    console.error("Failed to fetch booking statuses:", error);
    return [];
  }
};

export const fetchTransactionStatuses = async () => {
  try {
    const result = await publicService.getTransactionStatuses();
    return result || [];
  } catch (error) {
    console.error("Failed to fetch transaction statuses:", error);
    return [];
  }
};

export const fetchReportReasons = async () => {
  try {
    const result = await publicService.getReportReasons();
    return result || [];
  } catch (error) {
    console.error("Failed to fetch report reasons:", error);
    return [];
  }
};

export const fetchFeaturedTrainingStats = async () => {
  try {
    const result = await publicService.getFeaturedTrainingStats();
    return result || [];
  } catch (error) {
    console.error("Failed to fetch featured training stats:", error);
    return [];
  }
};
