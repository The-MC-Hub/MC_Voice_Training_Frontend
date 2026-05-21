import api from "./api";







export const createReport = async (reportData) => {
  const response = await api.post("/reports", reportData);
  return response.data.data;
};


export const getMyReports = async () => {
  const response = await api.get("/reports/my");
  return response.data.data;
};


export const getAllReportsAdmin = async (status = "") => {
  const params = status ? { status } : {};
  const response = await api.get("/reports/admin", { params });
  return response.data.data;
};


export const resolveReport = async (id, status, adminNote = "") => {
  const response = await api.put(`/reports/${id}/resolve`, {
    status,
    adminNote,
  });
  return response.data.data;
};
