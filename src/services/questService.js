import api from './api';

export const questService = {
  getProgress: () => api.get('/quests/progress'),
  completeQuest: (questId) => api.post(`/quests/complete/${questId}`),
  claimVoucher: () => api.post('/quests/claim-voucher'),
};
