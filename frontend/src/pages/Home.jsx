import { useState, useEffect, useRef } from "react";
import { StudyPlanCard, AskAICard } from "../components";
import { motion } from "framer-motion";
import { fetchDashboard } from "../services/api";
import { toast } from "react-toastify";
import { NotesGeneratorCard } from "../components";

function Home() {
    const username = localStorage.getItem("username");
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const date = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    const quotes = [
        "Every expert was once a beginner. Keep going! 🚀",
        "Study hard, dream big, achieve more! ⭐",
        "Your future self will thank you for studying today! 📚",
        "Small progress is still progress. Keep it up! 💪",
        "Learning is a treasure that follows its owner everywhere! 🎯",
    ];
    const quote = quotes[new Date().getDay() % quotes.length];
    const [stats, setStats] = useState({ plans: 0, quizzes: 0, streak: 0 });
    const getSavedPomodoro = () => {
        try {
            const saved = localStorage.getItem("pomodoro");
            return saved ? { ...JSON.parse(saved), running: false } : { minutes: 25, seconds: 0, running: false, mode: "focus" };
        } catch { return { minutes: 25, seconds: 0, running: false, mode: "focus" }; }
    };
    const [pomodoro, setPomodoro] = useState(getSavedPomodoro);    const pomodoroRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchDashboard();
                setStats({
                    plans: data.study_plans.length,
                    quizzes: data.quiz_scores.length,
                    streak: data.streak || 0,
                });
            } catch { }
        };
        load();
    }, []);

    useEffect(() => { document.title = "Smart Study AI — Home"; }, []);

    useEffect(() => {
        if (pomodoro.running) {
            pomodoroRef.current = setInterval(() => {
                setPomodoro((prev) => {
                    let next;
                    if (prev.seconds > 0) next = { ...prev, seconds: prev.seconds - 1 };
                    else if (prev.minutes > 0) next = { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                    else {
                        clearInterval(pomodoroRef.current);
                        const nextMode = prev.mode === "focus" ? "break" : "focus";
                        toast.success(prev.mode === "focus" ? "🎉 Focus session done! Take a break." : "⏰ Break over! Back to focus.");
                        next = { minutes: nextMode === "focus" ? 25 : 5, seconds: 0, running: false, mode: nextMode };
                    }
                    localStorage.setItem("pomodoro", JSON.stringify(next));
                    return next;
                });
            }, 1000);
        } else {
            clearInterval(pomodoroRef.current);
            localStorage.setItem("pomodoro", JSON.stringify(pomodoro));
        }
        return () => clearInterval(pomodoroRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [pomodoro.running]);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item} className="welcome-banner">
                <div>
                    <h1>{greeting}, {username}! 👋</h1>
                    <p>{quote}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                        Upload your notes → Generate quizzes, flashcards & study plans using AI
                    </p>
                </div>
                <div className="welcome-date">
                    <p>📅 {date}</p>
                    {stats.streak > 0 && <p>🔥 {stats.streak} day study streak</p>}
                </div>
            </motion.div>

            <motion.div variants={item} className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-value">{stats.plans}</div>
                    <div className="stat-label">Study Plans</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🧠</div>
                    <div className="stat-value">{stats.quizzes}</div>
                    <div className="stat-label">Quizzes Done</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-value">{stats.streak}</div>
                    <div className="stat-label">Study Streak</div>
                </div>
            </motion.div>

            <motion.div variants={item} className="card" style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h3 style={{ color: "var(--text-primary)", fontWeight: "800", fontSize: "1rem", margin: 0 }}>
                            {pomodoro.mode === "focus" ? "🍅 Focus Session" : "☕ Break Time"}
                        </h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>
                            {pomodoro.mode === "focus" ? "Stay focused, avoid distractions" : "Rest your eyes, stretch a bit"}
                        </p>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", fontWeight: "800", color: pomodoro.mode === "focus" ? "var(--accent)" : "var(--accent2)", fontFamily: "monospace" }}>
                            {String(pomodoro.minutes).padStart(2, "0")}:{String(pomodoro.seconds).padStart(2, "0")}
                        </div>
                        <div style={{ display: "flex", gap: "6px", marginTop: "8px", justifyContent: "center" }}>
                            <button
                                onClick={() => setPomodoro((p) => ({ ...p, running: !p.running }))}
                                style={{ padding: "6px 16px", fontSize: "12px", background: pomodoro.running ? "linear-gradient(135deg, #f87171, #ef4444)" : "linear-gradient(135deg, #34d399, #10b981)" }}
                            >
                                {pomodoro.running ? "⏸ Pause" : "▶ Start"}
                            </button>
                            <button
                                onClick={() => { clearInterval(pomodoroRef.current); setPomodoro({ minutes: 25, seconds: 0, running: false, mode: "focus" }); }}
                                style={{ padding: "6px 12px", fontSize: "12px", background: "var(--glass-bg)", color: "var(--text-secondary)", border: "1px solid var(--glass-border)", boxShadow: "none" }}
                            >
                                ↺
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div variants={item}>
                <StudyPlanCard />
            </motion.div>

            <motion.div variants={item}>
                <AskAICard />
            </motion.div>
            <motion.div variants={item}>
                <NotesGeneratorCard />
            </motion.div>

            <motion.div variants={item} className="footer">
                Built with ❤️ by{" "}
                <a href="https://github.com/SHIVANSH-6394536732" target="_blank" rel="noreferrer">
                    Shivansh Tripathi
                </a>{" "}
                &nbsp;|&nbsp; Smart Study AI © 2026
            </motion.div>
        </motion.div>
    );
}

export default Home;