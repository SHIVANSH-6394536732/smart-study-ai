import { useState, useEffect } from "react";
import { StudyPlanCard, AskAICard } from "../components";
import { motion } from "framer-motion";
import { fetchDashboard } from "../services/api";

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

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchDashboard();
                setStats({
                    plans: data.study_plans.length,
                    quizzes: data.quiz_scores.length,
                    streak: Math.min(data.study_plans.length, 7),
                });
            } catch { }
        };
        load();
    }, []);

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
                </div>
                <div className="welcome-date">
                    <p>📅 {date}</p>
                    {stats.streak > 0 && <p>🔥 {stats.streak} day streak</p>}
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
                    <div className="stat-label">Day Streak</div>
                </div>
            </motion.div>

            <motion.div variants={item}>
                <StudyPlanCard />
            </motion.div>

            <motion.div variants={item}>
                <AskAICard />
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