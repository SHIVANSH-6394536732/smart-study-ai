import { useState } from "react";
import "./App.css";

function App() {
  const [topic, setTopic] = useState("");
  const [studyPlan, setStudyPlan] = useState(null);   // renamed: clearer than "message"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");              // NEW: dedicated error state
  const [history, setHistory] = useState([]);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [askLoading, setAskLoading] = useState(false); // NEW: separate loading for Ask
  const [questionHistory, setQuestionHistory] = useState([]);

  // ── Study Plan ──────────────────────────────────────────
  const studyTopic = async () => {
    if (!topic.trim()) return;          // guard: don't fetch empty input
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`http://127.0.0.1:8000/study?topic=${topic}`);
      const data = await response.json();
      setStudyPlan(data);
      setHistory((prev) => [topic, ...prev]); // newest first
    } catch (err) {
      setError("⚠️ Could not connect to backend. Is FastAPI running?");
    } finally {
      setLoading(false);
    }
  };

  // ── Ask AI ───────────────────────────────────────────────
  const askAI = async () => {
    if (!question.trim()) return;       // guard: don't fetch empty input
    try {
      setAskLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/ask?question=${question}`);
      const data = await response.json();
      setAnswer(data.answer);
      setQuestionHistory((prev) => [question, ...prev]); // newest first
    } catch (err) {
      setAnswer("⚠️ Could not reach backend.");
    } finally {
      setAskLoading(false);
    }
  };

  // ── Clear All ────────────────────────────────────────────
  const clearAll = () => {
    setTopic("");
    setStudyPlan(null);
    setError("");
    setHistory([]);
    setQuestion("");
    setAnswer("");
    setQuestionHistory([]);
  };

  // ── Enter key support ────────────────────────────────────
  const handleTopicKey = (e) => { if (e.key === "Enter") studyTopic(); };
  const handleAskKey   = (e) => { if (e.key === "Enter") askAI(); };

  return (
    <div className="App">

      {/* ── Header ── */}
      <h1>🎓 Smart Study AI</h1>
      <p className="subtitle">Your personal AI-powered study planner</p>

      {/* ── Study Plan Section ── */}
      <div className="card">
        <h2>📚 Get Study Plan</h2>
        <input
          type="text"
          placeholder="Enter topic (e.g. react, dbms, ai)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleTopicKey}
        />
        <div className="button-row">
          <button onClick={studyTopic} disabled={loading}>
            {loading ? "Loading..." : "Get Plan"}
          </button>
          <button className="btn-clear" onClick={clearAll}>
            Clear
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {studyPlan && (
          <div className="result-box">
            <h3>{studyPlan.topic.toUpperCase()}</h3>
            <p className="difficulty">Difficulty: <strong>{studyPlan.difficulty}</strong></p>
            <ul className="task-list">
              {studyPlan.tasks.map((task, index) => (
                <li key={index}>{task}</li>
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

      {/* ── Ask AI Section ── */}
      <div className="card">
        <h2>🤖 Ask AI</h2>
        <input
          type="text"
          placeholder="Ask a study question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleAskKey}
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

    </div>
  );
}

export default App;