import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Users, ArrowRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/animate-ui/components/radix/dialog";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { useAuthStore } from "@/store/useAuthStore";

const ROLES = [
  { value: "MC", icon: Mic, title: "Tôi là MC", desc: "Luyện giọng, nhận đánh giá AI, xây dựng hồ sơ nghề nghiệp" },
  { value: "CLIENT", icon: Users, title: "Tôi là khách hàng", desc: "Tìm và đặt lịch với MC chuyên nghiệp" },
];

/**
 * Shown after Google Sign-In when the email has no existing account. User picks a role,
 * then we call POST /auth/google/complete-registration with the pending token from the
 * initial /auth/google response.
 */
export default function GoogleRoleSelectModal({ pending, onSuccess, onCancel }) {
  const { completeGoogleRegistration, loading } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState(null);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!selectedRole) return;
    setError("");
    try {
      const res = await completeGoogleRegistration(pending.pendingToken, selectedRole);
      onSuccess(res);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể hoàn tất đăng ký. Vui lòng thử lại.");
    }
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent showCloseButton={false} className="w-full max-w-sm mx-4 bg-white rounded-md shadow-2xl overflow-hidden p-0">
        <div className="bg-amber-500 px-6 py-5 text-center">
          <h2 className="text-[17px] font-bold text-white">Chào mừng, {pending.name || "bạn"}!</h2>
          <p className="text-[12px] text-amber-100 mt-1">Chọn vai trò để hoàn tất đăng ký với {pending.email}</p>
        </div>

        <div className="px-6 py-6">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 text-[12px] rounded-md p-2.5 text-center mb-4 overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-3 mb-6">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setSelectedRole(r.value)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-md border-2 text-left transition-all ${
                  selectedRole === r.value
                    ? "border-amber-400 bg-amber-50 shadow-[0_0_0_3px_rgba(245,166,35,0.12)]"
                    : "border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/30"
                }`}
              >
                <div className="w-9 h-9 rounded-md bg-amber-100 flex items-center justify-center shrink-0">
                  <r.icon size={17} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-gray-900 leading-none mb-1">{r.title}</p>
                  <p className="text-[12px] text-gray-500 leading-snug">{r.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <Button
            onClick={handleContinue}
            disabled={loading || !selectedRole}
            className="w-full py-3 rounded-md bg-amber-500 text-white text-[14px] font-semibold hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all h-auto"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <>Tiếp tục <ArrowRight size={15} /></>
            }
          </Button>

          <Button
            variant="ghost"
            onClick={onCancel}
            className="w-full mt-3 py-2.5 text-[13px] text-gray-400 hover:text-gray-600 transition-colors h-auto"
          >
            Huỷ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
