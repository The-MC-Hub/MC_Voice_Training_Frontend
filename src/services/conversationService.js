import api from "./api";







export const getConversations = async () => {
  const response = await api.get("/chat/conversations");
  return response.data.data; 
};


export const getConversationById = async (conversationId) => {
  const response = await api.get(`/chat/conversations/${conversationId}`);
  return response.data.data; 
};


export const markConversationAsRead = async (conversationId) => {
  const response = await api.patch(`/chat/conversations/${conversationId}/read`);
  return response.data;
};


export const getMessages = async (conversationId, page = 0, size = 50) => {
  const response = await api.get(
    `/chat/messages/${conversationId}?page=${page}&size=${size}`
  );
  return response.data.data; 
};


export const sendMessage = async (conversationId, content, type = "TEXT") => {
  const response = await api.post(`/chat/messages/${conversationId}`, {
    content,
    type,
  });
  return response.data.data; 
};
