import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ─── Quest step definitions ───────────────────────────────────────────────────
// Each step:
//   target        — data-quest attribute to spotlight
//   title / desc  — tooltip content
//   navigateTo    — navigate to this URL before showing this step (exact path)
//   waitForPath   — regex string: wait until location.pathname matches, then show step
//                   use this for dynamic URLs (e.g. /m/voice/practice/:id)

const QUEST_GUIDES = {
  profile: [
    {
      target: "quest-settings-nav",
      title: "Mở Cài đặt",
      desc: "Nhấn vào biểu tượng bánh răng để mở trang Cài đặt tài khoản.",
    },
    {
      target: "quest-avatar-picker",
      title: "Chọn avatar",
      desc: "Nhấn vào ô avatar để chọn biểu tượng đại diện cho hồ sơ của bạn.",
      navigateTo: "/m/settings",
    },
    {
      target: "quest-name-input",
      title: "Nhập họ tên",
      desc: "Điền đầy đủ họ và tên của bạn vào ô này.",
    },
    {
      target: "quest-save-profile",
      title: "Lưu hồ sơ",
      desc: "Nhấn nút Lưu để hoàn thành cập nhật hồ sơ và nhận điểm nhiệm vụ!",
    },
  ],

  practice: [
    {
      target: "quest-training-nav",
      title: "Mở Luyện tập",
      desc: "Nhấn vào mục Luyện tập trên thanh điều hướng.",
    },
    {
      target: "quest-first-lesson",
      title: "Chọn bài luyện",
      desc: "Nhấn vào bài học bất kỳ để vào trang luyện giọng AI.",
      navigateTo: "/m/voice/library",
    },
    {
      target: "quest-script-panel",
      title: "Kịch bản luyện tập",
      desc: "Đây là đoạn văn bạn cần đọc. Có thể tùy chỉnh cỡ chữ, font, căn lề và bật teleprompter tự cuộn.",
      waitForPath: "^/m/voice/practice/",
    },
    {
      target: "quest-recording-card",
      title: "Khu vực ghi âm",
      desc: "Nhấn nút Ghi âm (màu vàng) để bắt đầu. Đọc to và rõ ràng, sau đó nhấn Dừng. Có thể bật camera để xem biểu cảm.",
    },
    {
      target: "quest-record-btn",
      title: "Bắt đầu ghi âm!",
      desc: "Nhấn nút này → đọc đoạn văn → nhấn Dừng → nhấn Phân tích AI để nhận phản hồi chi tiết về giọng nói. Hoàn thành nhiệm vụ!",
    },
  ],

  courses: [
    {
      target: "quest-courses-nav",
      title: "Mở Khóa học",
      desc: "Nhấn vào mục Khóa học trên thanh điều hướng.",
    },
    {
      target: "quest-first-course",
      title: "Khám phá khóa học",
      desc: "Nhấn vào một khóa học để xem nội dung chi tiết. Chỉ cần ghé thăm là hoàn thành nhiệm vụ!",
      navigateTo: "/m/courses",
    },
  ],

  leaderboard: [
    {
      target: "quest-leaderboard-nav",
      title: "Mở Bảng xếp hạng",
      desc: "Nhấn vào mục Xếp hạng trên thanh điều hướng.",
    },
    {
      target: "quest-leaderboard-table",
      title: "Bảng xếp hạng MC",
      desc: "Đây là bảng xếp hạng toàn quốc! Luyện tập nhiều hơn để leo hạng. Nhiệm vụ hoàn thành khi bạn ghé thăm trang này.",
      navigateTo: "/m/leaderboard",
    },
  ],
};

// ─── Context ──────────────────────────────────────────────────────────────────

const QuestGuideContext = createContext(null);

