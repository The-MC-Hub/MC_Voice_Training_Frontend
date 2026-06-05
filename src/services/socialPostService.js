import api from "./api";

export const fetchActiveSocialPosts = async () => {
  const res = await api.get("/social-posts");
  return res.data.data;
};

// Admin endpoints (require ADMIN JWT)
export const adminFetchSocialPosts = async () => {
  const res = await api.get("/admin/social-posts");
  return res.data.data;
};

export const adminCreateSocialPost = async (payload) => {
  const res = await api.post("/admin/social-posts", payload);
  return res.data.data;
};

export const adminUpdateSocialPost = async (id, payload) => {
  const res = await api.put(`/admin/social-posts/${id}`, payload);
  return res.data.data;
};

export const adminDeleteSocialPost = async (id) => {
  await api.delete(`/admin/social-posts/${id}`);
};

export const adminToggleSocialPost = async (id) => {
  const res = await api.patch(`/admin/social-posts/${id}/toggle`);
  return res.data.data;
};

export const recordSocialPostClick = async (id) => {
  try { await api.post(`/social-posts/${id}/click`); } catch {}
};
