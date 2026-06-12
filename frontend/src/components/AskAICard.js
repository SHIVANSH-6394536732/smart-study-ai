import { useState, useRef, useEffect } from "react";
import { fetchAskAI } from "../services/api";
import { toast } from "react-toastify";
const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile");

function AskAICard() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [askLoading, setAskLoading] = useState(false);
    const [questionHistory, setQuestionHistory] = useState([]);
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.warning("🎤 Voice input requires Chrome or Edge browser.", { autoClose: 8000 });
        }
    }, []);

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Voice input not supported. Please use Chrome or Edge.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;

        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);
        recognition.onerror = () => {
            setListening(false);
            setQuestion("");
            toast.error("Voice input failed. Please try again.");
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setQuestion(transcript);
            toast.info(`🎤 Heard: "${transcript}"`);
        };
        recognition.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setListening(false);
        }
    };

    const speakAnswer = (text) => {
        if (!voiceEnabled) return;
        window.speechSynthesis.cancel();
    
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        utterance.rate = 0.92;
        utterance.pitch = 1.05;
        utterance.volume = 1;
    
        const setVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            const preferred = voices.find(v => v.name === "Google US English")
                || voices.find(v => v.name === "Samantha")
                || voices.find(v => v.name === "Daniel")
                || voices.find(v => v.name.includes("Google") && v.lang === "en-US")
                || voices.find(v => v.lang === "en-US" && !v.name.includes("Microsoft"))
                || voices.find(v => v.lang.startsWith("en"));
            if (preferred) utterance.voice = preferred;
            utterance.onstart = () => setSpeaking(true);
            utterance.onend = () => setSpeaking(false);
            utterance.onerror = () => setSpeaking(false);
            window.speechSynthesis.speak(utterance);
        };
    
        if (window.speechSynthesis.getVoices().length > 0) {
            setVoice();
        } else {
            window.speechSynthesis.onvoiceschanged = setVoice;
        }
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setSpeaking(false);
    };

    const askAI = async () => {
        if (!question.trim()) { toast.error("❌ Please enter a question."); return; }
        if (question.trim().length > 500) { toast.error("❌ Question must be under 500 characters."); return; }
        try {
            setAskLoading(true);
            setAnswer("");
            stopSpeaking();
            const data = await fetchAskAI(question, () =>
                toast.info("⏳ Backend is waking up...", { autoClose: 10000 }),
                selectedModel
            );
            setAnswer(data.answer);
            setQuestionHistory((prev) => [question, ...prev.slice(0, 4)]);
            if (voiceEnabled) speakAnswer(data.answer);
        } catch {
            setAnswer("⚠️ Something went wrong. Please try again.");
            toast.error("Could not get an answer. Please try again.");
        } finally {
            setAskLoading(false);
        }
    };

    return (
        <div className="card">
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 22px 0 22px"
            }}>
                <h2 style={{ margin: 0 }}>🤖 Ask AI</h2>
                <button
                    onClick={() => { setVoiceEnabled(!voiceEnabled); stopSpeaking(); }}
                    style={{
                        background: voiceEnabled
                            ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                            : "var(--glass-bg)",
                        color: voiceEnabled ? "white" : "var(--text-secondary)",
                        border: voiceEnabled ? "none" : "1px solid var(--glass-border)",
                        borderRadius: "20px",
                        padding: "6px 14px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontWeight: "600",
                        boxShadow: voiceEnabled ? "0 4px 12px rgba(99,102,241,0.3)" : "none"
                    }}
                >
                    {voiceEnabled ? "🔊 Voice On" : "🔇 Voice Off"}
                </button>
                <div style={{ display: "flex", gap: "6px", padding: "0 22px 12px", flexWrap: "wrap" }}>
                {[
                    { id: "llama-3.3-70b-versatile", label: "🧠 Smart", desc: "Most accurate" },
                    { id: "llama-3.1-8b-instant", label: "⚡ Fast", desc: "Quick answers" },
                    { id: "gemma2-9b-it", label: "💎 Gemma", desc: "Google's model" }
                ].map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setSelectedModel(m.id)}
                        title={m.desc}
                        style={{
                            padding: "5px 12px",
                            fontSize: "11px",
                            fontWeight: "600",
                            background: selectedModel === m.id ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "var(--glass-bg)",
                            color: selectedModel === m.id ? "white" : "var(--text-secondary)",
                            border: selectedModel === m.id ? "none" : "1px solid var(--glass-border)",
                            boxShadow: "none",
                            borderRadius: "20px"
                        }}
                    >
                        {m.label}
                    </button>
                ))}
            </div>
            </div>

            <div style={{ padding: "12px 22px 22px 22px" }}>
                <div style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    width: "100%"
                }}>
                    <input
                        type="text"
                        placeholder="Ask a study question or press 🎤 to speak..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") askAI(); }}
                        style={{ flex: 1, minWidth: 0, marginTop: 0 }}
                    />
                    <button
                        onClick={listening ? stopListening : startListening}
                        style={{
                            background: listening
                                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                                : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "44px",
                            height: "44px",
                            minWidth: "44px",
                            fontSize: "18px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: listening
                                ? "0 0 0 4px rgba(239,68,68,0.3)"
                                : "0 4px 12px rgba(99,102,241,0.4)",
                            animation: listening ? "pulse 1s infinite" : "none",
                            padding: 0
                        }}
                        title={listening ? "Stop listening" : "Start voice input"}
                    >
                        {listening ? "⏹" : "🎤"}
                    </button>
                </div>

                {listening && (
                    <p style={{
                        color: "#ef4444",
                        fontSize: "13px",
                        marginTop: "8px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                    }}>
                        <span style={{ animation: "pulse 1s infinite", display: "inline-block" }}>🔴</span>
                        Listening... speak now
                    </p>
                )}

                <div className="button-row">
                    <button onClick={askAI} disabled={askLoading}>
                        {askLoading ? "⏳ Thinking..." : "Ask"}
                    </button>
                    {speaking && (
                        <button
                            onClick={stopSpeaking}
                            style={{
                                background: "linear-gradient(135deg, #ef4444, #dc2626)"
                            }}
                        >
                            ⏹ Stop Speaking
                        </button>
                    )}
                </div>

                {answer && (
                    <div className="result-box">
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "8px"
                        }}>
                            <p style={{ margin: 0, flex: 1, lineHeight: "1.7" }}>{answer}</p>
                            <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                                <button
                                    onClick={() => speakAnswer(answer)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        fontSize: "16px",
                                        cursor: "pointer",
                                        boxShadow: "none",
                                        padding: "4px",
                                        opacity: speaking ? 0.5 : 1,
                                        color: "var(--text-secondary)"
                                    }}
                                    title="Read aloud"
                                >
                                    🔊
                                </button>
                                <button
                                    onClick={() => { navigator.clipboard.writeText(answer); toast.success("📋 Copied!"); }}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        fontSize: "16px",
                                        cursor: "pointer",
                                        boxShadow: "none",
                                        padding: "4px",
                                        color: "var(--text-secondary)"
                                    }}
                                    title="Copy to clipboard"
                                >
                                    📋
                                </button>
                                <button
                                    onClick={() => {
                                        setAnswer("");
                                        setQuestion("");
                                        stopSpeaking();
                                    }}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        fontSize: "16px",
                                        cursor: "pointer",
                                        boxShadow: "none",
                                        padding: "4px",
                                        color: "var(--text-muted)"
                                    }}
                                    title="Clear"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {questionHistory.length > 0 && (
                    <div className="history-box">
                        <h4>🕘 Recent Questions</h4>
                        <ul>
                            {questionHistory.map((item, index) => (
                                <li
                                    key={index}
                                    onClick={() => setQuestion(item)}
                                    title="Click to reuse"
                                >
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
}

export default AskAICard;

