import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Gift, ChevronRight, Copy, Check, ChevronDown, Sparkles, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { questService } from '../../services/questService';
import { useNavigate } from 'react-router-dom';
import { useQuestGuide } from '../../contexts/QuestGuideContext';
import { Dialog, DialogContent } from '@/components/animate-ui/components/radix/dialog';

const QUEST_IDS = ['profile', 'practice', 'courses', 'leaderboard'];
const QUEST_LINKS = {
  profile: '/m/settings',
  practice: '/m/voice/library',
  courses: '/m/courses',
  leaderboard: '/m/leaderboard',
};

const NewbieQuest = () => {
  const { t } = useTranslation();
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
      <Dialog open={!!voucherCode} onOpenChange={(open) => { if (!open) setVoucherCode(null); }}>
        {voucherCode && (
          <DialogContent
            showCloseButton={false}
            className="bg-white rounded-md p-8 max-w-sm w-full text-center shadow-2xl"
          >
              <div className="w-16 h-16 rounded-md bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-4">
                <Gift size={30} className="text-amber-500" />
              </div>
              <h2 className="text-[20px] font-bold text-gray-900 mb-1">{t('newbieQuest.congratsTitle')}</h2>
              <p className="text-[13px] text-gray-500 mb-5 leading-relaxed">
                {t('newbieQuest.congratsDescPrefix')} <span className="font-semibold text-amber-600">{t('newbieQuest.discountLabel')}</span> {t('newbieQuest.congratsDescSuffix')}
              </p>
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-md px-4 py-3 mb-2">
                <span className="flex-1 font-mono font-bold text-[15px] text-amber-700 tracking-widest">{voucherCode}</span>
                <button
                  onClick={handleCopy}
                  className="w-8 h-8 rounded-md bg-amber-100 hover:bg-amber-200 flex items-center justify-center transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-amber-600" />}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mb-6">{t('newbieQuest.voucherTerms')}</p>
              <button
                onClick={() => { setVoucherCode(null); navigate('/m/payment'); }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[14px] rounded-md transition-colors flex items-center justify-center gap-2"
              >
                {t('newbieQuest.useNow')} <ChevronRight size={16} />
              </button>
              <button
                onClick={() => setVoucherCode(null)}
                className="mt-3 text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                {t('newbieQuest.later')}
              </button>
          </DialogContent>
        )}
      </Dialog>

      {/* Quest Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-md overflow-hidden shadow-sm border border-amber-200/60"
        style={{
          background: '#fef3c7',
        }}
      >
        {/* Header — clickable toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full px-5 pt-4 py-3.5 flex items-center gap-3 text-left group"
        >
          {/* Icon */}
          <div className="w-9 h-9 rounded-md bg-amber-500 flex items-center justify-center shrink-0 shadow-sm shadow-amber-300">
            {allDone
              ? <Trophy size={17} className="text-white" />
              : <Sparkles size={17} className="text-white" />
            }
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">{t('newbieQuest.title')}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-amber-100 border border-amber-300/60 text-[10px] font-bold text-amber-700">
                {doneCount}/{totalQuests}
              </span>
              {allDone && (
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 border border-emerald-300/60 text-[10px] font-bold text-emerald-700">
                  {t('newbieQuest.allDoneBadge')}
                </span>
              )}
            </div>
            <p className="text-[12px] text-amber-700/70 truncate">
              {allDone
                ? t('newbieQuest.claimNowDesc')
                : t('newbieQuest.remainingDesc', { count: totalQuests - doneCount })
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
                    style={{ background: '#f59e0b' }}
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
                {QUEST_IDS.map((qid, i) => {
                  const done = completedQuests.includes(qid);
                  const q = { id: qid, label: t(`newbieQuest.quests.${qid}.label`), desc: t(`newbieQuest.quests.${qid}.desc`), link: QUEST_LINKS[qid] };
                  return (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all ${
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
                    className="w-full py-3 rounded-md font-semibold text-[13px] text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
                    style={{ background: '#f59e0b' }}
                  >
                    <Gift size={15} />
                    {claiming ? t('newbieQuest.claiming') : t('newbieQuest.claimBtn')}
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
