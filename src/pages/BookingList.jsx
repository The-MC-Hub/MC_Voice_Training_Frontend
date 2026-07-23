import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import * as bookingService from '../services/bookingService';
import * as reviewService from '../services/reviewService';
import BookingStatusBadge from '../components/BookingStatusBadge';
import { toast } from 'sonner';
import { X, Check, SendHorizonal, MessageCircle, Star, CreditCard, ChevronRight, Calendar, MapPin, Users, DollarSign, ClipboardX, AlertCircle } from 'lucide-react';

const TABS = ['ALL', 'PENDING', 'ACCEPTED', 'PAID', 'COMPLETED', 'CANCELLED', 'REJECTED'];

const statusColors = {
  ALL: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  ACCEPTED: 'bg-blue-50 text-blue-700 border-blue-200',
  PAID: 'bg-green-50 text-green-700 border-green-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-gray-100 text-gray-500 border-gray-200',
  REJECTED: 'bg-red-50 text-red-600 border-red-200',
};
const statusColorsActive = {
  ALL: 'bg-zinc-900 text-white',
  PENDING: 'bg-yellow-500 text-white',
  ACCEPTED: 'bg-blue-500 text-white',
  PAID: 'bg-green-500 text-white',
  COMPLETED: 'bg-emerald-500 text-white',
  CANCELLED: 'bg-gray-500 text-white',
  REJECTED: 'bg-red-500 text-white',
};

