import { useState } from "react";
import { fetchGenerateQuiz, saveQuizScore } from "../services/api";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";


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

    const submitQuiz = async () => {
        if (Object.keys(selectedAnswers).length < quiz.length) {
            toast.warning("Please answer all questions before submitting.");
            return;
        }
        setQuizSubmitted(true);
        const score = quiz.filter((q, i) => selectedAnswers[i] === q.answer).length;
        toast.info(`Quiz submitted! Score: ${score}/${quiz.length}`);
        try {
            await saveQuizScore(score, quiz.length);
        } catch {
            // silent fail
        }
    };
    const downloadQuiz = () => {
        const pdf = new jsPDF();
        pdf.setFontSize(18);
        pdf.setTextColor(79, 70, 229);
        pdf.text("Smart Study AI — Quiz", 20, 20);
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128);
        pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);
        pdf.setDrawColor(226, 232, 240);
        pdf.line(20, 34, 190, 34);
    
        let y = 44;
        quiz.forEach((q, qi) => {
            pdf.setFontSize(11);
            pdf.setTextColor(30, 27, 75);
            const questionLines = pdf.splitTextToSize(`${qi + 1}. ${q.question}`, 170);
            pdf.text(questionLines, 20, y);
            y += questionLines.length * 7;
    
            q.options.forEach((option) => {
                pdf.setFontSize(10);
                pdf.setTextColor(55, 65, 81);
                const optLines = pdf.splitTextToSize(`   ${option}`, 165);
                pdf.text(optLines, 20, y);
                y += optLines.length * 6;
            });
    
            pdf.setTextColor(22, 163, 74);
            pdf.text(`   ✓ Answer: ${q.answer}`, 20, y);
            y += 10;
    
            if (y > 270) { pdf.addPage(); y = 20; }
        });
    
        pdf.save("SmartStudyAI_Quiz.pdf");
        toast.success("Quiz downloaded as PDF!");
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
                        <div style={{display: "flex", gap: "10px", alignItems: "center", marginTop: "8px"}}>
                            <p style={{color: "#4f46e5", fontWeight: "bold", margin: 0}}>
                                Score: {quiz.filter((q, i) => selectedAnswers[i] === q.answer).length} / {quiz.length}
                            </p>
                            <button onClick={downloadQuiz} style={{background: "#10b981", color: "white", border: "none", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontSize: "14px"}}>
                                ⬇️ Download Quiz PDF
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default QuizCard;