import axios from "axios";

const backendApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1",
  timeout: 30000,
});

backendApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const analyzeVoice = async (audioBlob, scriptText) => {
  const formData = new FormData();
  formData.append("audioFile", audioBlob, "recording.wav");
  if (scriptText) formData.append("scriptOrigin", scriptText);

  const response = await backendApi.post("/voice/proxy/analyze-voice", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export default backendApi;
