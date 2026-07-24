import api from './api';

export const academyService = {
  getRoadmap: () => api.get('/courses/roadmap'),
  getAllCourses: (type) => api.get('/courses', { params: type ? { type } : {} }),
  getCourseDetail: (id) => api.get(`/courses/${id}`),
  enrollCourse: (id) => api.post(`/courses/${id}/enroll`),
  giftEnrollCourse: (id) => api.post(`/courses/${id}/gift-enroll`),
  createCourseOrder: (courseId) => api.post(`/payment/course-order?courseId=${courseId}`),
  updateCoursePricing: (courseId, { priceVnd, discountPercent }) => {
    const params = new URLSearchParams();
    if (priceVnd != null) params.set('priceVnd', priceVnd);
    if (discountPercent != null) params.set('discountPercent', discountPercent);
    return api.patch(`/admin/courses/${courseId}/pricing?${params.toString()}`);
  },
  getAllCoursesAdmin: () => api.get('/admin/courses'),
  updateCourseOutcomes: (courseId, outcomes) => api.patch(`/admin/courses/${courseId}/outcomes`, outcomes),
  completeLesson: (courseId, lessonId) => api.post(`/courses/${courseId}/lessons/${lessonId}/complete`),
  completeReading: (courseId, readingId) => api.post(`/courses/${courseId}/readings/${readingId}/complete`),
  completeExercise: (courseId, exerciseId, answer) => api.post(`/courses/${courseId}/exercises/${exerciseId}/complete`, { answer }),
  submitQuiz: (courseId, answers) => api.post(`/courses/${courseId}/quiz/submit`, { answers }),
  getReadingGuide: (id) => api.get(`/courses/reading-guides/${id}`),
  getProgressStats: (courseId) => api.get(`/courses/${courseId}/progress-stats`),
  getCaseStudy: (id) => api.get(`/case-studies/${id}`),

  peerReview: {
    request: (practiceSessionId) => api.post(`/peer-review/request/${practiceSessionId}`),
    pending: () => api.get('/peer-review/pending'),
    submit: (reviewId, comment, rating) => api.post(`/peer-review/${reviewId}/submit`, { comment, rating }),
    my: () => api.get('/peer-review/my'),
    forSession: (practiceSessionId) => api.get(`/peer-review/session/${practiceSessionId}`),
  },

  getHighlights: (guideId, userId) => api.get(`/highlights/reading-guides/${guideId}/users/${userId}`),
  createHighlight: (data) => api.post('/highlights', data),
  updateHighlight: (id, data) => api.put(`/highlights/${id}`, data),
  deleteHighlight: (id) => api.delete(`/highlights/${id}`),

  admin: {
    getMilestones: async () => ({ data: [] }),
    getGuides: async () => ({ data: [] }),
    getContents: async (milestoneId) => ({ data: [] }),
    createMilestone: async (data) => ({ data: {} }),
    deleteMilestone: async (id) => ({ data: {} }),
    createContent: async (data) => ({ data: {} }),
    deleteContent: async (id) => ({ data: {} })
  }
};
