import api from "./api";

export const getNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.put("/notifications/read-all");
  return response.data;
};

// ── Admin ──────────────────────────────────────────────────────────────────

export const getAllNotificationsAdmin = async () => {
  const response = await api.get("/admin/notifications");
  return response.data;
};

export const sendManualNotification = async (payload) => {
  const response = await api.post("/admin/notifications/send", payload);
  return response.data;
};

export const deleteNotificationAdmin = async (id) => {
  const response = await api.delete(`/admin/notifications/${id}`);
  return response.data;
};

export const getNotificationStats = async () => {
  const response = await api.get("/admin/notifications/stats");
  return response.data;
};
