import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles, Check, ShieldCheck, CreditCard, Award, AlertCircle,
  ArrowLeft, Zap, BookOpen, Globe, Lock, CheckCircle2, X, Mic,
  BarChart3, Clock, Star, TrendingUp, Users, Infinity, Crown,
  ChevronDown, ChevronUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/ui/Toast";
import Breadcrumb from '../components/ui/Breadcrumb';

// Plan hierarchy order
const PLAN_ORDER = { FREE: 0, BASIC: 1, FULL: 2, ANNUAL: 3 };

// Visual config per plan key (not stored in DB)
const PLAN_VISUAL = {
  BASIC:  { accentColor: "#f5a623", borderSelected: "border-amber-400", shadow: "shadow-[0_0_28px_rgba(245,158,11,0.18)]", badgeColor: "bg-amber-50 border-amber-300 text-amber-700", period: "/tháng", highlight: [Mic, Zap, BookOpen, BarChart3] },
  FULL:   { accentColor: "#3b82f6", borderSelected: "border-blue-400",  shadow: "shadow-[0_0_28px_rgba(59,130,246,0.15)]",  badgeColor: "bg-blue-50 border-blue-200 text-blue-700",   period: "/tháng", highlight: [Infinity, Globe, TrendingUp, BarChart3] },
  ANNUAL: { accentColor: "#a855f7", borderSelected: "border-purple-400",shadow: "shadow-[0_0_28px_rgba(168,85,247,0.15)]",  badgeColor: "bg-purple-50 border-purple-200 text-purple-700", period: "/năm",   highlight: [Crown, Award, Users, Star] },
};

function formatPrice(vnd) {
  return vnd.toLocaleString("vi-VN") + "đ";
}

// Transform API PlanDefinition → local PLANS shape
function adaptPlans(apiPlans) {
  return apiPlans
    .filter(p => p.plan !== "FREE")
    .map(p => {
      const v = PLAN_VISUAL[p.plan] || PLAN_VISUAL.BASIC;
      const icons = v.highlight;
      return {
        key: p.plan,
        name: p.displayName,
        price: formatPrice(p.priceVnd),
        priceNum: p.priceVnd,
        originalPrice: p.discountedPriceVnd > 0 ? formatPrice(p.priceVnd) : null,
        discountedPrice: p.discountedPriceVnd > 0 ? formatPrice(p.discountedPriceVnd) : null,
        discountedPriceNum: p.discountedPriceVnd > 0 ? p.discountedPriceVnd : null,
        discountPercent: p.discountPercent > 0 ? p.discountPercent : null,
        period: v.period,
        badge: p.badge,
        badgeColor: v.badgeColor,
        accentColor: v.accentColor,
        borderSelected: v.borderSelected,
        shadow: v.shadow,
        tagline: p.tagline,
        description: p.description,
        highlight: (p.highlights || []).map((text, i) => ({ icon: icons[i % icons.length], text })),
        social: p.socialProof,
        urgency: p.urgencyText,
      };
    });
}

// Comparison table data
const COMPARISON_ROWS = [
  { feature: "Bài luyện tập", FREE: "Xem trước", BASIC: "50 bài", FULL: "50 bài", ANNUAL: "50 bài + ưu tiên mới" },
  { feature: "Chủ đề MC", FREE: "—", BASIC: "MC Đám cưới", FULL: "3 chủ đề", ANNUAL: "3 chủ đề + Beta" },
  { feature: "AI coaching/tháng", FREE: "5 lượt", BASIC: "20 lượt", FULL: "Không giới hạn", ANNUAL: "Không giới hạn" },
  { feature: "Phân tích giọng (Clarity, Energy, Pace)", FREE: "❌", BASIC: "✓ Cơ bản", FULL: "✓ Chi tiết", ANNUAL: "✓ Chi tiết" },
  { feature: "WER · CER · Jitter · HNR", FREE: "❌", BASIC: "❌", FULL: "✓", ANNUAL: "✓" },
  { feature: "Biểu đồ tiến độ & lịch sử", FREE: "❌", BASIC: "❌", FULL: "✓", ANNUAL: "✓" },
  { feature: "Trắc nghiệm lý thuyết", FREE: "❌", BASIC: "✓", FULL: "✓", ANNUAL: "✓" },
  { feature: "Huy hiệu Annual Elite", FREE: "❌", BASIC: "❌", FULL: "❌", ANNUAL: "✓" },
  { feature: "Ưu tiên hỗ trợ 24/7", FREE: "❌", BASIC: "❌", FULL: "❌", ANNUAL: "✓" },
  { feature: "Truy cập tính năng Beta", FREE: "❌", BASIC: "❌", FULL: "❌", ANNUAL: "✓" },
];

