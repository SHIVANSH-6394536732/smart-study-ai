import { StudyPlanCard, AskAICard } from "../components";

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

    return (
        <div>
            <div className="welcome-banner fade-in">
                <div>
                    <h1>{greeting}, {username}! 👋</h1>
                    <p>{quote}</p>
                </div>
                <div className="welcome-date">
                    <p>📅 {date}</p>
                </div>
            </div>
            <div className="fade-in">
                <StudyPlanCard />
            </div>
            <div className="fade-in">
                <AskAICard />
            </div>
            <div className="footer">
                Built with ❤️ by <a href="https://github.com/SHIVANSH-6394536732" target="_blank" rel="noreferrer">Shivansh Tripathi</a> &nbsp;|&nbsp; Smart Study AI © 2026
            </div>
        </div>
    );
}

export default Home;