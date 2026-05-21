import api from "./api";







export const getNotifications = async (page = 0, limit = 20) => {
  const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
  return response.data.data;
};


export const getUnreadCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response.data.data;
};


export const markAsRead = async (id) => {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
};


export const markAllAsRead = async () => {
  const response = await api.post("/notifications/mark-all-read");
  return response.data;
};


export const clearAllNotifications = async () => {
  const response = await api.delete("/notifications/delete-all");
  return response.data;
};
