import api from './api';

export const academyService = {
  getRoadmap: () => api.get('/courses/roadmap'),
  getAllCourses: (type) => api.get('/courses', { params: type ? { type } : {} }),
  getCourseDetail: (id) => api.get(`/courses/${id}`),
  enrollCourse: (id) => api.post(`/courses/${id}/enroll`),
  completeLesson: (courseId, lessonId) => api.post(`/courses/${courseId}/lessons/${lessonId}/complete`),
  completeReading: (courseId, readingId) => api.post(`/courses/${courseId}/readings/${readingId}/complete`),
  submitQuiz: (courseId, answers) => api.post(`/courses/${courseId}/quiz/submit`, { answers }),
  getReadingGuide: (id) => api.get(`/courses/reading-guides/${id}`),
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
