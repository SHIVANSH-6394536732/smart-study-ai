import { useState } from "react";
import { fetchStudyPlan, saveStudyPlan } from "../services/api";

function StudyPlanCard() {
    const [topic, setTopic] = useState("");
    const [studyPlan, setStudyPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [history, setHistory] = useState([]);

    const handleStudy = async () => {
        if (!topic.trim()) return;
        try {
            setLoading(true);
            setError("");
            const data = await fetchStudyPlan(topic);
            setStudyPlan(data);
            setHistory((prev) => [topic, ...prev]);
            try {
                await saveStudyPlan(data.topic, data.difficulty, JSON.stringify(data.tasks));
            } catch {
                // silent fail
            }
        } catch {
            setError("⚠️ Could not connect to backend. Is FastAPI running?");
        } finally {
            setLoading(false);
        }
    };

    const clearAll = () => {
        setTopic("");
        setStudyPlan(null);
        setError("");
        setHistory([]);
    };

    return (
        <div className="card">
            <h2>📚 Get Study Plan</h2>
            <input
                type="text"
                placeholder="Enter topic (e.g. react, dbms, ai)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleStudy(); }}
            />
            <div className="button-row">
                <button onClick={handleStudy} disabled={loading}>
                    {loading ? "Loading..." : "Get Plan"}
                </button>
                <button className="btn-clear" onClick={clearAll}>Clear</button>
            </div>

            {error && <p className="error">{error}</p>}

            {studyPlan && (
                <div className="result-box">
                    <h3>{studyPlan.topic.toUpperCase()}</h3>
                    <p className="difficulty">Difficulty: <strong>{studyPlan.difficulty}</strong></p>
                    <ul className="task-list">
                        {studyPlan.tasks.map((task, index) => (
                            <li key={index}>
                                <input type="checkbox" />
                                <span>{task}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {history.length > 0 && (
                <div className="history-box">
                    <h4>🕘 Recent Topics</h4>
                    <ul>
                        {history.map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default StudyPlanCard;