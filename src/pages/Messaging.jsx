import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useChatStore } from '../store/useChatStore';
import { useAppSocket } from '../hooks/useAppSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, ChevronLeft, CheckCheck, Clock } from 'lucide-react';

export default function Messaging() {
  const { user, token } = useAuth();
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get('bookingId');

  const {
    conversations, activeConversationId, messages, loading,
    fetchMessages, sendMessage, setActiveConversation, onSocketMessage,
    fetchConversations, markAsRead,
  } = useChatStore();

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(true);

  useAppSocket(user?.id, token, { onChatMessage: onSocketMessage });

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (bookingIdParam && conversations.length > 0) {
      const match = conversations.find((c) => c.bookingId === bookingIdParam || c.bookingInfo?.id === bookingIdParam);
      if (match) {
        setActiveConversation(match.id);
        fetchMessages(match.id);
        setShowSidebar(false);
      }
    }
  }, [bookingIdParam, conversations]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
      markAsRead(activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !activeConversationId) return;
    await sendMessage(activeConversationId, inputText.trim());
    setInputText('');
    inputRef.current?.focus();
  }, [inputText, activeConversationId, sendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeMessages = messages[activeConversationId] || [];
  const activeConv = conversations.find((c) => c.id === activeConversationId);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const formatDateHeader = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === now.toDateString()) return 'Hôm nay';
    if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const groupedMessages = activeMessages.reduce((groups, msg) => {
    const date = msg.createdAt ? new Date(msg.createdAt).toDateString() : 'unknown';
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(showSidebar || !activeConversationId) && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0 overflow-hidden"
          >
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
              <h2 className="font-bold text-base flex items-center gap-2">
                <MessageSquare size={18} className="text-amber-500" />
                Tin nhắn
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {conversations.length} cuộc trò chuyện
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <MessageSquare size={40} className="text-zinc-200 dark:text-zinc-700 mb-3" />
                  <p className="text-sm text-zinc-400">Chưa có tin nhắn nào</p>
                  <p className="text-xs text-zinc-300 mt-1">Bắt đầu bằng cách tạo booking</p>
                </div>
              )}
              {conversations.map((conv) => {
                const otherParticipants = conv.participantInfo?.filter((p) => p.id !== user?.id) || [];
                const name = otherParticipants.map((p) => p.name).join(', ') || 'Cuộc trò chuyện';
                const lastMsg = conv.lastMessageInfo?.content || conv.lastMessage || '';
                const lastTime = conv.lastMessageInfo?.createdAt || conv.updatedAt;
                return (
                  <button
                    key={conv.id}
                    onClick={() => { setActiveConversation(conv.id); fetchMessages(conv.id); setShowSidebar(false); }}
                    className={`w-full text-left p-4 border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                      activeConversationId === conv.id
                        ? 'bg-amber-50/50 dark:bg-amber-900/10 border-l-2 border-l-amber-500'
                        : 'border-l-2 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold truncate flex-1">{name}</p>
                      {lastTime && (
                        <span className="text-[10px] text-zinc-400 shrink-0">{formatTime(lastTime)}</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{lastMsg || 'Chưa có tin nhắn'}</p>
                    {conv.bookingInfo?.eventName && (
                      <p className="text-[10px] text-amber-500 mt-1 truncate">
                        {conv.bookingInfo.eventName}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-zinc-900">
        {activeConversationId ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
              {!showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="flex md:hidden w-8 h-8 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <ChevronLeft size={18} className="text-zinc-500" />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {activeConv?.participantInfo?.filter((p) => p.id !== user?.id).map((p) => p.name).join(', ') || 'Cuộc trò chuyện'}
                </p>
                {activeConv?.bookingInfo?.eventName && (
                  <p className="text-xs text-amber-500 truncate">{activeConv.bookingInfo.eventName}</p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1 bg-zinc-50/50 dark:bg-zinc-950/50">
              {Object.keys(groupedMessages).length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare size={48} className="text-zinc-200 dark:text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-zinc-400">Chưa có tin nhắn</p>
                    <p className="text-xs text-zinc-300 mt-1">Hãy gửi tin nhắn đầu tiên</p>
                  </div>
                </div>
              )}
              {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                <div key={dateKey}>
                  <div className="flex justify-center my-4">
                    <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                      {formatDateHeader(msgs[0]?.createdAt)}
                    </span>
                  </div>
                  {[...msgs].reverse().map((msg, i) => {
                    const isMine = msg.senderId === user?.id;
                    const showTime = i === 0 || msgs[msgs.length - 1 - i + 1]?.senderId !== msg.senderId;
                    return (
                      <motion.div
                        key={msg.id || `${dateKey}-${i}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-2`}
                      >
                        <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            isMine
                              ? 'bg-amber-500 text-white rounded-br-sm shadow-sm'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm shadow-sm'
                          }`}>
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                          {showTime && (
                            <div className={`flex items-center gap-1 mt-0.5 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <span className="text-[10px] text-zinc-400">
                                {msg.createdAt ? formatTime(msg.createdAt) : ''}
                              </span>
                              {isMine && (
                                msg.status === 'READ' ? <CheckCheck size={12} className="text-blue-400" /> : <Clock size={12} className="text-zinc-400" />
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900">
              <div className="flex items-end gap-3 max-w-4xl mx-auto">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhập tin nhắn..."
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                  />
                  <span className="absolute right-3 bottom-3 text-[10px] text-zinc-300">
                    {inputText.length}
                  </span>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="px-5 py-3 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97] flex items-center gap-2 shadow-sm"
                >
                  <Send size={15} />
                  <span className="hidden sm:inline">Gửi</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-zinc-50/50 dark:bg-zinc-950/50">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={28} className="text-amber-400" />
              </div>
              <p className="text-zinc-400 text-sm font-medium">Chọn cuộc trò chuyện</p>
              <p className="text-zinc-300 text-xs mt-1">hoặc bắt đầu từ booking</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
