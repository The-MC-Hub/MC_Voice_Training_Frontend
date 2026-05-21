import axios from "axios";

const AI_URL = import.meta.env.VITE_AI_API_URL || "http://127.0.0.1:8001";

const aiApi = axios.create({
  baseURL: AI_URL,
  timeout: 30000,
});

export const analyzeVoice = async (audioBlob, scriptText) => {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.wav");
  formData.append("script_origin", scriptText);

  const response = await aiApi.post("/analyze-voice", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  console.log("AI Analysis Response:", response.data);

  return response.data;
};

export default aiApi;
