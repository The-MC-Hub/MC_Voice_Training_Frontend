import api from "../services/api";

export const fetchLessons = async (options = {}) => {
    const isLegacyCategory = typeof options === "string";
    const { category = null, search = null } = isLegacyCategory ? { category: options } : (options || {});
    const params = new URLSearchParams();

    if (category) {
        params.set("category", category);
    }

    if (search) {
        params.set("search", search);
    }

    const url = params.toString() ? `/voice/lessons?${params.toString()}` : '/voice/lessons';
    const response = await api.get(url);
    return response.data.data;
};

export const fetchFeaturedLessons = async (limit = 6) => {
    const response = await api.get(`/voice/lessons/featured?limit=${limit}`);
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

/**
 * Generate TTS audio from text via AI service.
 * Returns a Blob URL that can be set as <audio src>.
 * @param {string} text - script text to synthesize
 * @param {string} [voice='F1'] - voice id: M1-M5 or F1-F5
 * @returns {Promise<string>} object URL of WAV blob
 */
export const generateTTSAudio = async (text, voice = 'F1') => {
    const params = new URLSearchParams({ text, voice });
    const response = await api.post(
        `/voice/tts/generate?${params.toString()}`,
        null,
        { responseType: 'blob', timeout: 60000 }
    );
    return URL.createObjectURL(response.data);
};
