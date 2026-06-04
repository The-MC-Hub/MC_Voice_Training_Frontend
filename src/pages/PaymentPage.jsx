import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles, Check, ShieldCheck, CreditCard, Award, AlertCircle,
  ArrowLeft, Zap, BookOpen, Globe, Lock, CheckCircle2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/ui/Toast";

const FREE_BENEFITS = [
  { icon: BookOpen, text: "Xem tất cả bài học công khai" },
  { icon: Zap, text: "5 lượt luyện tập AI" },
  { icon: Check, text: "MC Đám cưới (xem trước)" },
  { icon: Check, text: "Không có AI coaching" },
];

const PLANS = [
  {
    key: "BASIC",
    name: "Basic",
    price: "199.000đ",
    period: "/tháng",
    highlight: true,
    badge: "Tốt nhất để bắt đầu",
    badgeColor: "bg-amber-50 border-amber-300 text-amber-700",
    borderColor: "border-amber-400/50",
    glowColor: "shadow-[0_0_32px_rgba(245,158,11,0.20)]",
    features: [
      { icon: BookOpen, text: "50 bài luyện tập" },
      { icon: Zap, text: "1 chủ đề: MC Đám cưới" },
      { icon: Check, text: "Lý thuyết + Trắc nghiệm" },
      { icon: Check, text: "10 AI coaching/tháng" },
    ],
  },
  {
    key: "FULL",
    name: "Full",
    price: "299.000đ",
    period: "/tháng",
    badge: "Phổ biến",
    badgeColor: "bg-blue-50 border-blue-200 text-blue-600",
    borderColor: "border-gray-200",
    glowColor: "",
    features: [
      { icon: BookOpen, text: "50 bài · 3 chủ đề" },
      { icon: Zap, text: "AI chấm điểm chi tiết" },
      { icon: Globe, text: "Theo dõi tiến độ" },
      { icon: Check, text: "Không giới hạn AI coaching" },
    ],
  },
  {
    key: "ANNUAL",
    name: "Annual",
    price: "1.990.000đ",
    period: "/năm",
    badge: "Tiết kiệm nhất",
    badgeColor: "bg-purple-50 border-purple-200 text-purple-600",
    borderColor: "border-gray-200",
    glowColor: "",
    features: [
      { icon: Check, text: "Toàn bộ tính năng Full" },
      { icon: Zap, text: "Tiết kiệm hơn 2 tháng" },
      { icon: Award, text: "Huy hiệu Annual Elite" },
      { icon: Check, text: "Ưu tiên hỗ trợ 24/7" },
    ],
  },
];

const PaymentPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [selectedPlan, setSelectedPlan] = useState("BASIC");
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [success, setSuccess] = useState(false);
  const pollRef = useRef(null);

  const fetchOrder = async (plan = selectedPlan) => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    setOrderData(null);
    try {
      const res = await api.post(`/payment/create-order?userId=${user.id}&plan=${plan}`);
      setOrderData(res.data.data);
    } catch (err) {
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
        if (res.data?.data?.isPremium) {
          clearInterval(pollRef.current);
          updateUser({ isPremium: true });
          setSuccess(true);
          toast.showSuccess("Thanh toán thành công! Tài khoản đã được nâng cấp.");
          setTimeout(() => navigate("/m/dashboard"), 2500);
        }
      } catch (_) {}
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [orderData, success, user?.isPremium]);

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      await api.post(`/payment/simulate-success?userId=${user.id}&plan=${selectedPlan}`);
      updateUser({ isPremium: true });
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
        <div className="bg-gray-50 border border-emerald-500/20 rounded-2xl p-12 text-center space-y-5 max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Kích hoạt thành công!</h2>
          <p className="text-gray-500 text-[13px] leading-relaxed">
            Chào mừng bạn đến với <span className="text-[#f5a623] font-semibold">MC Hub</span>. Đang chuyển hướng...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">

        {/* Back + Header */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors text-[13px] mb-6 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Quay lại
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Chọn gói phù hợp với bạn</h1>
          <p className="text-gray-400 text-[13px]">Nâng cấp để mở khoá toàn bộ tính năng AI luyện giọng chuyên nghiệp.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left: Plan cards */}
          <div className="space-y-3">

            {/* FREE plan — current plan indicator */}
            {!user?.isPremium && (
              <div className="w-full text-left p-5 rounded-2xl border border-gray-200 bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[15px] font-bold text-gray-700">Free</span>
                      <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold bg-gray-100 border-gray-300 text-gray-500">
                        Gói hiện tại
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-2xl font-bold text-gray-500">0đ</span>
                      <span className="text-[11px] text-gray-400">/mãi mãi</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {FREE_BENEFITS.map(({ icon: Icon, text }, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-gray-400">
                          <Icon size={11} className="shrink-0" />
                          <span className="text-[11px] leading-snug">{text}</span>
                        </div>
                      ))}
                    </div>
                    {/* Usage bar */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-gray-500">Lượt AI đã dùng</span>
                        <span className={`text-[11px] font-semibold ${(user?.aiSessionsUsed ?? 0) >= 5 ? 'text-red-500' : 'text-gray-700'}`}>
                          {user?.aiSessionsUsed ?? 0}/5
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all"
                          style={{ width: `${Math.min(100, ((user?.aiSessionsUsed ?? 0) / 5) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {PLANS.map((plan) => {
              const isSelected = selectedPlan === plan.key;
              return (
                <button
                  key={plan.key}
                  onClick={() => {
                    setSelectedPlan(plan.key);
                    fetchOrder(plan.key);
                  }}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 ${
                    isSelected
                      ? `${plan.borderColor} bg-white ${plan.glowColor}`
                      : "border-gray-200 bg-white hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[15px] font-bold text-gray-900">{plan.name}</span>
                        {plan.badge && (
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${plan.badgeColor}`}>
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className={`text-2xl font-bold ${plan.highlight && isSelected ? 'text-[#f5a623]' : 'text-gray-900'}`}>
                          {plan.price}
                        </span>
                        <span className="text-[11px] text-gray-400">{plan.period}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {plan.features.map(({ icon: Icon, text }, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-gray-500">
                            <Icon size={11} className="shrink-0 text-gray-400" />
                            <span className="text-[11px] leading-snug">{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Radio indicator */}
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                      isSelected ? 'border-[#f5a623] bg-[#f5a623]' : 'border-gray-400'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Trust signals */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 pt-2 px-1">
              {[
                { icon: Lock, text: "Thanh toán bảo mật" },
                { icon: Zap, text: "Kích hoạt tức thì" },
                { icon: CheckCircle2, text: "Hỗ trợ hoàn tiền 7 ngày" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-1.5 text-gray-400">
                  <Icon size={10} />
                  <span className="text-[11px]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: QR + bank info */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#f5a623] border-t-transparent" />
                <p className="text-[12px] text-gray-400">Đang tạo đơn hàng...</p>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16 text-center">
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
              <div className="flex flex-col items-center gap-6 w-full">
                {/* Amount summary */}
                <div className="w-full bg-white border border-gray-100 rounded-2xl p-5 text-center">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">Số tiền thanh toán</p>
                  <p className="text-3xl font-bold text-gray-900">{orderData.amount?.toLocaleString("vi-VN")}đ</p>
                  <p className="text-[12px] text-gray-400 mt-1">Gói {orderData.plan}</p>
                </div>

                {/* PayOS button */}
                <button
                  onClick={() => { window.location.href = orderData.checkoutUrl; }}
                  className="w-full py-4 bg-[#f5a623] hover:bg-[#e09515] text-white font-bold text-[15px] rounded-2xl transition-colors flex items-center justify-center gap-3 shadow-lg shadow-amber-200"
                >
                  <CreditCard size={18} />
                  Thanh toán qua PayOS
                </button>

                <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                  Bạn sẽ được chuyển đến trang thanh toán PayOS an toàn.<br/>
                  Hỗ trợ: Chuyển khoản ngân hàng, ví điện tử, QR Code.
                </p>

                {/* Trust signals */}
                <div className="flex items-center gap-2 text-gray-400">
                  <Lock size={11} />
                  <span className="text-[11px]">Bảo mật SSL · Mã hoá end-to-end</span>
                </div>

                {/* Waiting indicator */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                  <span className="text-[11px] text-gray-400">Đang chờ xác nhận thanh toán...</span>
                </div>

                {/* Dev simulate button */}
                <button
                  onClick={handleSimulate}
                  disabled={simulating}
                  className="w-full py-2.5 bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 rounded-xl text-[11px] font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {simulating ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                  ) : (
                    <ShieldCheck size={13} />
                  )}
                  {simulating ? "Đang kích hoạt..." : "Simulate thanh toán (Dev)"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
