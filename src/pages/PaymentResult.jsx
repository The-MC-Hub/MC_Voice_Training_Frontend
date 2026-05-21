import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const isSuccess = window.location.pathname.includes("/payment/success");
  const [countdown, setCountdown] = useState(10);
  const [verified, setVerified] = useState(null);

  useEffect(() => {
    if (!user?.id) { setVerified(false); return; }
    api.get(`/payment/status/${user.id}`)
      .then(res => {
        const isPremium = res.data?.data?.isPremium;
        if (isPremium) { updateUser({ isPremium: true }); setVerified(true); }
        else setVerified(false);
      })
      .catch(() => setVerified(false));
  }, [user?.id]);

  useEffect(() => {
    if (verified === null) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); navigate("/m/dashboard"); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [verified, navigate]);

  const actualSuccess = isSuccess && verified === true;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
      <div className="bg-[#111113] border border-white/[0.07] rounded-2xl p-10 max-w-md w-full text-center space-y-6">

        {verified === null ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 size={36} className="text-[#f5a623] animate-spin" />
            <p className="text-[12px] text-zinc-500 uppercase tracking-widest">Verifying payment...</p>
          </div>
        ) : actualSuccess ? (
          <>
            <div className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle size={36} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Payment Confirmed!</h2>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              Tài khoản <span className="text-[#f5a623] font-semibold">Premium</span> đã được kích hoạt. Mọi giới hạn thực hành đã được mở khoá.
            </p>
          </>
        ) : (
          <>
            <div className="w-[72px] h-[72px] rounded-full bg-red-500/[0.08] border border-red-500/20 flex items-center justify-center mx-auto">
              <XCircle size={36} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {isSuccess ? "Payment Pending" : "Payment Cancelled"}
            </h2>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              {isSuccess
                ? "Giao dịch chưa được xác nhận. Nếu bạn đã chuyển khoản, vui lòng chờ vài phút và kiểm tra lại."
                : "Giao dịch đã bị huỷ. Bạn có thể thử lại từ trang payment."}
            </p>
          </>
        )}

        {verified !== null && (
          <div className="pt-4 space-y-3">
            <p className="text-[11px] text-zinc-600 uppercase tracking-widest">
              Redirecting in {countdown}s...
            </p>
            <button
              onClick={() => navigate("/m/dashboard")}
              className="flex items-center justify-center gap-2 mx-auto bg-[#09090b] border border-white/[0.07] text-white px-6 py-2.5 rounded-xl text-[13px] font-medium hover:border-white/[0.14] transition-colors"
            >
              <ArrowLeft size={15} /> Go to Dashboard
            </button>
            {!actualSuccess && (
              <button
                onClick={() => navigate("/m/payment")}
                className="flex items-center justify-center gap-2 mx-auto text-[#f5a623] border border-[#f5a623]/20 bg-[#f5a623]/[0.05] px-6 py-2.5 rounded-xl text-[13px] font-medium hover:bg-[#f5a623]/[0.08] transition-colors"
              >
                Try Payment Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
