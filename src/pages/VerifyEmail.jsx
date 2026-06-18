import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import api from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import { academyService } from "../services/academyService";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token: storeToken } = useAuthStore();
  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    // If already logged in, skip
    if (storeToken) {
      navigate("/m/dashboard", { replace: true });
      return;
    }

    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Link xác thực không hợp lệ.");
      return;
    }

    api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const { token: jwt, user } = res.data.data;
        localStorage.setItem("token", jwt);
        localStorage.setItem("user", JSON.stringify(user));
        useAuthStore.setState({ user, token: jwt, role: user.role, isAuthenticated: true });
        // Enroll gift course chosen during registration quiz (if any)
        const giftCourseId = localStorage.getItem("giftCourseId");
        if (giftCourseId) {
          localStorage.removeItem("giftCourseId");
          try { await academyService.giftEnrollCourse(giftCourseId); } catch { /* ignore */ }
        }
        setStatus("success");
        setTimeout(() => navigate("/m/dashboard", { replace: true }), 2000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "Link xác thực không hợp lệ hoặc đã hết hạn.");
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center"
      >
        {status === "loading" && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-5">
              <Loader2 size={28} className="text-amber-500 animate-spin" />
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 mb-2">Đang xác thực...</h2>
            <p className="text-[14px] text-gray-500">Vui lòng đợi trong giây lát.</p>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 14, stiffness: 260 }}
              className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-5"
            >
              <CheckCircle2 size={32} className="text-emerald-500" />
            </motion.div>
            <h2 className="text-[22px] font-bold text-gray-900 mb-2">Email đã xác thực!</h2>
            <p className="text-[14px] text-gray-500 mb-6">Tài khoản của bạn đã được kích hoạt. Đang chuyển hướng...</p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.3, duration: 1.6, ease: "linear" }}
              className="h-1 bg-emerald-500 rounded-full"
            />
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto mb-5">
              <XCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 mb-2">Xác thực thất bại</h2>
            <p className="text-[14px] text-gray-500 mb-6">{message}</p>
            <button
              onClick={() => navigate("/register", { replace: true })}
              className="px-6 py-2.5 rounded-xl bg-amber-500 text-white text-[14px] font-semibold hover:bg-amber-600 transition-colors"
            >
              Quay lại đăng ký
            </button>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-[16px] font-bold text-gray-900">MC</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[16px] font-bold text-gray-900">Hub</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
