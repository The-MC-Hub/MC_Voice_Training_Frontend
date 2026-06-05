import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Crown, X, Sparkles, Zap, Star, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PLAN_LABELS = { FREE: 'Miễn phí', BASIC: 'Basic', FULL: 'Full', ANNUAL: 'Annual' };
const NEXT_PLAN = { FREE: 'BASIC', BASIC: 'FULL', FULL: 'ANNUAL' };

const NEXT_PLAN_PRICES = {
  FREE: '199.000đ/tháng',
  BASIC: '299.000đ/tháng',
  FULL: '1.990.000đ/năm',
};

const UPSELL_CARDS = {
  FREE: [
    {
      icon: Zap,
      accent: '#f5a623',
      tag: 'Phổ biến nhất',
      title: 'Phân tích AI không giới hạn',
      desc: 'Gói FREE chỉ có 5 lượt/tháng. Basic cho bạn 20 lượt + báo cáo chi tiết.',
      cta: 'Nâng lên Basic',
    },
    {
      icon: Star,
      accent: '#a78bfa',
      tag: 'Học nhanh hơn 3×',
      title: 'Mở toàn bộ 50+ bài học',
      desc: 'Free lock nhiều bài nâng cao. Nâng cấp để học đầy đủ lộ trình MC chuyên nghiệp.',
      cta: 'Xem gói Basic',
    },
    {
      icon: Sparkles,
      accent: '#34d399',
      tag: 'Mới',
      title: 'Script AI cá nhân hoá',
      desc: 'AI viết kịch bản MC theo phong cách riêng của bạn. Chỉ có từ gói Basic trở lên.',
      cta: 'Thử ngay',
    },
  ],
  BASIC: [
    {
      icon: Crown,
      accent: '#f5a623',
      tag: 'Nâng cấp cao nhất',
      title: 'AI không giới hạn + Coaching cá nhân',
      desc: 'Full plan: phân tích AI vô hạn, khóa học cao cấp, coaching 1-1 với AI.',
      cta: 'Nâng lên Full',
    },
    {
      icon: Sparkles,
      accent: '#60a5fa',
      tag: 'Tiết kiệm 44%',
      title: 'Annual — chỉ 166k/tháng',
      desc: 'Trả 1 năm, tiết kiệm gần 1 triệu so với trả tháng. Unlock toàn bộ tính năng.',
      cta: 'Xem Annual',
    },
  ],
  FULL: [
    {
      icon: Crown,
      accent: '#f5a623',
      tag: 'Tiết kiệm 44%',
      title: 'Chuyển sang Annual',
      desc: 'Trả 1 năm chỉ 1.990.000đ — tiết kiệm 980.000đ so với trả tháng.',
      cta: 'Nâng lên Annual',
    },
  ],
};

const SESSION_KEY = 'floating_upgrade_dismissed';

export default function FloatingUpgradeCard({ plan = 'FREE' }) {
  const [visible, setVisible] = useState(false);
  const [cardIdx, setCardIdx] = useState(0);

  const cards = UPSELL_CARDS[plan] || [];

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
              style={{ background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)` }}
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
                className="text-zinc-600 hover:text-zinc-300 transition-colors ml-2 mt-0.5 shrink-0"
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
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
                    {PLAN_LABELS[nextPlan] || nextPlan}
                  </span>
                  <span className="text-[10px] text-zinc-600">·</span>
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
                className="w-full text-center text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors mt-2"
              >
                Để sau
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
