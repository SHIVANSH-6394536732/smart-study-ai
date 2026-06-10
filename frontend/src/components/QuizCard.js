import { useState, useEffect, useRef } from "react";
import { fetchGenerateQuiz, saveQuizScore } from "../services/api";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";

const TIMER_SECONDS = 30;

function QuizCard() {
    const [quiz, setQuiz] = useState([]);
    const [quizLoading, setQuizLoading] = useState(false);
    const [quizError, setQuizError] = useState("");
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
    const [timerActive, setTimerActive] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!timerActive || quizSubmitted) return;
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    if (currentQ < quiz.length - 1) {
                        setCurrentQ((q) => q + 1);
                        toast.warning("⏰ Time's up! Moving to next question.");
                        return TIMER_SECONDS;
                    } else {
                        clearInterval(timerRef.current);
                        setTimerActive(false);
                        handleAutoSubmit();
                        return 0;
                    }
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [timerActive, currentQ, quizSubmitted]);

    const handleAutoSubmit = async () => {
        setQuizSubmitted(true);
        const score = quiz.filter((q, i) => selectedAnswers[i] === q.answer).length;
        toast.info(`Quiz auto-submitted! Score: ${score}/${quiz.length}`);
        if (Object.keys(selectedAnswers).length > 0) {
            try { await saveQuizScore(score, quiz.length); } catch { }
        }
    };

    const generateQuiz = async () => {
        clearInterval(timerRef.current);
        try {
            setQuizLoading(true);
            setQuizError("");
            setQuiz([]);
            setSelectedAnswers({});
            setQuizSubmitted(false);
            setCurrentQ(0);
            setTimeLeft(TIMER_SECONDS);
            setTimerActive(false);
            const data = await fetchGenerateQuiz(() =>
                toast.info("⏳ Backend is waking up, please wait...", { autoClose: 10000 })
            );
            const fixedQuiz = data.quiz.map((q) => {
                const correct = q.answer;
                const shuffled = [...q.options].sort(() => Math.random() - 0.5);
                return { ...q, options: shuffled, answer: correct };
            });
            setQuiz(fixedQuiz);
            setTimerActive(true);
        } catch (err) {
            setQuizError("❌ Could not generate quiz. Please upload a PDF first and try again.");

        } finally {
            setQuizLoading(false);
        }
    };

    const handleOptionSelect = (option) => {
        if (quizSubmitted) return;
        setSelectedAnswers((prev) => ({ ...prev, [currentQ]: option }));
    };

    const nextQuestion = () => {
        if (currentQ < quiz.length - 1) {
            setCurrentQ((q) => q + 1);
            setTimeLeft(TIMER_SECONDS);
        }
    };

    const prevQuestion = () => {
        if (currentQ > 0) {
            setCurrentQ((q) => q - 1);
            setTimeLeft(TIMER_SECONDS);
        }
    };

    const submitQuiz = async () => {
        clearInterval(timerRef.current);
        setTimerActive(false);
        setQuizSubmitted(true);
        const score = quiz.filter((q, i) => selectedAnswers[i] === q.answer).length;
        toast.info(`Quiz submitted! Score: ${score}/${quiz.length}`);
        if (Object.keys(selectedAnswers).length > 0) {
            try { await saveQuizScore(score, quiz.length); } catch { }
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

    const timerColor = timeLeft <= 10 ? "#f87171" : timeLeft <= 20 ? "#fbbf24" : "#34d399";
    const timerPercent = (timeLeft / TIMER_SECONDS) * 100;

    return (
        <div className="card">
            <h2>🧠 Quiz from Notes</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                Upload a PDF above first, then generate quiz
            </p>
            <div className="button-row">
                <button onClick={generateQuiz} disabled={quizLoading}>
                    {quizLoading ? "⏳ Generating quiz..." : "Generate Quiz"}
                </button>
            </div>
            {quizError && <p className="error">{quizError}</p>}

            {quiz.length > 0 && !quizSubmitted && (
                <motion.div
                    key={currentQ}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ marginTop: "16px" }}
                >
                    {/* Progress + Timer */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>
                            Question {currentQ + 1} of {quiz.length}
                        </span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{
                                width: "80px", height: "6px",
                                background: "var(--glass-border)",
                                borderRadius: "10px", overflow: "hidden"
                            }}>
                                <div style={{
                                    width: `${timerPercent}%`,
                                    height: "100%",
                                    background: timerColor,
                                    borderRadius: "10px",
                                    transition: "width 1s linear, background 0.3s"
                                }} />
                            </div>
                            <span style={{ fontSize: "13px", fontWeight: "700", color: timerColor, minWidth: "28px" }}>
                                {timeLeft}s
                            </span>
                        </div>
                    </div>

                    {/* Question progress dots */}
                    <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                        {quiz.map((_, i) => (
                            <div key={i} onClick={() => { setCurrentQ(i); setTimeLeft(TIMER_SECONDS); }}
                                style={{
                                    width: "28px", height: "6px", borderRadius: "10px", cursor: "pointer",
                                    background: i === currentQ ? "var(--accent)" :
                                        selectedAnswers[i] ? "rgba(129,140,248,0.4)" : "var(--glass-border)",
                                    transition: "background 0.2s"
                                }}
                            />
                        ))}
                    </div>

                    {/* Question */}
                    <p style={{ fontWeight: "700", marginBottom: "14px", color: "var(--text-primary)", fontSize: "15px", lineHeight: "1.5" }}>
                        {currentQ + 1}. {quiz[currentQ].question}
                    </p>

                    {/* Options */}
                    {quiz[currentQ].options.map((option, oi) => (
                        <div
                            key={oi}
                            onClick={() => handleOptionSelect(option)}
                            className={`quiz-option ${selectedAnswers[currentQ] === option ? "selected" : ""}`}
                        >
                            {option}
                        </div>
                    ))}

                    {/* Navigation */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
                        <button onClick={prevQuestion} disabled={currentQ === 0}
                            style={{ background: "var(--glass-bg)", color: "var(--text-secondary)", border: "1px solid var(--glass-border)", boxShadow: "none" }}>
                            ← Prev
                        </button>
                        {currentQ < quiz.length - 1 ? (
                            <button onClick={nextQuestion}>Next →</button>
                        ) : (
                            <button onClick={submitQuiz}
                                style={{ background: "linear-gradient(135deg, #34d399, #10b981)" }}>
                                Submit Quiz ✓
                            </button>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Results */}
            {quizSubmitted && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: "16px" }}>
                    {/* Score Banner */}
                    <div style={{
                        background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))",
                        border: "1px solid rgba(129,140,248,0.3)",
                        borderRadius: "14px", padding: "16px",
                        textAlign: "center", marginBottom: "16px"
                    }}>
                        <p style={{ fontSize: "2rem", fontWeight: "800", color: "var(--accent)" }}>
                            {quiz.filter((q, i) => selectedAnswers[i] === q.answer).length}/{quiz.length}
                        </p>
                        <p style={{ color: "var(--text-secondary)", fontSize: "13px" }}>
                            {quiz.filter((q, i) => selectedAnswers[i] === q.answer).length === quiz.length ? "🎉 Perfect Score!" :
                                quiz.filter((q, i) => selectedAnswers[i] === q.answer).length >= 3 ? "👍 Good job!" : "📚 Keep studying!"}
                        </p>
                    </div>

                    {/* All questions review */}
                    {quiz.map((q, qi) => (
                        <div key={qi} style={{ marginBottom: "14px", padding: "14px", background: "var(--glass-bg)", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                            <p style={{ fontWeight: "700", marginBottom: "10px", color: "var(--text-primary)", fontSize: "14px" }}>
                                {qi + 1}. {q.question}
                            </p>
                            {q.options.map((option, oi) => (
                                <div key={oi} className={`quiz-option ${option === q.answer ? "correct" : option === selectedAnswers[qi] ? "wrong" : ""}`}
                                    style={{ cursor: "default" }}>
                                    {option}
                                </div>
                            ))}
                            <p style={{ fontSize: "12px", color: "var(--success)", marginTop: "8px", fontWeight: "600" }}>
                                ✅ Correct: {q.answer}
                            </p>
                        </div>
                    ))}

                    <button onClick={downloadQuiz} style={{ background: "linear-gradient(135deg, #10b981, #059669)", width: "100%", marginTop: "8px" }}>
                        ⬇️ Download Quiz PDF
                    </button>
                </motion.div>
            )}
        </div>
    );
}

export default QuizCard;