const IS_DEV = import.meta.env.VITE_DEV_MODE === 'true';

// Auto-select the next plan above user's current plan
function getDefaultPlan(userPlan) {
  const current = PLAN_ORDER[userPlan?.toUpperCase()] ?? 0;
  if (current === 0) return "BASIC";      // FREE → BASIC
  if (current === 1) return "FULL";       // BASIC → FULL
  if (current === 2) return "ANNUAL";     // FULL → ANNUAL
  return "ANNUAL";
}

const PaymentPage = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(() => getDefaultPlan(user?.plan));
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountInfo, setDiscountInfo] = useState(null);
  const [discountError, setDiscountError] = useState(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const pollRef = useRef(null);

  // Fetch plans from API
  useEffect(() => {
    api.get("/payment/plans")
      .then(res => {
        const adapted = adaptPlans(res.data?.data || []);
        setPlans(adapted);
      })
      .catch(() => {/* keep empty, UI shows nothing */})
      .finally(() => setPlansLoading(false));
  }, []);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setApplyingDiscount(true);
    setDiscountError(null);
    setDiscountInfo(null);
    try {
      const res = await api.post(`/payment/apply-discount?code=${encodeURIComponent(discountCode.trim())}&plan=${selectedPlan}`);
      setDiscountInfo(res.data?.data);
    } catch (e) {
      setDiscountError(e.response?.data?.message || "Mã không hợp lệ");
    } finally {
      setApplyingDiscount(false);
    }
  };

  const fetchOrder = async (plan = selectedPlan) => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    setOrderData(null);
    try {
      const res = await api.post(`/payment/create-order?userId=${user.id}&plan=${plan}`);
      setOrderData(res.data.data);
    } catch {
      setError("Không thể tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id && !user?.isPremium) fetchOrder(selectedPlan);
  }, [user?.id]);

  useEffect(() => {
    if (!orderData || success || user?.isPremium) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/payment/status/${user.id}`);
        const statusData = res.data?.data;
        if (statusData?.isPremium) {
          clearInterval(pollRef.current);
          updateUser({ isPremium: true, plan: statusData.plan, aiSessionsUsed: 0, planExpiresAt: statusData.planExpiresAt });
          await refreshUser();
          setSuccess(true);
          toast.showSuccess("Thanh toán thành công! Tài khoản đã được nâng cấp.");
          setTimeout(() => navigate("/m/dashboard"), 2500);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [orderData, success, user?.isPremium]);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const simRes = await api.post(`/payment/simulate-success?userId=${user.id}&plan=${selectedPlan}`);
      const simData = simRes.data?.data;
      updateUser({ isPremium: true, plan: simData?.plan || selectedPlan, aiSessionsUsed: 0, planExpiresAt: simData?.planExpiresAt });
      await refreshUser();
      setSuccess(true);
      toast.showSuccess("Kích hoạt thành công!");
      setTimeout(() => navigate("/m/dashboard"), 2500);
    } catch {
      toast.showError("Simulation failed");
    } finally {
      setSimulating(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-emerald-200 rounded-2xl p-12 text-center space-y-5 max-w-md w-full shadow-lg">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 14, stiffness: 260 }}
            className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto"
          >
            <ShieldCheck size={32} className="text-emerald-500" />
          </motion.div>
          <h2 className="text-xl font-bold text-gray-900">Kích hoạt thành công!</h2>
          <p className="text-gray-500 text-[13px] leading-relaxed">
            Chào mừng đến với <span className="text-gold font-semibold">MC Hub Premium</span>. Đang chuyển hướng...
          </p>
        </div>
      </div>
    );
  }

  const currentPlanOrder = PLAN_ORDER[(user?.plan || "FREE").toUpperCase()] ?? 0;
  const selectedPlanData = plans.find(p => p.key === selectedPlan);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        <Breadcrumb items={[{ label: 'Bảng giá' }]} />

        {/* Back + Header */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors text-[13px] mb-6 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Quay lại
          </button>
          <h1 className="text-[28px] font-bold text-gray-900 mb-1 tracking-tight">Chọn gói phù hợp với bạn</h1>
          <p className="text-gray-400 text-[14px]">
            {currentPlanOrder === 0
              ? "Bắt đầu luyện tập nghiêm túc — MC chuyên nghiệp không để giọng tự phát triển."
              : `Bạn đang dùng gói ${user?.plan}. Nâng cấp để mở khoá toàn bộ tiềm năng.`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

          {/* Left: Plan cards */}
          <div className="space-y-3">

            {/* FREE indicator — only if user is free */}
            {currentPlanOrder === 0 && (
              <div className="w-full text-left p-5 rounded-2xl border border-gray-200 bg-white opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[14px] font-bold text-gray-500">Free</span>
                      <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-gray-100 border-gray-300 text-gray-500">
                        Gói hiện tại
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-400">5 lượt AI · Không có coaching · Không theo dõi tiến độ</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-400">0đ</p>
                    <p className="text-[11px] text-gray-400">{user?.aiSessionsUsed ?? 0}/5 lượt đã dùng</p>
                  </div>
                </div>
              </div>
            )}

            {plansLoading ? (
              [1,2,3].map(i => (
                <div key={i} className="w-full p-5 rounded-2xl border border-gray-200 bg-white animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-48 bg-gray-100 rounded" />
                    </div>
                    <div className="h-6 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
              ))
            ) : plans.map((plan) => {
              const isSelected = selectedPlan === plan.key;
              const isCurrentPlan = (user?.plan || "FREE").toUpperCase() === plan.key;
              const isDowngrade = PLAN_ORDER[plan.key] < currentPlanOrder;

              return (
                <motion.button
                  key={plan.key}
                  onClick={() => {
                    if (isCurrentPlan || isDowngrade) return;
                    setSelectedPlan(plan.key);
                    fetchOrder(plan.key);
                  }}
                  whileHover={!isCurrentPlan && !isDowngrade ? { y: -1 } : {}}
                  transition={{ duration: 0.15 }}
                  className={`w-full text-left rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isCurrentPlan
                      ? 'border-zinc-300 bg-zinc-50 cursor-default opacity-70'
                      : isDowngrade
                      ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-40'
                      : isSelected
                      ? `${plan.borderSelected} bg-white ${plan.shadow}`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Selected accent bar */}
                  {isSelected && !isCurrentPlan && (
                    <div className="h-0.75 w-full" style={{ background: plan.accentColor }} />
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">

                        {/* Name + badge */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[16px] font-bold ${isCurrentPlan ? 'text-gray-500' : 'text-gray-900'}`}>
                            {plan.name}
                          </span>
                          {isCurrentPlan ? (
                            <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 border-emerald-300 text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 size={9} /> Gói hiện tại
                            </span>
                          ) : plan.badge && (
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${plan.badgeColor}`}>
                              {plan.badge}
                            </span>
                          )}
                        </div>

                        {/* Tagline */}
                        {!isCurrentPlan && !isDowngrade && (
                          <p className="text-[12px] font-medium mb-2" style={{ color: isSelected ? plan.accentColor : '#6b7280' }}>
                            {plan.tagline}
                          </p>
                        )}

                        {/* Price */}
                        <div className="mb-3">
                          {plan.discountPercent && !isCurrentPlan ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[12px] text-gray-400 line-through">{plan.originalPrice}</span>
                                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white">-{plan.discountPercent}%</span>
                              </div>
                              <div className="flex items-baseline gap-1.5">
                                <span className={`text-2xl font-bold ${isSelected ? 'text-gray-900' : 'text-gray-800'}`} style={{ color: isSelected ? plan.accentColor : undefined }}>
                                  {plan.discountedPrice}
                                </span>
                                <span className="text-[12px] text-gray-400">{plan.period}</span>
                                {plan.urgency && isSelected && (
                                  <span className="text-[11px] font-semibold ml-1" style={{ color: plan.accentColor }}>· {plan.urgency}</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-1.5">
                              <span className={`text-2xl font-bold ${isCurrentPlan ? 'text-gray-400' : isSelected ? 'text-gray-900' : 'text-gray-800'}`}>
                                {plan.price}
                              </span>
                              <span className="text-[12px] text-gray-400">{plan.period}</span>
                              {plan.urgency && isSelected && (
                                <span className="text-[11px] font-semibold ml-1" style={{ color: plan.accentColor }}>· {plan.urgency}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Features grid */}
                        <div className="grid grid-cols-2 gap-1.5">
                          {plan.highlight.map(({ icon: Icon, text }, i) => (
                            <div key={i} className={`flex items-center gap-1.5 ${isCurrentPlan || isDowngrade ? 'text-gray-400' : 'text-gray-600'}`}>
                              <Icon size={11} className="shrink-0" style={{ color: isSelected && !isCurrentPlan ? plan.accentColor : undefined }} />
                              <span className="text-[11px] leading-snug">{text}</span>
                            </div>
                          ))}
                        </div>

                        {/* Social proof */}
                        {isSelected && !isCurrentPlan && (
                          <motion.p
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[11px] mt-3 pt-2.5 border-t border-gray-100 text-gray-400"
                          >
                            👥 {plan.social}
                          </motion.p>
                        )}

                        {/* Usage bar for current plan */}
                        {isCurrentPlan && user?.plan !== "FREE" && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            {(() => {
                              const limit = user?.plan === 'BASIC' ? 20 : null;
                              const used = user?.aiSessionsUsed ?? 0;
                              if (!limit) return <p className="text-[11px] text-gray-400">Không giới hạn lượt AI</p>;
                              return <>
                                <div className="flex justify-between mb-1">
                                  <span className="text-[11px] text-gray-500">Lượt AI đã dùng</span>
                                  <span className={`text-[11px] font-semibold ${used >= limit ? 'text-red-500' : 'text-gray-600'}`}>{used}/{limit}</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                  <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${Math.min(100, (used / limit) * 100)}%` }} />
                                </div>
                              </>;
                            })()}
                          </div>
                        )}
                      </div>

                      {/* Radio indicator */}
                      <div className="shrink-0 mt-0.5">
                        {isCurrentPlan ? (
                          <CheckCircle2 size={18} className="text-emerald-500" />
                        ) : isDowngrade ? (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'border-[--accent] bg-[--accent]' : 'border-gray-300'
                          }`}
                          style={{ '--accent': plan.accentColor }}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}

            {/* Trust signals */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 px-1">
              {[
                { icon: Lock, text: "Thanh toán bảo mật SSL" },
                { icon: Zap, text: "Kích hoạt tức thì" },
                { icon: CheckCircle2, text: "Hoàn tiền 7 ngày nếu không hài lòng" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-1.5 text-gray-400">
                  <Icon size={10} />
                  <span className="text-[11px]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Payment panel */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden sticky top-20">

            {/* Selected plan summary header */}
            {selectedPlanData && (
              <div className="px-6 pt-5 pb-4 border-b border-gray-100">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Gói đang chọn</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[16px] font-bold text-gray-900">{selectedPlanData.name}</p>
                    <p className="text-[12px] text-gray-400 mt-0.5 leading-relaxed max-w-55">{selectedPlanData.description}</p>
                  </div>
                  <div className="text-right">
                    {selectedPlanData.discountPercent ? (
                      <>
                        <p className="text-[12px] text-gray-400 line-through">{selectedPlanData.originalPrice}</p>
                        <p className="text-[20px] font-bold text-red-500">{selectedPlanData.discountedPrice}</p>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white">-{selectedPlanData.discountPercent}%</span>
                      </>
                    ) : (
                      <p className="text-[20px] font-bold text-gray-900">{selectedPlanData.price}</p>
                    )}
                    <p className="text-[11px] text-gray-400">{selectedPlanData.period}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Discount code input */}
            {selectedPlanData && !user?.isPremium && (
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-2">Mã giảm giá</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountInfo(null); setDiscountError(null); }}
                    placeholder="Nhập mã..."
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[13px] font-mono uppercase placeholder:normal-case placeholder:text-gray-400 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={applyingDiscount || !discountCode.trim()}
                    className="px-4 py-2 bg-gray-900 text-white text-[12px] font-semibold rounded-xl hover:bg-gray-700 disabled:opacity-40 transition-colors"
                  >
                    {applyingDiscount ? "..." : "Áp dụng"}
                  </button>
                </div>
                {discountInfo && (
                  <div className="mt-2 flex items-center justify-between text-[12px]">
                    <span className="text-emerald-600 font-medium">✓ Giảm {discountInfo.discountAmount?.toLocaleString("vi-VN")}đ</span>
                    <span className="text-gray-900 font-bold">{discountInfo.finalPrice?.toLocaleString("vi-VN")}đ</span>
                  </div>
                )}
                {discountError && <p className="mt-1.5 text-[11px] text-red-500">{discountError}</p>}
              </div>
            )}

            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                  <p className="text-[12px] text-gray-400">Đang tạo đơn hàng...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
                  <AlertCircle className="text-red-400" size={28} />
                  <p className="text-[13px] text-gray-500">{error}</p>
                  <button
                    onClick={() => fetchOrder(selectedPlan)}
                    className="px-5 py-2 bg-white border border-gray-200 rounded-xl text-[12px] font-medium text-gray-900 hover:border-gray-300 transition-colors"
                  >
                    Thử lại
                  </button>
                </div>
              ) : orderData ? (
                <div className="flex flex-col items-center gap-5 w-full">
                  {/* Amount */}
                  <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Số tiền thanh toán</p>
                    <p className="text-3xl font-bold text-gray-900">{orderData.amount?.toLocaleString("vi-VN")}đ</p>
                    <p className="text-[12px] text-gray-400 mt-1">Gói {orderData.plan}</p>
                  </div>

                  {/* PayOS CTA */}
                  <motion.button
                    onClick={() => { window.location.href = orderData.checkoutUrl; }}
                    whileHover={{ scale: 1.01, boxShadow: '0 8px 24px rgba(245,166,35,0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-gold hover:bg-[#e09515] text-white font-bold text-[15px] rounded-2xl transition-colors flex items-center justify-center gap-3"
                  >
                    <CreditCard size={18} />
                    Thanh toán qua PayOS
                  </motion.button>

                  <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                    Được chuyển đến trang thanh toán PayOS an toàn.<br />
                    Hỗ trợ chuyển khoản ngân hàng, ví điện tử, QR Code.
                  </p>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Lock size={11} />
                    <span className="text-[11px]">Bảo mật SSL · Mã hoá end-to-end</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0, 150, 300].map((d) => (
                        <div key={d} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-400">Đang chờ xác nhận thanh toán...</span>
                  </div>

                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* ── Comparison Table ── */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowComparison(v => !v)}
            className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors"
          >
            <div className="text-left">
              <p className="text-[16px] font-bold text-gray-900">So sánh quyền lợi các gói</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Xem chi tiết từng tính năng bạn nhận được</p>
            </div>
            {showComparison ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto border-t border-gray-100">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-6 py-3 font-semibold text-gray-500 text-[11px] uppercase tracking-wider w-[32%]">Tính năng</th>
                        {['Free', 'Basic', 'Full', 'Annual'].map((name, i) => {
                          const planKey = name.toUpperCase();
                          const isCurrent = (user?.plan || 'FREE').toUpperCase() === planKey;
                          const isHighlighted = selectedPlan === planKey;
                          const accent = plans.find(p => p.key === planKey)?.accentColor;
                          return (
                            <th key={name} className={`text-center px-4 py-3 font-bold text-[13px] ${isCurrent ? 'text-emerald-600' : isHighlighted ? 'text-gray-900' : 'text-gray-400'}`}>
                              <div className="flex flex-col items-center gap-1">
                                <span>{name}</span>
                                {isCurrent && <span className="text-[9px] font-semibold text-emerald-500 uppercase tracking-wide">Hiện tại</span>}
                                {isHighlighted && !isCurrent && <div className="h-0.5 w-8 rounded-full" style={{ background: accent }} />}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISON_ROWS.map((row, i) => (
                        <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="px-6 py-3 text-gray-600 text-[12px]">{row.feature}</td>
                          {['FREE', 'BASIC', 'FULL', 'ANNUAL'].map(key => {
                            const val = row[key];
                            const isCurrent = (user?.plan || 'FREE').toUpperCase() === key;
                            const isHighlighted = selectedPlan === key;
                            const isCheck = val === '✓' || (val && val.startsWith('✓'));
                            const isCross = val === '❌';
                            return (
                              <td key={key} className={`text-center px-4 py-3 text-[12px] transition-colors ${
                                isCurrent ? 'bg-emerald-50/40' : isHighlighted ? 'bg-amber-50/30' : ''
                              }`}>
                                {isCross
                                  ? <X size={13} className="mx-auto text-gray-300" />
                                  : isCheck
                                  ? <Check size={13} className="mx-auto text-emerald-500" />
                                  : <span className={isCurrent ? 'text-gray-700 font-medium' : isHighlighted ? 'text-gray-700' : 'text-gray-400'}>{val}</span>
                                }
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bottom CTA inside table */}
                <div className="px-6 py-5 bg-linear-to-r from-amber-50 to-orange-50 border-t border-amber-100 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[14px] font-bold text-gray-900">MC chuyên nghiệp không để giọng tự phát triển.</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">Bắt đầu luyện tập có AI hỗ trợ từ hôm nay.</p>
                  </div>
                  <button
                    onClick={() => {
                      document.getElementById('plan-cards-top')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="shrink-0 px-5 py-2.5 bg-gold hover:bg-[#e09515] text-white text-[13px] font-semibold rounded-xl transition-colors"
                  >
                    Chọn gói ngay
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Testimonials strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Nguyễn Minh Khoa", role: "MC Đám cưới", quote: "Từ 64% lên 91% sau 2 tuần — điểm phát âm tăng rõ rệt nhờ AI feedback.", plan: "FULL" },
            { name: "Trần Thị Bảo Châu", role: "Dẫn chương trình TV", quote: "Luyện lúc 11 giờ đêm, không cần ai chấm điểm. Tiện không tưởng.", plan: "ANNUAL" },
            { name: "Lê Đức Anh", role: "MC Sự kiện doanh nghiệp", quote: "Phân tích nhịp điệu và tốc độ nói rất chính xác — chính xác hơn cả huấn luyện viên thật.", plan: "FULL" },
          ].map((t, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => <Star key={j} size={11} className="text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-[13px] text-gray-600 leading-relaxed mb-4">"{t.quote}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-gray-900">{t.name}</p>
                  <p className="text-[11px] text-gray-400">{t.role}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  t.plan === 'ANNUAL' ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-blue-50 border-blue-200 text-blue-600'
                }`}>{t.plan}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default PaymentPage;
