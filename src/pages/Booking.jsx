import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '../services/api';
import { createBooking } from '../services/bookingService';
import { CalendarDays, Clock, MapPin, Users, DollarSign, FileText, ArrowRight, Check, ChevronLeft } from 'lucide-react';

const EVENT_TYPES = [
  'WEDDING', 'BIRTHDAY', 'CORPORATE_EVENT', 'CONFERENCE', 'SEMINAR',
  'WORKSHOP', 'GALA_DINNER', 'FESTIVAL', 'CONCERT', 'SPORTS_EVENT',
  'FASHION_SHOW', 'AWARD_CEREMONY', 'CHARITY_EVENT', 'TV_SHOW',
  'RADIO_SHOW', 'PODCAST', 'ONLINE_EVENT', 'PRODUCT_LAUNCH',
  'PRESS_CONFERENCE', 'SCHOOL_EVENT', 'FAMILY_EVENT', 'RELIGIOUS_EVENT', 'OTHER',
];

const eventTypeLabels = {
  WEDDING: 'Cưới', BIRTHDAY: 'Sinh nhật', CORPORATE_EVENT: 'Sự kiện doanh nghiệp',
  CONFERENCE: 'Hội thảo', SEMINAR: 'Seminar', WORKSHOP: 'Workshop',
  GALA_DINNER: 'Gala Dinner', FESTIVAL: 'Lễ hội', CONCERT: 'Hòa nhạc',
  SPORTS_EVENT: 'Thể thao', FASHION_SHOW: 'Thời trang', AWARD_CEREMONY: 'Lễ trao giải',
  CHARITY_EVENT: 'Từ thiện', TV_SHOW: 'TV Show', RADIO_SHOW: 'Radio Show',
  PODCAST: 'Podcast', ONLINE_EVENT: 'Online', PRODUCT_LAUNCH: 'Ra mắt sản phẩm',
  PRESS_CONFERENCE: 'Họp báo', SCHOOL_EVENT: 'Sự kiện trường học',
  FAMILY_EVENT: 'Gia đình', RELIGIOUS_EVENT: 'Tôn giáo', OTHER: 'Khác',
};

