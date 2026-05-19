import { useState } from "react";
import "./App.css";

function App() {
  const [topic, setTopic] = useState("");
  const [studyPlan, setStudyPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfStatus, setPdfStatus] = useState("");
  const [pdfQuestion, setPdfQuestion] = useState("");
  const [pdfAnswer, setPdfAnswer] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const studyTopic = async () => {
    if (!topic.trim()) return;
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`http://127.0.0.1:8000/study?topic=${topic}`);
      const data = await response.json();
      setStudyPlan(data);
      setHistory((prev) => [topic, ...prev]);
    } catch (err) {
      setError("⚠️ Could not connect to backend. Is FastAPI running?");
    } finally {
      setLoading(false);
    }
  };

  const askAI = async () => {
    if (!question.trim()) return;
    try {
      setAskLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/ask?question=${question}`);
      const data = await response.json();
      setAnswer(data.answer);
      setQuestionHistory((prev) => [question, ...prev]);
    } catch (err) {
      setAnswer("⚠️ Could not reach backend.");
    } finally {
      setAskLoading(false);
    }
  };

  const clearAll = () => {
    setTopic("");
    setStudyPlan(null);
    setError("");
    setHistory([]);
    setQuestion("");
    setAnswer("");
    setQuestionHistory([]);
  };

  const uploadPDF = async () => {
    if (!pdfFile) return;
    const formData = new FormData();
    formData.append("file", pdfFile);
    try {
      const res = await fetch("http://127.0.0.1:8000/upload-pdf", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      setPdfStatus(`✅ Uploaded! Pages: ${data.pages}`);
    } catch {
      setPdfStatus("❌ Upload failed.");
    }
  };

  const askPDF = async () => {
    if (!pdfQuestion.trim()) return;
    try {
      setPdfLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/ask-pdf?question=${pdfQuestion}`);
      const data = await res.json();
      setPdfAnswer(data.answer);
    } catch {
      setPdfAnswer("❌ Could not reach backend.");
    } finally {
      setPdfLoading(false);
    }
  };


  const generateQuiz = async () => {
    try {
        setQuizLoading(true);
        setQuizError("");
        setQuiz([]);
        setSelectedAnswers({});
        setQuizSubmitted(false);
        const res = await fetch("http://127.0.0.1:8000/generate-quiz");
        const data = await res.json();
        if (data.error) {
            setQuizError(data.error);
        } else {
            setQuiz(data.quiz);
        }
    } catch {
        setQuizError("❌ Could not generate quiz.");
    } finally {
        setQuizLoading(false);
    }
};

const handleOptionSelect = (questionIndex, option) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: option }));
};

const submitQuiz = () => {
    if (Object.keys(selectedAnswers).length < quiz.length) {
        alert("Please answer all questions before submitting.");
        return;
    }
    setQuizSubmitted(true);
};



  return (
    <div className="App">

      <h1>🎓 Smart Study AI</h1>
      <p className="subtitle">Your personal AI-powered study planner</p>

      <div className="card">
        <h2>📚 Get Study Plan</h2>
        <input
          type="text"
          placeholder="Enter topic (e.g. react, dbms, ai)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") studyTopic(); }}
        />
        <div className="button-row">
          <button onClick={studyTopic} disabled={loading}>
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

      <div className="card">
        <h2>📄 Ask from Your Notes</h2>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setPdfFile(e.target.files[0])}
        />
        <div className="button-row">
          <button onClick={uploadPDF}>Upload PDF</button>
        </div>
        {pdfStatus && <p className="success">{pdfStatus}</p>}
        <input
          type="text"
          placeholder="Ask a question from your notes..."
          value={pdfQuestion}
          onChange={(e) => setPdfQuestion(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") askPDF(); }}
        />
        <div className="button-row">
          <button onClick={askPDF} disabled={pdfLoading}>
            {pdfLoading ? "Thinking..." : "Ask Notes"}
          </button>
        </div>
        {pdfAnswer && (
          <div className="result-box">
            <p>{pdfAnswer}</p>
          </div>
        )}
      </div>




      <div className="card">
    <h2>🧠 Quiz from Notes</h2>
    <p style={{color: "#6b7280", fontSize: "14px"}}>Upload a PDF above first, then generate quiz</p>
    <div className="button-row">
        <button onClick={generateQuiz} disabled={quizLoading}>
            {quizLoading ? "Generating..." : "Generate Quiz"}
        </button>
    </div>

    {quizError && <p className="error">{quizError}</p>}

    {quiz.length > 0 && (
        <div style={{marginTop: "16px"}}>
            {quiz.map((q, qi) => (
                <div key={qi} style={{marginBottom: "20px", padding: "16px", background: "#f8faff", borderRadius: "10px"}}>
                    <p style={{fontWeight: "bold", marginBottom: "10px"}}>{qi + 1}. {q.question}</p>
                    {q.options.map((option, oi) => {
                        let bg = "#fff";
                        if (quizSubmitted) {
                            if (option === q.answer) bg = "#dcfce7";
                            else if (option === selectedAnswers[qi]) bg = "#fee2e2";
                        } else if (selectedAnswers[qi] === option) {
                            bg = "#ede9fe";
                        }
                        return (
                            <div
                                key={oi}
                                onClick={() => handleOptionSelect(qi, option)}
                                style={{
                                    padding: "8px 12px",
                                    marginBottom: "6px",
                                    borderRadius: "8px",
                                    border: "1px solid #e2e8f0",
                                    cursor: quizSubmitted ? "default" : "pointer",
                                    background: bg,
                                    transition: "background 0.2s"
                                }}
                            >
                                {option}
                            </div>
                        );
                    })}
                    {quizSubmitted && (
                        <p style={{fontSize: "13px", color: "#16a34a", marginTop: "6px"}}>
                            ✅ Correct: {q.answer}
                        </p>
                    )}
                </div>
            ))}
            {!quizSubmitted && (
                <button onClick={submitQuiz}>Submit Quiz</button>
            )}
            {quizSubmitted && (
                <p style={{color: "#4f46e5", fontWeight: "bold"}}>
                    Score: {quiz.filter((q, i) => selectedAnswers[i] === q.answer).length} / {quiz.length}
                </p>
            )}
        </div>
    )}
</div>

    </div>
  );
}

export default App;