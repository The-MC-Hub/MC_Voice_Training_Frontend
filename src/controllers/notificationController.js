import * as notificationService from "../services/notificationService";



export const fetchNotifications = async (page = 0) => {
  try {
    
    const result = await notificationService.getNotifications(page);
    return result || { notifications: [], total: 0, unreadCount: 0 };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return { notifications: [], total: 0, unreadCount: 0 };
  }
};

export const fetchUnreadCount = async () => {
  try {
    
    const result = await notificationService.getUnreadCount();
    return result?.count ?? 0;
  } catch (error) {
    console.error("Failed to fetch unread count:", error);
    return 0;
  }
};

export const markNotificationRead = async (id) => {
  
  return notificationService.markAsRead(id);
};

export const markAllNotificationsRead = async () => {
  return notificationService.markAllAsRead();
};

export const removeNotification = async (id) => {
  
  console.warn("deleteNotification not supported, use clearAll instead");
  return Promise.resolve();
};

export const clearAll = async () => {
  return notificationService.clearAllNotifications();
};
