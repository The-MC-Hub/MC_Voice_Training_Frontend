import api from "./api";

export const getPracticeStats = async () => {
  const response = await api.get("/users/me/practice-stats");
  return response.data;
};
