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
        credentials: "include",
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
        credentials: "include",
        body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail);
    }
    return res.json();
};

export const logoutUser = async () => {
    await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        credentials: "include"
    });
};

export const getMe = async () => {
    const res = await fetch(`${BASE_URL}/me`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
};

export const saveStudyPlan = async (topic, difficulty, tasks) => {
    const res = await fetch(`${BASE_URL}/save-study-plan?topic=${encodeURIComponent(topic)}&difficulty=${encodeURIComponent(difficulty)}&tasks=${encodeURIComponent(tasks)}`, {
        method: "POST",
        credentials: "include"
    });
    if (!res.ok) throw new Error("Failed to save study plan");
    return res.json();
};

export const saveQuizScore = async (score, total) => {
    const res = await fetch(`${BASE_URL}/save-quiz-score?score=${score}&total=${total}`, {
        method: "POST",
        credentials: "include"
    });
    if (!res.ok) throw new Error("Failed to save quiz score");
    return res.json();
};

export const fetchDashboard = async () => {
    const res = await fetch(`${BASE_URL}/dashboard`, {
        credentials: "include"
    });
    if (!res.ok) throw new Error("Failed to fetch dashboard");
    return res.json();
};