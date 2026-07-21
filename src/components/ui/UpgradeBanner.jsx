import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trackUpgradeBannerView, trackUpgradeBannerClick } from '@/utils/analytics';
import { Zap, AlertTriangle, Crown, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

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

const NEXT_PLAN = { FREE: 'BASIC', BASIC: 'FULL', FULL: 'ANNUAL' };

export default function UpgradeBanner({ variant = 'warning', plan = 'FREE', used = 0, limit = 5, onDismiss }) {
    const { t } = useTranslation();
    const PLAN_LABELS = t('upgradeBanner.planLabels', { returnObjects: true });
    const planLabelFor = (p) => PLAN_LABELS[(p || '').toLowerCase()] || p;
    const NEXT_PLAN_LABEL = t('upgradeBanner.nextPlanLabels', { returnObjects: true });
    const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 100;
    const remaining = Math.max(0, limit - used);
    const nextPlan = NEXT_PLAN[plan] || 'FULL';
    const nextLabel = NEXT_PLAN_LABEL[(plan || '').toLowerCase()] || 'Full';

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
                            ? t('upgradeBanner.stripLimitReached', { limit, plan: planLabelFor(plan) })
                            : t('upgradeBanner.stripRemaining', { remaining, plan: planLabelFor(plan), limit })
                        }
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            to="/m/payment"
                            onClick={trackUpgradeBannerClick}
                            className="flex items-center gap-1 px-3 py-1 rounded-md bg-amber-500 text-black text-[11px] font-semibold hover:bg-amber-400 transition-colors"
                        >
                            <Crown size={11} /> {t('upgradeBanner.upgradeToLabel', { label: nextLabel })}
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
                className="rounded-md border border-[#f5a623]/20 bg-[#f5a623]/[0.03] p-5"
            >
                <div className="flex items-start gap-3 mb-4">
                    <div className="w-9 h-9 rounded-md bg-[#f5a623]/10 border border-[#f5a623]/20 flex items-center justify-center shrink-0">
                        <Crown size={16} className="text-[#f5a623]" />
                    </div>
                    <div>
                        <p className="text-[13px] font-semibold text-white mb-0.5">{t('upgradeBanner.inlineTitle')}</p>
                        <p className="text-[11px] text-zinc-500">{t('upgradeBanner.inlineUsage', { plan: planLabelFor(plan), remaining, limit })}</p>
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
                        <span className="text-[10px] text-zinc-600">{t('upgradeBanner.usedLabel', { count: used })}</span>
                        <span className={`text-[10px] font-semibold ${pct >= 100 ? 'text-red-400' : 'text-[#f5a623]'}`}>{t('upgradeBanner.totalLabel', { count: limit })}</span>
                    </div>
                </div>

                {/* Benefits of next plan */}
                <div className="space-y-1.5 mb-4">
                    {nextPlan === 'BASIC' && t('upgradeBanner.benefitsBasic', { returnObjects: true }).map((b, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-400">
                            <span className="w-1 h-1 rounded-full bg-[#f5a623]/60 shrink-0" />
                            {b}
                        </div>
                    ))}
                    {nextPlan === 'FULL' && t('upgradeBanner.benefitsFull', { returnObjects: true }).map((b, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-400">
                            <span className="w-1 h-1 rounded-full bg-[#f5a623]/60 shrink-0" />
                            {b}
                        </div>
                    ))}
                    {nextPlan === 'ANNUAL' && t('upgradeBanner.benefitsAnnual', { returnObjects: true }).map((b, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-400">
                            <span className="w-1 h-1 rounded-full bg-[#f5a623]/60 shrink-0" />
                            {b}
                        </div>
                    ))}
                </div>

                <Link
                    to="/m/payment"
                    onClick={trackUpgradeBannerClick}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-[#f5a623] text-black text-[13px] font-semibold hover:bg-amber-400 transition-colors"
                >
                    <Crown size={13} /> {t('upgradeBanner.upgradeToLabelLong', { label: nextLabel })} <ArrowRight size={13} />
                </Link>
            </motion.div>
        );
    }

    if (variant === 'warning' || variant === 'limit') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-md border p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
                    variant === 'limit'
                        ? 'border-red-500/20 bg-red-500/[0.04]'
                        : 'border-amber-500/20 bg-amber-500/[0.04]'
                }`}
            >
                <div className="flex items-start gap-3 flex-1">
                    <div className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
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
                                ? t('upgradeBanner.limitReachedTitle', { limit, plan: planLabelFor(plan) })
                                : t('upgradeBanner.warningTitle', { remaining, limit })
                            }
                        </p>
                        <p className="text-[11px] text-zinc-500">
                            {variant === 'limit'
                                ? t('upgradeBanner.limitReachedDesc')
                                : t('upgradeBanner.warningDesc')
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#f5a623] text-black text-[12px] font-semibold hover:bg-amber-400 transition-colors shrink-0 whitespace-nowrap"
                >
                    <Crown size={12} /> {t('upgradeBanner.upgradeNow')}
                </Link>
            </motion.div>
        );
    }

    return null;
}
