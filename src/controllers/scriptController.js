import * as scriptService from "../services/scriptService";

export const fetchScripts = async (filters = {}) => {
  try {
    const result = await scriptService.getScripts(filters);
    return result || [];
  } catch (error) {
    console.error("Failed to fetch scripts:", error);
    return [];
  }
};

export const fetchScript = async (id) => {
  try {
    const result = await scriptService.getScriptById(id);
    return result || null;
  } catch (error) {
    console.error("Failed to fetch script:", error);
    return null;
  }
};

export const fetchScriptReader = async (id) => {
  try {
    const result = await scriptService.getScriptReader(id);
    return result.data || null;
  } catch (error) {
    console.error("Failed to fetch script reader data:", error);
    return null;
  }
};

export const toggleFavorite = async (id) => {
  const result = await scriptService.favoriteScript(id);
  return result;
};
