import { useState } from "react";
import { fetchGenerateQuiz } from "../services/api";

function QuizCard() {
    const [quiz, setQuiz] = useState([]);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizError, setQuizError] = useState("");
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);

    const generateQuiz = async () => {
        try {
            setQuizLoading(true);
            setQuizError("");
            setQuiz([]);
            setSelectedAnswers({});
            setQuizSubmitted(false);
            const data = await fetchGenerateQuiz();
            setQuiz(data.quiz);
        } catch (err) {
            setQuizError(`❌ ${err.message}`);
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
        <div className="card">
            <h2>🧠 Quiz from Notes</h2>
            <p style={{color: "#6b7280", fontSize: "14px"}}>Upload a PDF above first, then generate quiz</p>
            <div className="button-row">
                <button onClick={generateQuiz} disabled={quizLoading}>
                    {quizLoading ? "⏳ Generating quiz..." : "Generate Quiz"}
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
    );
}

export default QuizCard;