export const QuestGuideProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [questId, setQuestId] = useState(null);
  const [stepIdx, setStepIdx] = useState(0);
  // pendingStep: waiting for navigateTo page load
  const [pendingStep, setPendingStep] = useState(null);
  // waitingStep: waiting for dynamic URL pattern match
  const [waitingStep, setWaitingStep] = useState(null);
  const timerRef = useRef(null);

  const steps = questId ? QUEST_GUIDES[questId] || [] : [];
  const currentStep = steps[stepIdx] || null;

  const startGuide = useCallback((qId) => {
    const qs = QUEST_GUIDES[qId];
    if (!qs?.length) return;
    setQuestId(qId);
    setStepIdx(0);
    setActive(true);
    setPendingStep(null);
    setWaitingStep(null);
  }, []);

  const endGuide = useCallback(() => {
    setActive(false);
    setQuestId(null);
    setStepIdx(0);
    setPendingStep(null);
    setWaitingStep(null);
    clearTimeout(timerRef.current);
  }, []);

  // Find the best step index for current pathname
  const findStepForPath = useCallback((pathname, upToIdx) => {
    // Walk backwards from upToIdx to find last step whose page matches pathname
    for (let i = upToIdx; i >= 0; i--) {
      const s = steps[i];
      if (s.waitForPath && new RegExp(s.waitForPath).test(pathname)) return i;
      if (s.navigateTo && pathname.startsWith(s.navigateTo)) return i;
      if (!s.navigateTo && !s.waitForPath) {
        // Step has no page requirement — check previous step's navigateTo
        const prev = steps[i - 1];
        if (!prev) return i; // first step, no page requirement
        if (prev.navigateTo && pathname.startsWith(prev.navigateTo)) return i;
        if (prev.waitForPath && new RegExp(prev.waitForPath).test(pathname)) return i;
      }
    }
    return 0;
  }, [steps]);

  const nextStep = useCallback(() => {
    const nextIdx = stepIdx + 1;
    if (nextIdx >= steps.length) {
      endGuide();
      return;
    }
    const next = steps[nextIdx];

    if (next.waitForPath) {
      setWaitingStep(nextIdx);
      setActive(false);
    } else if (next.navigateTo) {
      setPendingStep(nextIdx);
      navigate(next.navigateTo);
    } else {
      setStepIdx(nextIdx);
    }
  }, [stepIdx, steps, navigate, endGuide]);

  const prevStep = useCallback(() => {
    if (stepIdx === 0) return;
    const prevIdx = stepIdx - 1;
    const prev = steps[prevIdx];
    if (prev.navigateTo) {
      setPendingStep(prevIdx);
      navigate(prev.navigateTo);
    } else if (prev.waitForPath) {
      // Just go back one step visually — user is already on this page or close
      setStepIdx(prevIdx);
    } else {
      setStepIdx(prevIdx);
    }
  }, [stepIdx, steps, navigate]);

  // After navigateTo: activate pending step once pathname changes
  useEffect(() => {
    if (pendingStep === null) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setStepIdx(pendingStep);
      setPendingStep(null);
    }, 600);
    return () => clearTimeout(timerRef.current);
  }, [location.pathname, pendingStep]);

  // After waitForPath: detect when user navigates to matching page
  useEffect(() => {
    if (waitingStep === null) return;
    const step = steps[waitingStep];
    if (!step?.waitForPath) return;
    const pattern = new RegExp(step.waitForPath);
    if (pattern.test(location.pathname)) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setStepIdx(waitingStep);
        setWaitingStep(null);
        setActive(true);
      }, 800);
    }
  }, [location.pathname, waitingStep, steps]);

  // Page mismatch detection: user navigated away mid-guide
  useEffect(() => {
    if (!active || pendingStep !== null || waitingStep !== null) return;
    if (!currentStep) return;

    const pathname = location.pathname;

    // Determine expected page for current step (walk back to find page anchor)
    let expectedPath = null;
    let expectedIsRegex = false;
    for (let i = stepIdx; i >= 0; i--) {
      if (steps[i].navigateTo) { expectedPath = steps[i].navigateTo; expectedIsRegex = false; break; }
      if (steps[i].waitForPath) { expectedPath = steps[i].waitForPath; expectedIsRegex = true; break; }
    }

    if (!expectedPath) return;

    const onCorrectPage = expectedIsRegex
      ? new RegExp(expectedPath).test(pathname)
      : pathname.startsWith(expectedPath);

    if (!onCorrectPage) {
      // User navigated away — find best matching step for current page
      const bestIdx = findStepForPath(pathname, stepIdx);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setStepIdx(bestIdx);
      }, 300);
    }
  }, [location.pathname, active, currentStep, stepIdx, steps, pendingStep, waitingStep, findStepForPath]);

  return (
    <QuestGuideContext.Provider value={{
      active,
      questId,
      stepIdx,
      steps,
      currentStep,
      startGuide,
      nextStep,
      prevStep,
      endGuide,
      waitingForNav: waitingStep !== null,
    }}>
      {children}
    </QuestGuideContext.Provider>
  );
};

export const useQuestGuide = () => {
  const ctx = useContext(QuestGuideContext);
  if (!ctx) throw new Error("useQuestGuide must be used inside QuestGuideProvider");
  return ctx;
};
