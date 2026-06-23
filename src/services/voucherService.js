import api from './api';

export const voucherService = {
  getMyVouchers: () => api.get('/vouchers/my'),
  getAvailableVouchers: () => api.get('/vouchers/my/available'),
};
