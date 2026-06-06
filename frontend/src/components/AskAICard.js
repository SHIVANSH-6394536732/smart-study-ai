import { useState, useRef } from "react";
import { fetchAskAI } from "../services/api";
import { toast } from "react-toastify";

function AskAICard() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [askLoading, setAskLoading] = useState(false);
    const [questionHistory, setQuestionHistory] = useState([]);
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const recognitionRef = useRef(null);

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Voice input not supported in this browser. Use Chrome.");
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
            toast.error("Voice input failed. Please try again.");
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setQuestion(transcript);
            toast.info(`Heard: "${transcript}"`);
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
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setSpeaking(false);
    };

    const askAI = async () => {
        if (!question.trim()) return;
        try {
            setAskLoading(true);
            setAnswer("");
            stopSpeaking();
            const data = await fetchAskAI(question);
            setAnswer(data.answer);
            setQuestionHistory((prev) => [question, ...prev]);
            if (voiceEnabled) speakAnswer(data.answer);
        } catch {
            setAnswer("⚠️ Could not reach backend.");
            toast.error("Could not reach backend.");
        } finally {
            setAskLoading(false);
        }
    };

    return (
        <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h2 style={{ margin: 0 }}>🤖 Ask AI</h2>
                <button
                    onClick={() => { setVoiceEnabled(!voiceEnabled); stopSpeaking(); }}
                    style={{
                        background: voiceEnabled ? "#4f46e5" : "#e2e8f0",
                        color: voiceEnabled ? "white" : "#6b7280",
                        border: "none",
                        borderRadius: "20px",
                        padding: "6px 14px",
                        fontSize: "12px",
                        cursor: "pointer"
                    }}
                >
                    {voiceEnabled ? "🔊 Voice On" : "🔇 Voice Off"}
                </button>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                    type="text"
                    placeholder="Ask a study question or press 🎤 to speak..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") askAI(); }}
                    style={{ flex: 1 }}
                />
                <button
                    onClick={listening ? stopListening : startListening}
                    style={{
                        background: listening ? "#ef4444" : "#4f46e5",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "42px",
                        height: "42px",
                        fontSize: "18px",
                        cursor: "pointer",
                        animation: listening ? "pulse 1s infinite" : "none",
                        flexShrink: 0
                    }}
                    title={listening ? "Stop listening" : "Start voice input"}
                >
                    {listening ? "⏹️" : "🎤"}
                </button>
            </div>

            {listening && (
                <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "6px", animation: "pulse 1s infinite" }}>
                    🔴 Listening... speak now
                </p>
            )}

            <div className="button-row" style={{ marginTop: "10px" }}>
                <button onClick={askAI} disabled={askLoading}>
                    {askLoading ? "Thinking..." : "Ask"}
                </button>
                {speaking && (
                    <button onClick={stopSpeaking} style={{ background: "#ef4444", color: "white" }}>
                        ⏹ Stop Speaking
                    </button>
                )}
            </div>

            {answer && (
                <div className="result-box">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <p style={{ margin: 0, flex: 1 }}>{answer}</p>
                        <button
                            onClick={() => speakAnswer(answer)}
                            style={{
                                background: "none",
                                border: "none",
                                fontSize: "18px",
                                cursor: "pointer",
                                marginLeft: "8px",
                                opacity: speaking ? 0.5 : 1
                            }}
                            title="Read answer aloud"
                        >
                            🔊
                        </button>
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
                                style={{ cursor: "pointer" }}
                                title="Click to reuse"
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default AskAICard;