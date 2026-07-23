import { create } from 'zustand';
import * as conversationService from '../services/conversationService';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  loading: false,

  fetchConversations: async () => {
    try {
      const data = await conversationService.getConversations();
      set({ conversations: data?.conversations || [] });
    } catch { /* ignore */ }
  },

  setActiveConversation: (id) => set({ activeConversationId: id }),

  fetchMessages: async (conversationId, page = 0) => {
    set({ loading: true });
    try {
      const data = await conversationService.getMessages(conversationId, page);
      const key = conversationId;
      const existing = get().messages[key] || [];
      const merged = page === 0
        ? (data?.messages || [])
        : [...(data?.messages || []), ...existing];
      set({ messages: { ...get().messages, [key]: merged } });
    } finally {
      set({ loading: false });
    }
  },

  sendMessage: async (conversationId, content, type = 'TEXT') => {
    try {
      const msg = await conversationService.sendMessage(conversationId, content, type);
      const key = conversationId;
      const existing = get().messages[key] || [];
      set({ messages: { ...get().messages, [key]: [...existing, msg] } });
      return msg;
    } catch { /* ignore */ }
  },

  onSocketMessage: (message) => {
    if (!message?.conversationId) return;
    const key = message.conversationId;
    const existing = get().messages[key] || [];
    const deduped = existing.some((m) => m.id && m.id === message.id)
      ? existing
      : [...existing, message];
    set({ messages: { ...get().messages, [key]: deduped } });
  },

  markAsRead: async (conversationId) => {
    try {
      await conversationService.markConversationAsRead(conversationId);
    } catch { /* ignore */ }
  },
}));
