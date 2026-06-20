// GA4 Measurement ID: G-S6MV5SK3E0
const track = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
};

// Auth
export const trackLoginSubmit = () => track('login_submit');
export const trackLoginSuccess = (method = 'email') => track('login_success', { method });
export const trackLoginOtpVerify = () => track('login_otp_verify');
export const trackLogoutClick = () => track('logout_click');
export const trackRegisterSubmit = () => track('register_submit');
export const trackRegisterSuccess = () => track('register_success');
export const trackRegisterEmailVerify = () => track('register_email_verify');
export const trackRegisterQuizComplete = (answers = []) => track('register_quiz_complete', { quiz_answers: answers.join(',') });
export const trackForgotPasswordSubmit = () => track('forgot_password_submit');
export const trackPasswordChangeSubmit = () => track('password_change_submit');

// Voice Practice
export const trackVoicePracticeStart = (lessonId, category) => track('voice_practice_start', { lesson_id: lessonId, category });
export const trackRecordingStart = (lessonId) => track('recording_start', { lesson_id: lessonId });
export const trackRecordingStop = (durationSeconds) => track('recording_stop', { duration_seconds: durationSeconds });
export const trackAnalysisComplete = (accuracy, energy, pace, lessonId) => track('analysis_complete', { accuracy, energy, pace, lesson_id: lessonId });
export const trackTeleprompterEnable = () => track('teleprompter_enable');
export const trackVoiceAnnotationAdd = () => track('voice_annotation_add');
export const trackVoiceNoteAdd = () => track('voice_note_add');
export const trackVoicePracticeReset = () => track('voice_practice_reset');

// Voice Library
export const trackLessonClick = (lessonId, category) => track('lesson_click', { lesson_id: lessonId, category });
export const trackVoiceLibrarySearch = (searchTerm) => track('voice_library_search', { search_term: searchTerm });
export const trackVoiceLibraryFilter = (category, difficulty, length, sort) => track('voice_library_filter', { category, difficulty, length, sort });

// Dashboard
export const trackDashboardView = () => track('dashboard_view');
export const trackDashboardTabSwitch = (tab) => track('dashboard_tab_switch', { tab });
export const trackDashboardChartFilter = (timeFrame) => track('dashboard_chart_filter', { time_frame: timeFrame });

// Payment
export const trackPaymentPageView = () => track('payment_page_view');
export const trackPlanSelect = (plan) => track('plan_select', { plan });
export const trackPaymentSubmit = (plan, amount) => track('payment_submit', { plan, value: amount, currency: 'VND' });
export const trackPaymentSuccess = (plan, amount, transactionId) => track('purchase', { plan, value: amount, currency: 'VND', transaction_id: transactionId });
export const trackPaymentCancel = (plan) => track('payment_cancel', { plan });
export const trackUpgradeBannerView = (usagePercent) => track('upgrade_banner_view', { usage_percent: usagePercent });
export const trackUpgradeBannerClick = () => track('upgrade_banner_click');
export const trackPremiumModalView = (triggerReason) => track('premium_modal_view', { trigger_reason: triggerReason });
export const trackPremiumModalUpgradeClick = (plan) => track('premium_modal_upgrade_click', { plan });

// Courses
export const trackCourseListView = () => track('course_list_view');
export const trackCourseDetailView = (courseId, courseName) => track('course_detail_view', { course_id: courseId, course_name: courseName });
export const trackCourseEnrollClick = (courseId, courseName) => track('course_enroll_click', { course_id: courseId, course_name: courseName });
export const trackLessonStart = (lessonId, lessonType) => track('lesson_start', { lesson_id: lessonId, lesson_type: lessonType });
export const trackLessonComplete = (lessonId, courseId) => track('lesson_complete', { lesson_id: lessonId, course_id: courseId });

// Community / Leaderboard
export const trackCommunityPageView = () => track('community_page_view');
export const trackLeaderboardFilter = (type, period) => track('leaderboard_filter', { leaderboard_type: type, period });
export const trackLeaderboardShare = (rank) => track('leaderboard_share', { rank });

// Settings
export const trackSettingsProfileUpdate = () => track('settings_profile_update');
export const trackSettingsAvatarUpload = () => track('settings_avatar_upload');

// Onboarding
export const trackOnboardingStepComplete = (stepNumber) => track('onboarding_step_complete', { step_number: stepNumber });
export const trackOnboardingSubmit = () => track('onboarding_submit');
export const trackOnboardingTourSkip = () => track('onboarding_tour_skip');
export const trackOnboardingTourComplete = () => track('onboarding_tour_complete');

// Contact
export const trackContactModalSubmit = () => track('contact_modal_submit');
