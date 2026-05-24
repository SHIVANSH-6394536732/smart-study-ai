import { StudyPlanCard, AskAICard } from "../components";

function Home() {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h1 style={{ color: "white" }}>Welcome back 👋</h1>
        <p style={{ color: "rgba(255,255,255,0.85)" }}>
          What do you want to study today?
        </p>
      </div>

      <StudyPlanCard />
      <AskAICard />
    </div>
  );
}

export default Home;