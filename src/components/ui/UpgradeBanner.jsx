import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackUpgradeBannerView, trackUpgradeBannerClick } from '@/utils/analytics';
import { Zap, AlertTriangle, Crown, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * UpgradeBanner — reusable upsell component
 *
 * variant:
 *   "warning"  — amber bar, shown when usage is near limit (>= 80%)
 *   "limit"    — red bar, shown when at/over limit
 *   "inline"   — compact card inside page content (VoiceLibrary, VoicePractice sidebar)
 *   "strip"    — slim sticky strip at top of page
 *
 * Props:
 *   variant, plan, used, limit, onDismiss (optional)
 */

const PLAN_LABELS = { FREE: 'Miễn phí', BASIC: 'Basic', FULL: 'Full', ANNUAL: 'Annual' };
const NEXT_PLAN = { FREE: 'BASIC', BASIC: 'FULL', FULL: 'ANNUAL' };
const NEXT_PLAN_LABEL = { FREE: 'Basic (199k/tháng)', BASIC: 'Full (299k/tháng)', FULL: 'Annual (1.99M/năm)' };

export default function UpgradeBanner({ variant = 'warning', plan = 'FREE', used = 0, limit = 5, onDismiss }) {
    const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 100;
    const remaining = Math.max(0, limit - used);
    const nextPlan = NEXT_PLAN[plan] || 'FULL';
    const nextLabel = NEXT_PLAN_LABEL[plan] || 'Full';

    useEffect(() => {
        trackUpgradeBannerView(pct);
    }, [pct]);

    if (variant === 'strip') {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-[12px] font-medium ${
                        pct >= 100
                            ? 'bg-red-500/[0.08] border-b border-red-500/20 text-red-300'
                            : 'bg-amber-500/[0.08] border-b border-amber-500/20 text-amber-300'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        {pct >= 100
                            ? <AlertTriangle size={13} className="shrink-0" />
                            : <Zap size={13} className="shrink-0 animate-pulse" />
                        }
                        {pct >= 100
                            ? `Bạn đã dùng hết ${limit} lượt AI của gói ${PLAN_LABELS[plan]}.`
                            : `Còn ${remaining} lượt AI — gói ${PLAN_LABELS[plan]} giới hạn ${limit} lượt.`
                        }
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            to="/m/payment"
                            onClick={trackUpgradeBannerClick}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 text-black text-[11px] font-semibold hover:bg-amber-400 transition-colors"
                        >
                            <Crown size={11} /> Nâng cấp {nextLabel}
                        </Link>
                        {onDismiss && (
                            <button onClick={onDismiss} className="text-zinc-500 hover:text-white transition-colors">
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    if (variant === 'inline') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-[#f5a623]/20 bg-[#f5a623]/[0.03] p-5"
            >
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-[#f5a623]/10 border border-[#f5a623]/20 flex items-center justify-center shrink-0">
                        <Crown size={16} className="text-[#f5a623]" />
                    </div>
                    <div>
                        <p className="text-[13px] font-semibold text-white mb-0.5">Nâng cấp để luyện tập không giới hạn</p>
                        <p className="text-[11px] text-zinc-500">Gói {PLAN_LABELS[plan]}: còn {remaining}/{limit} lượt AI</p>
                    </div>
                </div>

                {/* Usage bar */}
                <div className="mb-4">
                    <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all"
                            style={{
                                width: `${pct}%`,
                                backgroundColor: pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#f5a623',
                            }}
                        />
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-zinc-600">{used} đã dùng</span>
                        <span className={`text-[10px] font-semibold ${pct >= 100 ? 'text-red-400' : 'text-[#f5a623]'}`}>{limit} tổng</span>
                    </div>
                </div>

                {/* Benefits of next plan */}
                <div className="space-y-1.5 mb-4">
                    {nextPlan === 'BASIC' && [
                        '20 lượt phân tích AI/tháng',
                        'Tất cả danh mục bài học',
                        'Báo cáo chi tiết',
                    ].map((b, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-400">
                            <span className="w-1 h-1 rounded-full bg-[#f5a623]/60 shrink-0" />
                            {b}
                        </div>
                    ))}
                    {nextPlan === 'FULL' && [
                        'AI không giới hạn',
                        'Tất cả khóa học cao cấp',
                        'Coaching AI cá nhân',
                    ].map((b, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-400">
                            <span className="w-1 h-1 rounded-full bg-[#f5a623]/60 shrink-0" />
                            {b}
                        </div>
                    ))}
                    {nextPlan === 'ANNUAL' && [
                        'Tiết kiệm 44% so với tháng',
                        'Ưu tiên hỗ trợ',
                        'Tính năng beta sớm nhất',
                    ].map((b, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-400">
                            <span className="w-1 h-1 rounded-full bg-[#f5a623]/60 shrink-0" />
                            {b}
                        </div>
                    ))}
                </div>

                <Link
                    to="/m/payment"
                    onClick={trackUpgradeBannerClick}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-amber-400 transition-colors"
                >
                    <Crown size={13} /> Nâng cấp lên {nextLabel} <ArrowRight size={13} />
                </Link>
            </motion.div>
        );
    }

    if (variant === 'warning' || variant === 'limit') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
                    variant === 'limit'
                        ? 'border-red-500/20 bg-red-500/[0.04]'
                        : 'border-amber-500/20 bg-amber-500/[0.04]'
                }`}
            >
                <div className="flex items-start gap-3 flex-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        variant === 'limit' ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'
                    }`}>
                        {variant === 'limit'
                            ? <AlertTriangle size={15} className="text-red-400" />
                            : <Zap size={15} className="text-amber-400 animate-pulse" />
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-[13px] font-semibold mb-0.5 ${variant === 'limit' ? 'text-red-300' : 'text-amber-300'}`}>
                            {variant === 'limit'
                                ? `Đã hết ${limit} lượt AI của gói ${PLAN_LABELS[plan]}`
                                : `Sắp hết lượt AI — còn ${remaining}/${limit} lượt`
                            }
                        </p>
                        <p className="text-[11px] text-zinc-500">
                            {variant === 'limit'
                                ? 'Nâng cấp để tiếp tục phân tích giọng nói với AI.'
                                : `Mỗi buổi luyện tập dùng 1 lượt. Nâng cấp để không bị gián đoạn.`
                            }
                        </p>
                        {/* Mini usage bar */}
                        <div className="mt-2 h-1 w-full max-w-[200px] bg-white/[0.05] rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: `${pct}%`,
                                    backgroundColor: variant === 'limit' ? '#ef4444' : '#f59e0b',
                                }}
                            />
                        </div>
                    </div>
                </div>
                <Link
                    to="/m/payment"
                    onClick={trackUpgradeBannerClick}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f5a623] text-black text-[12px] font-semibold hover:bg-amber-400 transition-colors shrink-0 whitespace-nowrap"
                >
                    <Crown size={12} /> Nâng cấp ngay
                </Link>
            </motion.div>
        );
    }

    return null;
}
