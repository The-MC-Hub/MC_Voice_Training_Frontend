import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Gift, ChevronRight, Copy, Check, ChevronDown, Sparkles, Trophy } from 'lucide-react';
import { questService } from '../../services/questService';
import { useNavigate } from 'react-router-dom';
import { useQuestGuide } from '../../contexts/QuestGuideContext';

const QUEST_META = [
  { id: 'profile',      label: 'Hoàn thiện hồ sơ',    desc: 'Điền đầy đủ tên và ảnh đại diện',     link: '/m/settings',     cta: 'Cập nhật hồ sơ' },
  { id: 'practice',    label: 'Luyện tập đầu tiên',   desc: 'Hoàn thành 1 bài AI coaching',         link: '/m/voice/library', cta: 'Bắt đầu luyện tập' },
  { id: 'courses',     label: 'Khám phá khóa học',    desc: 'Ghé thăm trang Khóa học',              link: '/m/courses',       cta: 'Xem khóa học' },
{ id: 'leaderboard', label: 'Xem bảng xếp hạng',   desc: 'Ghé thăm trang Xếp hạng',              link: '/m/leaderboard',   cta: 'Xem bảng xếp hạng' },
];

const NewbieQuest = () => {
  const navigate = useNavigate();
  const { startGuide } = useQuestGuide();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [voucherCode, setVoucherCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await questService.getProgress();
      setProgress(res.data?.data);
    } catch {
      // non-critical widget
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await questService.claimVoucher();
      setVoucherCode(res.data?.data?.code);
      setProgress(p => ({ ...p, voucherClaimed: true }));
    } catch {
      // already claimed or not eligible
    } finally {
      setClaiming(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !progress) return null;
  if (progress.voucherClaimed && !voucherCode) return null;

  const { completedQuests = [], doneCount = 0, totalQuests = 4 } = progress;
  const pct = Math.round((doneCount / totalQuests) * 100);
  const allDone = doneCount === totalQuests;

  return (
    <>
      {/* Voucher Modal */}
      <AnimatePresence>
        {voucherCode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            onClick={() => setVoucherCode(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', damping: 18, stiffness: 280 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-4">
                <Gift size={30} className="text-amber-500" />
              </div>
              <h2 className="text-[20px] font-bold text-gray-900 mb-1">Chúc mừng Tân binh!</h2>
              <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
                Bạn đã hoàn thành tất cả nhiệm vụ. Đây là voucher <span className="font-semibold text-amber-600">giảm 50%</span> gói Basic dành riêng cho bạn.
              </p>
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-2">
                <span className="flex-1 font-mono font-bold text-[15px] text-amber-700 tracking-widest">{voucherCode}</span>
                <button
                  onClick={handleCopy}
                  className="w-8 h-8 rounded-lg bg-amber-100 hover:bg-amber-200 flex items-center justify-center transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-amber-600" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mb-6">Hiệu lực 30 ngày · Chỉ dùng 1 lần · Áp dụng cho gói Basic</p>
              <button
                onClick={() => { setVoucherCode(null); navigate('/m/payment'); }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[14px] rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                Dùng ngay <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setVoucherCode(null)}
                className="mt-3 text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                Để sau
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quest Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl overflow-hidden shadow-sm border border-amber-200/60"
        style={{
          background: 'linear-gradient(135deg, #fffbeb 0%, #fff7e6 50%, #fef3c7 100%)',
        }}
      >
        {/* Header — clickable toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full px-5 pt-4 py-3.5 flex items-center gap-3 text-left group"
        >
          {/* Icon */}
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-sm shadow-amber-300">
            {allDone
              ? <Trophy size={17} className="text-white" />
              : <Sparkles size={17} className="text-white" />
            }
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">Nhiệm vụ tân binh</span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-100 border border-amber-300/60 text-[10px] font-bold text-amber-700">
                {doneCount}/{totalQuests}
              </span>
              {allDone && (
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 border border-emerald-300/60 text-[10px] font-bold text-emerald-700">
                  Hoàn thành ✓
                </span>
              )}
            </div>
            <p className="text-[12px] text-amber-700/70 truncate">
              {allDone
                ? 'Nhận voucher -50% gói Basic ngay!'
                : `Còn ${totalQuests - doneCount} nhiệm vụ · Nhận voucher -50% gói Basic`
              }
            </p>
          </div>

          {/* Progress ring + chevron */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Mini circular progress */}
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="none" stroke="#fde68a" strokeWidth="3" />
              <circle
                cx="16" cy="16" r="12"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 12}`}
                strokeDashoffset={`${2 * Math.PI * 12 * (1 - pct / 100)}`}
                transform="rotate(-90 16 16)"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
              <text x="16" y="20" textAnchor="middle" fontSize="9" fontWeight="700" fill="#92400e">
                {pct}%
              </text>
            </svg>

            <motion.div
              animate={{ rotate: collapsed ? 0 : 180 }}
              transition={{ duration: 0.25 }}
            >
              <ChevronDown size={16} className="text-amber-600 group-hover:text-amber-800 transition-colors" />
            </motion.div>
          </div>
        </button>

        {/* Collapsible body */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="quest-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              {/* Progress bar */}
              <div className="px-5 pb-2">
                <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="mx-5 border-t border-amber-200/60 mb-1" />

              {/* Quest list */}
              <div className="px-4 py-2 space-y-0.5">
                {QUEST_META.map((q, i) => {
                  const done = completedQuests.includes(q.id);
                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        done
                          ? 'opacity-60'
                          : 'hover:bg-amber-100/60 cursor-pointer active:scale-[0.99]'
                      }`}
                      onClick={() => !done && startGuide(q.id)}
                    >
                      {done ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                          <Check size={11} className="text-white" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-amber-300 bg-white shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-medium leading-snug ${done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {q.label}
                        </p>
                        {!done && <p className="text-[11px] text-amber-700/60">{q.desc}</p>}
                      </div>

                      {!done && (
                        <ChevronRight size={14} className="text-amber-400 shrink-0" />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Claim button */}
              {allDone && !progress.voucherClaimed && (
                <div className="px-5 pb-4 pt-2">
                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleClaim}
                    disabled={claiming}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-semibold text-[13px] text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}
                  >
                    <Gift size={15} />
                    {claiming ? 'Đang nhận...' : 'Nhận voucher -50% ngay'}
                  </motion.button>
                </div>
              )}

              {/* Bottom padding when no button */}
              {!(allDone && !progress.voucherClaimed) && <div className="pb-3" />}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default NewbieQuest;
