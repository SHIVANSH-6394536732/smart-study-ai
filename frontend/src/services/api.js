const BASE_URL = process.env.REACT_APP_API_URL;

export const fetchStudyPlan = async (topic) => {
    const res = await fetch(`${BASE_URL}/study?topic=${topic}`);
    if (!res.ok) throw new Error("Failed to fetch study plan");
    return res.json();
};

export const fetchAskAI = async (question) => {
    const res = await fetch(`${BASE_URL}/ask?question=${question}`);
    if (!res.ok) throw new Error("Failed to get answer");
    return res.json();
};

export const fetchUploadPDF = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/upload-pdf`, {
        method: "POST",
        body: formData
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
};

export const fetchAskPDF = async (question) => {
    const res = await fetch(`${BASE_URL}/ask-pdf?question=${question}`);
    if (!res.ok) throw new Error("Failed to get answer from notes");
    return res.json();
};

export const fetchGenerateQuiz = async () => {
    const res = await fetch(`${BASE_URL}/generate-quiz`);
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail);
    }
    return res.json();
};

export const fetchGenerateFlashcards = async () => {
    const res = await fetch(`${BASE_URL}/generate-flashcards`);
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail);
    }
    return res.json();
};
export const registerUser = async (username, password) => {
    const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail);
    }
    return res.json();
};

export const loginUser = async (username, password) => {
    const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail);
    }
    return res.json();
};