const BASE_URL = process.env.REACT_APP_API_URL;

const fetchWithWakeup = async (url, options = {}, onSlow) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
        if (onSlow) onSlow();
    }, 4000);
    try {
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeout);
        return res;
    } catch (e) {
        clearTimeout(timeout);
        throw e;
    }
};

export const fetchStudyPlan = async (topic, onSlow) => {
    const res = await fetchWithWakeup(`${BASE_URL}/study?topic=${encodeURIComponent(topic)}`, {}, onSlow);
    if (!res.ok) throw new Error("Failed to fetch study plan");
    return res.json();
};

export const fetchAskAI = async (question, onSlow, model = "llama-3.3-70b-versatile") => {
    const res = await fetchWithWakeup(`${BASE_URL}/ask?question=${encodeURIComponent(question)}&model=${model}`, {}, onSlow);
    if (!res.ok) throw new Error("Failed to get answer");
    return res.json();
};

export const fetchUploadPDF = async (file, onSlow) => {
    const formData = new FormData();
    formData.append("file", file);
    const username = localStorage.getItem("username") || "";
    const res = await fetchWithWakeup(`${BASE_URL}/upload-pdf?username=${username}`, { method: "POST", body: formData }, onSlow);
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
};

export const fetchAskPDF = async (question, onSlow) => {
    const username = localStorage.getItem("username") || "";
    const res = await fetchWithWakeup(`${BASE_URL}/ask-pdf?question=${encodeURIComponent(question)}&username=${username}`, {}, onSlow);
    if (!res.ok) throw new Error("Failed to get answer from notes");
    return res.json();
};

export const fetchGenerateQuiz = async (onSlow, difficulty = "Medium") => {
    const username = localStorage.getItem("username") || "";
    const res = await fetchWithWakeup(`${BASE_URL}/generate-quiz?username=${username}&difficulty=${difficulty}`, {}, onSlow);
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail);
    }
    return res.json();
};

export const fetchGenerateFlashcards = async (onSlow) => {
    const username = localStorage.getItem("username") || "";
    const res = await fetchWithWakeup(`${BASE_URL}/generate-flashcards?username=${username}`, {}, onSlow);
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
    await fetch(`${BASE_URL}/logout`, { method: "POST", credentials: "include" });
};

export const getMe = async () => {
    const res = await fetch(`${BASE_URL}/me`, { credentials: "include" });
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
};

export const saveStudyPlan = async (topic, difficulty, tasks) => {
    const username = localStorage.getItem("username");
    const res = await fetch(`${BASE_URL}/save-study-plan?username=${username}&topic=${encodeURIComponent(topic)}&difficulty=${encodeURIComponent(difficulty)}&tasks=${encodeURIComponent(tasks)}`, {
        method: "POST", credentials: "include"
    });
    if (!res.ok) throw new Error("Failed to save study plan");
    return res.json();
};

export const saveQuizScore = async (score, total) => {
    const username = localStorage.getItem("username");
    const res = await fetch(`${BASE_URL}/save-quiz-score?username=${username}&score=${score}&total=${total}`, {
        method: "POST", credentials: "include"
    });
    if (!res.ok) throw new Error("Failed to save quiz score");
    return res.json();
};

export const fetchDashboard = async (onSlow) => {
    const username = localStorage.getItem("username");
    const res = await fetchWithWakeup(`${BASE_URL}/dashboard?username=${username}`, { credentials: "include" }, onSlow);
    if (!res.ok) throw new Error("Failed to fetch dashboard");
    return res.json();
};

export const fetchGenerateNotes = async (topic, onSlow) => {
    const res = await fetchWithWakeup(`${BASE_URL}/generate-notes?topic=${encodeURIComponent(topic)}`, {}, onSlow);
    if (!res.ok) throw new Error("Failed to generate notes");
    return res.json();
};