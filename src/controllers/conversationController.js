import * as conversationService from "../services/conversationService";

export const fetchConversations = async () => {
  try {
    const result = await conversationService.getConversations();
    return result.conversations || [];
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return [];
  }
};

export const fetchConversation = async (conversationId) => {
  try {
    const result =
      await conversationService.getConversationById(conversationId);
    return result.conversation || null;
  } catch (error) {
    console.error("Failed to fetch conversation:", error);
    return null;
  }
};

export const fetchMessages = async (conversationId, page = 0) => {
  try {
    const result = await conversationService.getMessages(conversationId, page);
    return result || { messages: [], total: 0, page: 1, pages: 1 };
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return { messages: [], total: 0, page: 1, pages: 1 };
  }
};

export const postMessage = async (conversationId, content, type = "text") => {
  const result = await conversationService.sendMessage(
    conversationId,
    content,
    type,
  );
  return result.message;
};

export const markAsRead = async (conversationId) => {
  return conversationService.markConversationAsRead(conversationId);
};