export default function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mcIdParam = searchParams.get('mcId');

  const [step, setStep] = useState('form');
  const [mcId, setMcId] = useState(mcIdParam || '');
  const [mcName, setMcName] = useState('');
  const [eventType, setEventType] = useState('WEDDING');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [audienceSize, setAudienceSize] = useState('');
  const [budget, setBudget] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mcs, setMcs] = useState([]);

  useEffect(() => {
    api.get('/public/mcs').then((res) => {
      const list = res.data.data || [];
      setMcs(list);
      if (mcIdParam) {
        const found = list.find((m) => (m.id || m._id) === mcIdParam);
        if (found) { setMcId(found.id || found._id); setMcName(found.name); }
      }
    }).catch(() => {});
  }, []);

  const handleMcChange = (e) => {
    const id = e.target.value;
    setMcId(id);
    const found = mcs.find((m) => (m.id || m._id) === id);
    setMcName(found?.name || '');
  };

  const selectedMc = mcs.find((m) => (m.id || m._id) === mcId);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const validate = () => {
    if (!mcId) { toast.error('Vui lòng chọn MC'); return false; }
    if (!eventDate) { toast.error('Vui lòng chọn ngày diễn ra'); return false; }
    if (eventDate < minDate) { toast.error('Ngày diễn ra phải từ ngày mai trở đi'); return false; }
    if (!startTime || !endTime) { toast.error('Vui lòng nhập thời gian'); return false; }
    return true;
  };

  const goToConfirm = () => {
    if (!validate()) return;
    setStep('confirm');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        mc: mcId,
        eventDate,
        startTime,
        endTime,
        eventName: eventName || undefined,
        location: location || undefined,
        eventType,
        description: description || undefined,
        audienceSize: audienceSize ? Number(audienceSize) : undefined,
        budget: budget ? Number(budget) : undefined,
        specialRequests: specialRequests || undefined,
      };
      await createBooking(payload);
      toast.success('Gửi yêu cầu thành công!');
      navigate('/m/bookings');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formContent = (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-semibold mb-1.5">Chọn MC <span className="text-red-400">*</span></label>
        <select
          value={mcId}
          onChange={handleMcChange}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
        >
          <option value="">-- Chọn MC --</option>
          {mcs.map((m) => (
            <option key={m.id || m._id} value={m.id || m._id}>{m.name}</option>
          ))}
        </select>
        {selectedMc && (
          <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10">
            <img
              src={selectedMc.avatar || 'https://ui-avatars.com/api/?name=MC&background=amber&color=fff'}
              alt=""
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div>
              <p className="text-xs font-semibold">{selectedMc.name}</p>
              {selectedMc.rating > 0 && (
                <p className="text-[10px] text-zinc-500">⭐ {selectedMc.rating.toFixed(1)}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5">Loại sự kiện <span className="text-red-400">*</span></label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{eventTypeLabels[t] || t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5">Tên sự kiện</label>
          <div className="relative">
            <FileText size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="VD: Đám cưới Tuấn - Hoa"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-10 pr-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Ngày diễn ra <span className="text-red-400">*</span></label>
        <div className="relative">
          <CalendarDays size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="date"
            value={eventDate}
            min={minDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-10 pr-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5">Giờ bắt đầu <span className="text-red-400">*</span></label>
          <div className="relative">
            <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-10 pr-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5">Giờ kết thúc <span className="text-red-400">*</span></label>
          <div className="relative">
            <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-10 pr-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5">Số lượng khách</label>
          <div className="relative">
            <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="number"
              value={audienceSize}
              onChange={(e) => setAudienceSize(e.target.value)}
              min="0"
              placeholder="VD: 200"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-10 pr-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1.5">Ngân sách (VNĐ)</label>
          <div className="relative">
            <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              min="0"
              placeholder="VD: 5000000"
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-10 pr-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Địa điểm</label>
        <div className="relative">
          <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="VD: 123 Nguyễn Huệ, Quận 1"
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-10 pr-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Mô tả sự kiện</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Mô tả chi tiết về sự kiện..."
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Yêu cầu đặc biệt</label>
        <textarea
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          rows={2}
          placeholder="Yêu cầu riêng cho MC..."
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
        />
      </div>

      <button
        type="button"
        onClick={goToConfirm}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white py-3 rounded-xl font-semibold hover:bg-amber-600 transition-all active:scale-[0.98] shadow-sm"
      >
        Xem lại thông tin <ArrowRight size={18} />
      </button>
    </div>
  );

  const confirmContent = (
    <div className="space-y-6">
      <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 p-5 space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-700">
          <img
            src={selectedMc?.avatar || 'https://ui-avatars.com/api/?name=MC&background=amber&color=fff'}
            alt=""
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div>
            <p className="font-bold">{selectedMc?.name}</p>
            <p className="text-xs text-zinc-400">{eventTypeLabels[eventType] || eventType}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Ngày</p>
            <p className="font-medium">
              {new Date(eventDate + 'T00:00:00').toLocaleDateString('vi-VN', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Thời gian</p>
            <p className="font-medium">{startTime} - {endTime}</p>
          </div>
          {eventName && (
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Tên sự kiện</p>
              <p className="font-medium">{eventName}</p>
            </div>
          )}
          {location && (
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Địa điểm</p>
              <p className="font-medium">{location}</p>
            </div>
          )}
          {audienceSize > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Khách mời</p>
              <p className="font-medium">{Number(audienceSize).toLocaleString()} người</p>
            </div>
          )}
          {budget > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Ngân sách</p>
              <p className="font-medium text-amber-600">{Number(budget).toLocaleString()}đ</p>
            </div>
          )}
        </div>

        {description && (
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-700">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Mô tả</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
          </div>
        )}
        {specialRequests && (
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-700">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Yêu cầu đặc biệt</p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{specialRequests}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setStep('form')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
        >
          <ChevronLeft size={18} /> Chỉnh sửa
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-50 transition-all active:scale-[0.98] shadow-sm"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Đang gửi...
            </>
          ) : (
            <>
              <Check size={18} /> Xác nhận gửi
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50/50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Đặt lịch MC</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {step === 'form' ? 'Điền thông tin sự kiện của bạn' : 'Kiểm tra lại thông tin trước khi gửi'}
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`flex items-center gap-2 ${step === 'form' ? 'text-amber-600' : 'text-emerald-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 'form' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {step === 'confirm' ? <Check size={14} /> : '1'}
            </div>
            <span className="text-xs font-semibold">Thông tin</span>
          </div>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
          <div className={`flex items-center gap-2 ${step === 'confirm' ? 'text-amber-600' : 'text-zinc-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step === 'confirm' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
            }`}>
              2
            </div>
            <span className="text-xs font-semibold">Xác nhận</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: step === 'confirm' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: step === 'confirm' ? -20 : 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-7"
          >
            {step === 'form' ? formContent : confirmContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
