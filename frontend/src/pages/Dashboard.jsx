import { useState, useEffect } from "react";
import { fetchDashboard } from "../services/api";

function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchDashboard();
                setData(res);
            } catch {
                setError("Failed to load dashboard.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <p style={{ color: "white", textAlign: "center" }}>Loading dashboard...</p>;
    if (error) return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;

    return (
        <div>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <h1 style={{ color: "white" }}>📊 My Dashboard</h1>
                <p style={{ color: "rgba(255,255,255,0.85)" }}>Your study history</p>
            </div>

            <div className="card">
                <h2>📚 Recent Study Plans</h2>
                {data.study_plans.length === 0 && <p style={{ color: "#6b7280" }}>No study plans yet.</p>}
                {data.study_plans.map((plan, i) => (
                    <div key={i} style={{ marginBottom: "12px", padding: "12px", background: "#f8faff", borderRadius: "8px" }}>
                        <p style={{ fontWeight: "bold" }}>{plan.topic.toUpperCase()} — <span style={{ color: "#4f46e5" }}>{plan.difficulty}</span></p>
                        <ul style={{ marginTop: "6px", paddingLeft: "20px" }}>
                            {JSON.parse(plan.tasks).map((task, j) => (
                                <li key={j} style={{ fontSize: "14px", color: "#374151" }}>{task}</li>
                            ))}
                        </ul>
                        <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "6px" }}>{new Date(plan.created_at).toLocaleString()}</p>
                    </div>
                ))}
            </div>

            <div className="card">
                <h2>🧠 Quiz Scores</h2>
                {data.quiz_scores.length === 0 && <p style={{ color: "#6b7280" }}>No quiz scores yet.</p>}
                {data.quiz_scores.map((s, i) => (
                    <div key={i} style={{ marginBottom: "8px", padding: "12px", background: "#f8faff", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: "bold", color: "#4f46e5" }}>{s.score} / {s.total}</span>
                        <span style={{ fontSize: "12px", color: "#9ca3af" }}>{new Date(s.created_at).toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;