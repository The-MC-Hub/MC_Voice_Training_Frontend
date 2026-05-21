import api from "../services/api";

export const fetchLessons = async (category = null) => {
    const url = category ? `/voice/lessons?category=${category}` : '/voice/lessons';
    const response = await api.get(url);
    return response.data.data;
};

export const fetchLessonById = async (id) => {
    const response = await api.get(`/voice/lessons/${id}`);
    return response.data.data;
};

export const analyzePractice = async (lessonId, userId, audioFile) => {
    const formData = new FormData();
    formData.append('lessonId', lessonId);
    formData.append('userId', userId);
    // Give the blob a real filename so Python can detect the audio format
    const ext = audioFile.type?.includes('ogg') ? 'ogg' : 'webm';
    formData.append('audioFile', audioFile, `recording.${ext}`);

    const response = await api.post('/voice/practice/analyze-voice', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
    });
    return response.data.data;
};

export const fetchPracticeHistory = async (userId) => {
    if (!userId || userId === "undefined") {
        return [];
    }
    const response = await api.get(`/voice/practice/history/${userId}`);
    return response.data.data;
};

export const fetchPracticeById = async (id) => {
    const response = await api.get(`/voice/practice/${id}`);
    return response.data.data;
};
