import api from "./api";

const BASE = "/admin/email";

export const fetchTemplates = () => api.get(`${BASE}/templates`).then(r => r.data.data);
export const createTemplate = (payload) => api.post(`${BASE}/templates`, payload).then(r => r.data.data);
export const updateTemplate = (id, payload) => api.put(`${BASE}/templates/${id}`, payload).then(r => r.data.data);
export const deleteTemplate = (id) => api.delete(`${BASE}/templates/${id}`);

export const sendCampaign = (payload) =>
  api.post(`${BASE}/campaigns/send`, payload).then(r => r.data.data);
export const countRecipients = (payload) =>
  api.post(`${BASE}/campaigns/count-recipients`, payload).then(r => r.data.data);
export const previewRecipients = (payload) =>
  api.post(`${BASE}/campaigns/preview-recipients`, payload).then(r => r.data.data);
export const fetchCampaigns = () => api.get(`${BASE}/campaigns`).then(r => r.data.data);
export const fetchCampaignLogs = (id) => api.get(`${BASE}/campaigns/${id}/logs`).then(r => r.data.data);

export const sendTestMail = (templateId, testEmail) =>
  api.post(`${BASE}/test-send`, { templateId, testEmail });
