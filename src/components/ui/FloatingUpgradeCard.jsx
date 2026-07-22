import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Crown, X, Sparkles, Zap, Star, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const NEXT_PLAN = { FREE: 'BASIC', BASIC: 'FULL', FULL: 'ANNUAL' };

const NEXT_PLAN_PRICES = {
  FREE: '199.000đ/tháng',
  BASIC: '299.000đ/tháng',
  FULL: '1.990.000đ/năm',
};

const UPSELL_CARDS_META = {
  FREE: [
    { icon: Zap, accent: '#f5a623' },
    { icon: Star, accent: '#a78bfa' },
    { icon: Sparkles, accent: '#34d399' },
  ],
  BASIC: [
    { icon: Crown, accent: '#f5a623' },
    { icon: Sparkles, accent: '#60a5fa' },
  ],
  FULL: [
    { icon: Crown, accent: '#f5a623' },
  ],
};

const SESSION_KEY = 'floating_upgrade_dismissed';

export default function FloatingUpgradeCard({ plan = 'FREE' }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);

  const PLAN_LABELS = { FREE: t('floatingUpgradeCard.planFree'), BASIC: 'Basic', FULL: 'Full', ANNUAL: 'Annual' };
  const planKey = (plan || 'FREE').toLowerCase();
  const cards = (UPSELL_CARDS_META[plan] || []).map((m, i) => ({
    ...m,
    tag: t(`floatingUpgradeCard.cards.${planKey}.${i}.tag`),
    title: t(`floatingUpgradeCard.cards.${planKey}.${i}.title`),
    desc: t(`floatingUpgradeCard.cards.${planKey}.${i}.desc`),
    cta: t(`floatingUpgradeCard.cards.${planKey}.${i}.cta`),
  }));

  useEffect(() => {
    if (!cards.length) return;
    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (dismissed) return;
    // Show after 8s delay
    const t = setTimeout(() => setVisible(true), 8000);
    return () => clearTimeout(t);
  }, [cards.length]);

  // Auto-rotate card every 12s
  useEffect(() => {
    if (!visible || cards.length <= 1) return;
    const t = setInterval(() => {
      setCardIdx(i => (i + 1) % cards.length);
    }, 12000);
    return () => clearInterval(t);
  }, [visible, cards.length]);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, '1');
  };

  if (!cards.length) return null;

  const card = cards[cardIdx];
  const Icon = card.icon;
  const nextPlan = NEXT_PLAN[plan];
  const price = NEXT_PLAN_PRICES[plan];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="floating-upgrade"
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.95 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-[200] w-[290px] select-none"
          style={{ filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.5))' }}
        >
          <div className="relative bg-[#111113] border border-white/[0.10] overflow-hidden">
            {/* Accent glow top */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: card.accent }}
            />

            {/* Header */}
            <div className="flex items-start justify-between px-4 pt-4 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 flex items-center justify-center shrink-0"
                  style={{ background: `${card.accent}18`, border: `1px solid ${card.accent}30` }}
                >
                  <Icon size={15} style={{ color: card.accent }} />
                </div>
                <div>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: card.accent }}
                  >
                    {card.tag}
                  </span>
                  <p className="text-[12px] font-semibold text-white leading-tight mt-0.5">
                    {card.title}
                  </p>
                </div>
              </div>
              <button
                onClick={dismiss}
                className="text-zinc-500 hover:text-zinc-300 transition-colors ml-2 mt-0.5 shrink-0"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="px-4 pb-4">
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                {card.desc}
              </p>

              {/* Price tag */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    {PLAN_LABELS[nextPlan] || nextPlan}
                  </span>
                  <span className="text-[10px] text-zinc-500">·</span>
                  <span className="text-[11px] font-semibold" style={{ color: card.accent }}>
                    {price}
                  </span>
                </div>
                {cards.length > 1 && (
                  <div className="flex gap-1">
                    {cards.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCardIdx(i)}
                        className="w-1.5 h-1.5 transition-colors"
                        style={{
                          background: i === cardIdx ? card.accent : 'rgba(255,255,255,0.15)',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* CTA */}
              <Link
                to="/m/payment"
                onClick={dismiss}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-[12px] font-semibold transition-all"
                style={{
                  background: card.accent,
                  color: '#000',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <Crown size={12} />
                {card.cta}
                <ArrowRight size={12} />
              </Link>

              {/* Dismiss link */}
              <button
                onClick={dismiss}
                className="w-full text-center text-[10px] text-zinc-500 hover:text-zinc-400 transition-colors mt-2"
              >
                {t('floatingUpgradeCard.later')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
