import "./App.css";
import { StudyPlanCard, AskAICard, PDFUploadCard, QuizCard, FlashcardCard } from "./components";

function App() {
    return (
        <div className="App">
            <h1>🎓 Smart Study AI</h1>
            <p className="subtitle">Your personal AI-powered study planner</p>
            <StudyPlanCard />
            <AskAICard />
            <PDFUploadCard />
            <QuizCard />
            <FlashcardCard />
        </div>
    );
}

export default App;