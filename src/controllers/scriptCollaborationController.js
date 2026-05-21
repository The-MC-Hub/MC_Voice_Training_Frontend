import * as scriptService from "../services/scriptCollaborationService";

export const fetchScriptComments = async (bookingId) => {
  try {
    const response = await scriptService.getComments(bookingId);
    return response.success ? response.data : [];
  } catch (error) {
    console.error("Failed to fetch script comments:", error);
    return [];
  }
};

export const createScriptComment = async (bookingId, commentData) => {
  try {
    const response = await scriptService.addComment(bookingId, commentData);
    return response.success ? response.data : null;
  } catch (error) {
    console.error("Failed to create script comment:", error);
    return null;
  }
};

export const resolveScriptComment = async (commentId) => {
  try {
    const response = await scriptService.resolveComment(commentId);
    return response.success;
  } catch (error) {
    console.error("Failed to resolve script comment:", error);
    return false;
  }
};
