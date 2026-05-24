import { useState } from "react";

function AskAICard() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [askLoading, setAskLoading] = useState(false);
    const [questionHistory, setQuestionHistory] = useState([]);

    const askAI = async () => {
        if (!question.trim()) return;
        try {
            setAskLoading(true);
            const res = await fetch(`${process.env.REACT_APP_API_URL}/ask?question=${question}`);
            const data = await res.json();
            setAnswer(data.answer);
            setQuestionHistory((prev) => [question, ...prev]);
        } catch {
            setAnswer("⚠️ Could not reach backend.");
        } finally {
            setAskLoading(false);
        }
    };

    return (
        <div className="card">
            <h2>🤖 Ask AI</h2>
            <input
                type="text"
                placeholder="Ask a study question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") askAI(); }}
            />
            <div className="button-row">
                <button onClick={askAI} disabled={askLoading}>
                    {askLoading ? "Thinking..." : "Ask"}
                </button>
            </div>
            {answer && (
                <div className="result-box">
                    <p>{answer}</p>
                </div>
            )}
            {questionHistory.length > 0 && (
                <div className="history-box">
                    <h4>🕘 Recent Questions</h4>
                    <ul>
                        {questionHistory.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default AskAICard;