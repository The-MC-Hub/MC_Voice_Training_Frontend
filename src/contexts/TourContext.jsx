import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const TOUR_KEY = "mcvt_tour_done";

const TOUR_STEPS = [
  {
    id: "dashboard",
    target: "tour-dashboard",
    title: "Trang tổng quan",
    desc: "Xem thống kê luyện tập, điểm số AI, streak hàng ngày và tiến trình khóa học của bạn tại đây.",
    arrow: "bottom",
  },
  {
    id: "training",
    target: "tour-training",
    title: "Luyện giọng AI",
    desc: "Ghi âm giọng nói và nhận phân tích từ AI ngay lập tức — phát âm, nhịp điệu, tốc độ, độ rõ ràng và cảm xúc.",
    arrow: "bottom",
  },
  {
    id: "courses",
    target: "tour-courses",
    title: "Khóa học",
    desc: "Học theo lộ trình với 50+ bài học MC chuyên nghiệp: đám cưới, doanh nghiệp, gala, talkshow và nhiều hơn nữa.",
    arrow: "bottom",
  },
  {
    id: "pricing",
    target: "tour-pricing",
    title: "Nâng cấp gói",
    desc: "Mở khóa toàn bộ tính năng AI không giới hạn, tất cả khóa học và chứng chỉ chuyên nghiệp với gói BASIC hoặc FULL.",
    arrow: "bottom",
  },
  {
    id: "settings",
    target: "tour-settings",
    title: "Cài đặt tài khoản",
    desc: "Chỉnh sửa hồ sơ, đổi mật khẩu, xem mã giới thiệu và quản lý thông tin thanh toán của bạn.",
    arrow: "bottom",
  },
];

const TourContext = createContext(null);

export const TourProvider = ({ children }) => {
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const location = useLocation();
  const timerRef = useRef(null);

  useEffect(() => {
    if (
      location.pathname === "/m/dashboard" &&
      localStorage.getItem("mcvt_tour_pending")
    ) {
      localStorage.removeItem("mcvt_tour_pending");
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setStepIdx(0);
        setActive(true);
      }, 900);
    }
    return () => clearTimeout(timerRef.current);
  }, [location.pathname]);

  const startTour = useCallback(() => {
    setStepIdx(0);
    setActive(true);
  }, []);

  const nextStep = useCallback(() => {
    setStepIdx(i => {
      if (i < TOUR_STEPS.length - 1) return i + 1;
      // last step — end tour
      setActive(false);
      localStorage.setItem(TOUR_KEY, "1");
      return 0;
    });
  }, []);

  const endTour = useCallback(() => {
    setActive(false);
    localStorage.setItem(TOUR_KEY, "1");
    setStepIdx(0);
  }, []);

  const shouldAutoStart = () => !localStorage.getItem(TOUR_KEY);

  return (
    <TourContext.Provider value={{
      active,
      stepIdx,
      steps: TOUR_STEPS,
      currentStep: TOUR_STEPS[stepIdx] || null,
      startTour,
      nextStep,
      endTour,
      shouldAutoStart,
    }}>
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used inside TourProvider");
  return ctx;
};