export default function BookingList() {
  const { user } = useAuth();
  const role = (user?.role || '').toLowerCase();
  const isMc = role === 'mc';
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [priceInput, setPriceInput] = useState({});
  const [rejectionReason, setRejectionReason] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [payingIds, setPayingIds] = useState(new Set());

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const list = await bookingService.getMyBookings(role);
      setBookings(list?.bookings || list || []);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [role]);

  const filtered = activeTab === 'ALL' ? bookings : bookings.filter((b) => b.status === activeTab);

  const handleAccept = async (bookingId) => {
    const price = priceInput[bookingId];
    if (!price || price <= 0) { toast.error('Vui lòng nhập giá'); return; }
    try {
      await bookingService.acceptBooking(bookingId, Number(price));
      toast.success('Đã chấp nhận booking');
      fetchBookings();
    } catch (err) { toast.error(err?.response?.data?.message || 'Lỗi'); }
  };

  const handleReject = async (bookingId) => {
    const reason = rejectionReason[bookingId] || 'Không phù hợp';
    try {
      await bookingService.rejectBooking(bookingId, reason);
      toast.success('Đã từ chối booking');
      fetchBookings();
    } catch (err) { toast.error(err?.response?.data?.message || 'Lỗi'); }
  };

  const handleComplete = async (bookingId) => {
    try {
      await bookingService.completeBooking(bookingId);
      toast.success('Đã hoàn thành');
      fetchBookings();
    } catch (err) { toast.error(err?.response?.data?.message || 'Lỗi'); }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Bạn có chắc muốn hủy booking này?')) return;
    try {
      await bookingService.cancelBooking(bookingId);
      toast.success('Đã hủy booking');
      fetchBookings();
    } catch (err) { toast.error(err?.response?.data?.message || 'Lỗi'); }
  };

  const handlePay = async (bookingId) => {
    setPayingIds((prev) => new Set(prev).add(bookingId));
    try {
      const { default: api } = await import('../services/api');
      const res = await api.post(`/payment/booking/create-order?bookingId=${bookingId}`);
      const data = res.data.data;
      if (data?.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
        toast.success('Chuyển đến trang thanh toán...');
      } else {
        toast.error('Không thể tạo link thanh toán');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Lỗi tạo thanh toán');
    } finally {
      setPayingIds((prev) => { const n = new Set(prev); n.delete(bookingId); return n; });
    }
  };

  const submitReview = async () => {
    if (!showReviewModal) return;
    setSubmittingReview(true);
    try {
      await reviewService.createReview({ bookingId: showReviewModal, rating: reviewRating, comment: reviewComment });
      toast.success('Đánh giá thành công');
      setShowReviewModal(null);
      setReviewRating(5);
      setReviewComment('');
      fetchBookings();
    } catch (err) { toast.error(err?.response?.data?.message || 'Lỗi'); }
    finally { setSubmittingReview(false); }
  };

  const stats = TABS.map((tab) => ({
    key: tab,
    count: tab === 'ALL' ? bookings.length : bookings.filter((b) => b.status === tab).length,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isMc ? 'Yêu cầu đặt lịch' : 'Booking của tôi'}
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              {isMc ? 'Quản lý yêu cầu từ khách hàng' : 'Theo dõi trạng thái booking'}
            </p>
          </div>
          {!isMc && (
            <Link
              to="/m/search"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-all active:scale-[0.97] shadow-sm"
            >
              Tìm MC <ChevronRight size={16} />
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {stats.map(({ key, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                activeTab === key
                  ? `${statusColorsActive[key]} border-transparent shadow-sm`
                  : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
              }`}
            >
              {key === 'ALL' ? 'Tất cả' : (
                key === 'PENDING' ? 'Chờ' :
                key === 'ACCEPTED' ? 'Đã nhận' :
                key === 'PAID' ? 'Đã trả' :
                key === 'COMPLETED' ? 'Xong' :
                key === 'CANCELLED' ? 'Đã hủy' : 'Từ chối'
              )}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                activeTab === key ? 'bg-white/20' : 'bg-zinc-100 dark:bg-zinc-800'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="h-10 w-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} className="text-zinc-300 dark:text-zinc-600" />
            </div>
            <p className="text-zinc-500 font-medium">Chưa có booking nào</p>
            {!isMc && (
              <Link to="/m/search" className="text-amber-600 text-sm mt-2 inline-block hover:text-amber-700 transition-colors">
                Tìm MC ngay →
              </Link>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {filtered.map((b, i) => (
                <motion.div
                  key={b.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all hover:shadow-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-base truncate">{b.eventName || 'Sự kiện'}</h3>
                        <BookingStatusBadge status={b.status} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-zinc-400">
                        {b.eventDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(b.eventDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                          </span>
                        )}
                        {b.startTime && <span>⌚ {b.startTime}-{b.endTime}</span>}
                        {b.location && (
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin size={12} />
                            {b.location}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        {isMc
                          ? `Khách hàng: ${b.clientName || b.client}`
                          : `MC: ${b.mcName || b.mc}`}
                      </p>
                      {!isMc && (b.mcRatesMin > 0 || b.mcRatesMax > 0 || b.mcRating > 0 || b.mcExperience > 0) && (
                        <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-zinc-400">
                          {b.mcRating > 0 && <span>★ {b.mcRating.toFixed(1)}</span>}
                          {b.mcExperience > 0 && <span>{b.mcExperience} năm</span>}
                          {b.mcRatesMin > 0 && <span>{b.mcRatesMin.toLocaleString()}đ - {b.mcRatesMax.toLocaleString()}đ</span>}
                          {b.mcRegion && <span>{b.mcRegion}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-sm">
                    {b.price > 0 && (
                      <span className="flex items-center gap-1 font-semibold text-amber-600">
                        <DollarSign size={14} />
                        {b.price.toLocaleString()}đ
                      </span>
                    )}
                    {b.audienceSize > 0 && (
                      <span className="flex items-center gap-1 text-xs text-zinc-400">
                        <Users size={12} />
                        {b.audienceSize} khách
                      </span>
                    )}
                    {b.eventType && (
                      <span className="text-xs text-zinc-400">{b.eventType}</span>
                    )}
                  </div>

                  {/* Rejection reason */}
                  {b.status === 'REJECTED' && b.rejectionReason && (
                    <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                      <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-red-600 dark:text-red-400">{b.rejectionReason}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-50 dark:border-zinc-800">
                    {/* MC: accept/reject PENDING */}
                    {isMc && b.status === 'PENDING' && (
                      <>
                        <div className="flex items-center gap-2 w-full mb-2">
                          <div className="relative flex-1">
                            <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                              type="number"
                              placeholder="Giá (VNĐ)"
                              value={priceInput[b.id] || ''}
                              onChange={(e) => setPriceInput({ ...priceInput, [b.id]: e.target.value })}
                              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-8 pr-3 py-2 text-xs outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 transition-all"
                            />
                          </div>
                          <div className="relative flex-1">
                            <input
                              type="text"
                              placeholder="Lý do từ chối"
                              value={rejectionReason[b.id] || ''}
                              onChange={(e) => setRejectionReason({ ...rejectionReason, [b.id]: e.target.value })}
                              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-xs outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/30 transition-all"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleAccept(b.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500 text-white rounded-xl text-xs font-semibold hover:bg-emerald-600 transition-all active:scale-[0.97] shadow-sm"
                        >
                          <Check size={14} /> Chấp nhận
                        </button>
                        <button
                          onClick={() => handleReject(b.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-all"
                        >
                          <ClipboardX size={14} /> Từ chối
                        </button>
                      </>
                    )}

                    {/* Client: cancel PENDING or ACCEPTED */}
                    {(b.status === 'PENDING' || b.status === 'ACCEPTED') && !isMc && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-xs font-semibold hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                      >
                        <X size={14} /> Hủy
                      </button>
                    )}

                    {/* Client: pay ACCEPTED */}
                    {b.status === 'ACCEPTED' && !isMc && b.price > 0 && (
                      <button
                        onClick={() => handlePay(b.id)}
                        disabled={payingIds.has(b.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 transition-all active:scale-[0.97] disabled:opacity-50 shadow-sm"
                      >
                        {payingIds.has(b.id) ? (
                          <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <CreditCard size={14} />
                        )}
                        Thanh toán ngay
                      </button>
                    )}

                    {/* MC: complete PAID */}
                    {b.status === 'PAID' && isMc && (
                      <button
                        onClick={() => handleComplete(b.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-semibold hover:bg-emerald-600 transition-all active:scale-[0.97] shadow-sm"
                      >
                        <Check size={14} /> Hoàn thành
                      </button>
                    )}

                    {/* Client: review COMPLETED */}
                    {b.status === 'COMPLETED' && !isMc && (
                      <button
                        onClick={() => { setShowReviewModal(b.id); setReviewRating(5); setReviewComment(''); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30 transition-all"
                      >
                        <Star size={14} /> Đánh giá
                      </button>
                    )}

                    <Link
                      to={`/m/messaging?bookingId=${b.id}`}
                      className="flex items-center gap-1.5 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <MessageCircle size={14} /> Nhắn tin
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Review Modal */}
        <AnimatePresence>
          {showReviewModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowReviewModal(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-md w-full shadow-xl border border-zinc-100 dark:border-zinc-800"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-lg font-bold mb-1">Đánh giá MC</h2>
                <p className="text-xs text-zinc-400 mb-5">Chia sẻ trải nghiệm của bạn về buổi sự kiện</p>

                <div className="flex justify-center gap-2 mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className={`text-3xl transition-all hover:scale-110 active:scale-95 ${
                        star <= reviewRating ? 'text-yellow-400' : 'text-zinc-200 dark:text-zinc-700'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Ấn tượng của bạn về MC..."
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all resize-none"
                />

                <div className="flex gap-3 justify-end mt-5">
                  <button
                    onClick={() => setShowReviewModal(null)}
                    className="px-4 py-2.5 text-sm font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={submitReview}
                    disabled={submittingReview || reviewRating === 0}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 disabled:opacity-50 transition-all active:scale-[0.97] shadow-sm"
                  >
                    {submittingReview ? (
                      <>
                        <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <SendHorizonal size={14} />
                        Gửi đánh giá
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
