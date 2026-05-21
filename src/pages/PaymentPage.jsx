import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Check, ShieldCheck, CreditCard, Award, AlertCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/ui/Toast";

const PaymentPage = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);
  const pollRef = React.useRef(null);

  useEffect(() => {
    if (user?.id) fetchOrderDetails();
  }, [user?.id]);

  useEffect(() => {
    if (!orderData || success || user?.isPremium) return;
    setPolling(true);
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/payment/status/${user.id}`);
        if (res.data?.data?.isPremium) {
          clearInterval(pollRef.current);
          setPolling(false);
          updateUser({ isPremium: true });
          setSuccess(true);
          toast.showSuccess("Thanh toán thành công! Tài khoản đã được nâng cấp Premium.");
          setTimeout(() => navigate("/m/dashboard"), 2500);
        }
      } catch (_) {}
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [orderData, success]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post(`/payment/create-order?userId=${user.id}`);
      setOrderData(res.data.data);
    } catch (err) {
      console.error("Failed to generate checkout details:", err);
      setError("Unable to initialize payment details. Please check server status.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSuccess = async () => {
    setSimulating(true);
    setError(null);
    try {
      await api.post(`/payment/simulate-success?userId=${user.id}`);
      updateUser({ isPremium: true });
      setSuccess(true);
      toast.showSuccess("Cài đặt tài khoản Premium thành công!");
      setTimeout(() => navigate("/m/dashboard"), 2500);
    } catch (err) {
      console.error("Simulation failed:", err);
      setError("Mô phỏng nâng cấp lỗi. Thử lại sau.");
      toast.showError("Simulation failed");
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white py-12 px-4 lg:px-16">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/[0.07]">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-zinc-600 hover:text-white transition-colors text-[13px] mb-4 group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              {t("common.back")}
            </button>
            <div className="flex items-center gap-3 mb-1">
              <CreditCard size={20} className="text-[#f5a623]" />
              <h1 className="text-2xl font-bold text-white">
                {user?.isPremium ? "Premium Account" : "Upgrade to Premium"}
              </h1>
            </div>
            <p className="text-zinc-500 text-[13px]">
              {user?.isPremium
                ? "Manage your elite subscription and voice academy benefits."
                : "Unlock unlimited recordings, deep analytics, and bilingual reports."}
            </p>
          </div>

          {user?.isPremium && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f5a623]/[0.08] border border-[#f5a623]/20 text-[#f5a623] text-[12px] font-medium">
              <Sparkles size={14} />
              Active Premium Member
            </div>
          )}
        </div>

        {success ? (
          <div className="bg-[#111113] border border-emerald-500/20 rounded-2xl p-12 text-center space-y-6 max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white">Upgrade Successful!</h2>
            <p className="text-zinc-400 text-[14px] leading-relaxed max-w-md mx-auto">
              Chào mừng bạn đến với <span className="font-semibold text-[#f5a623]">MC Hub Premium</span>! Mọi giới hạn thực hành đã được mở khóa.
            </p>
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest">Redirecting to dashboard...</p>
          </div>

        ) : user?.isPremium ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-8">
              <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Award size={18} className="text-[#f5a623]" />
                  <h3 className="text-[15px] font-semibold text-white">Your Unlocked Privileges</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: "Unlimited Voice Practice", desc: "No daily practice caps or recording limitations." },
                    { title: "Whisper Speech Decoding", desc: "Industry-grade accuracy for speech validation." },
                    { title: "Deep Analytics Suite", desc: "Track Clarity, Rhythm, WPM, and Emotional peaks." },
                    { title: "Bilingual Technical Feedback", desc: "Expert technical suggestions in EN & VI." },
                    { title: "Premium Badges", desc: "Gold credentials visible across MC community profiles." },
                    { title: "Priority AI Synthesis", desc: "Zero queue duration for processing voice attempts." },
                  ].map((benefit, i) => (
                    <div key={i} className="flex gap-3 p-4 rounded-xl bg-[#09090b] border border-white/[0.06]">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <Check size={12} />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-semibold text-white leading-snug">{benefit.title}</h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-4">
              <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6 text-center">
                <div className="w-14 h-14 rounded-xl bg-[#f5a623]/[0.08] border border-[#f5a623]/20 flex items-center justify-center text-[#f5a623] mx-auto mb-4">
                  <Award size={24} />
                </div>
                <h4 className="text-[15px] font-semibold text-white mb-1">Elite Ambassador</h4>
                <p className="text-[12px] text-zinc-500 leading-relaxed mb-5">
                  Cảm ơn bạn đã đồng hành cùng MC Hub.
                </p>
                <div className="space-y-2 border-t border-white/[0.06] pt-4">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-zinc-500">Gói hiện tại:</span>
                    <span className="font-semibold text-[#f5a623]">Premium Lifetime</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-zinc-500">Mức phí:</span>
                    <span className="font-semibold text-white">20.000đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Benefits — left */}
            <div className="col-span-12 md:col-span-6">
              <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6 h-full">
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#f5a623]/[0.08] border border-[#f5a623]/20 px-3 py-1 text-[11px] font-medium text-[#f5a623] mb-5">
                  <Sparkles size={11} /> Lifetime Premium Offer
                </div>

                <h3 className="text-2xl font-bold text-white leading-tight mb-2">
                  Nâng cấp MC Hub Premium
                </h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed mb-6">
                  Xóa bỏ mọi giới hạn, đột phá kỹ năng làm chủ sân khấu cùng bộ đo lường AI chuẩn quốc tế.
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    { title: "Thực hành không giới hạn", desc: "Không còn giới hạn 5 lần luyện giọng ban đầu." },
                    { title: "Phân tích âm lượng & nhịp điệu sâu", desc: "Độ chính xác tần phổ Mel vượt trội." },
                    { title: "Bảng kỹ thuật huấn luyện MC", desc: "Lời khuyên riêng từ AI bằng Tiếng Anh & Tiếng Việt." },
                    { title: "Huy hiệu Vàng nổi bật", desc: "Gây ấn tượng mạnh với nhà tuyển dụng." },
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-md bg-emerald-500/[0.08] border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <Check size={11} />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-semibold text-white leading-snug">{benefit.title}</h4>
                        <p className="text-[11px] text-zinc-500 mt-0.5">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-baseline gap-3 pt-5 border-t border-white/[0.06]">
                  <span className="text-3xl font-bold text-white">20,000đ</span>
                  <span className="text-[14px] text-zinc-600 line-through">100,000đ</span>
                  <span className="px-2 py-0.5 rounded-lg bg-red-500/[0.08] border border-red-500/20 text-[11px] font-medium text-red-400">-80%</span>
                </div>
              </div>
            </div>

            {/* QR checkout — right */}
            <div className="col-span-12 md:col-span-6">
              <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-6 h-full flex flex-col justify-center items-center">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#f5a623] border-t-transparent" />
                    <p className="text-[12px] text-zinc-500 uppercase tracking-widest">Generating VietQR...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-16 space-y-4">
                    <AlertCircle className="mx-auto text-red-400" size={32} />
                    <p className="text-[13px] text-zinc-400">{error}</p>
                    <button
                      onClick={fetchOrderDetails}
                      className="px-5 py-2 bg-[#09090b] border border-white/[0.07] rounded-xl text-[12px] font-medium text-white hover:border-white/[0.14] transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : orderData ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="p-3 rounded-2xl bg-white shadow-lg mb-4">
                      <img src={orderData.qrUrl} alt="Payment VietQR" className="w-44 h-44 object-contain rounded-xl" />
                    </div>

                    <p className="text-zinc-500 text-[12px] mb-5 text-center leading-relaxed">
                      Quét mã QR bằng ứng dụng ngân hàng của bạn để hoàn tất giao dịch tự động.
                    </p>

                    <div className="w-full space-y-2.5 bg-[#09090b] border border-white/[0.06] rounded-xl p-4 mb-5">
                      {[
                        { label: "Chủ tài khoản", value: orderData.accountName },
                        { label: "Ngân hàng", value: "MBBank (Quân Đội)" },
                        { label: "Số tài khoản", value: orderData.accountNumber },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-[12px]">
                          <span className="text-zinc-500">{label}:</span>
                          <span className="font-semibold text-white">{value}</span>
                        </div>
                      ))}
                      <div className="pt-2.5 border-t border-white/[0.06]">
                        <span className="text-[10px] uppercase font-medium text-[#f5a623] tracking-wider block mb-1.5">Cú pháp chuyển khoản:</span>
                        <div className="flex items-center justify-between rounded-lg bg-[#f5a623]/[0.05] border border-[#f5a623]/20 px-3 py-2">
                          <code className="text-[12px] font-semibold text-[#f5a623] select-all">{orderData.memo}</code>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleSimulateSuccess}
                      disabled={simulating}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl text-[13px] transition-colors flex items-center justify-center gap-2"
                    >
                      {simulating ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                          Upgrading...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={15} />
                          Simulate Successful Payment (Dev)
                        </>
                      )}
                    </button>

                    <p className="mt-3 text-[10px] text-zinc-600 text-center uppercase tracking-widest">
                      *Hệ thống tự động kích hoạt sau khi nhận tiền chuyển khoản
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;
