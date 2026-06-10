import { useState, useEffect } from "react";
import { fetchDashboard } from "../services/api";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "react-toastify";

function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetchDashboard(() =>
                    toast.info("⏳ Backend is waking up, please wait...", { autoClose: 10000 })
                );
                setData(res);
            } catch {
                setError("Failed to load dashboard. Please refresh the page.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);
    useEffect(() => { document.title = "Smart Study AI — Dashboard"; }, []); // ADD HERE


    if (loading) return (
        <div style={{ textAlign: "center", padding: "40px" }}>
            <div className="loader-spinner" style={{ margin: "0 auto" }} />
            <p style={{ color: "var(--text-secondary)", marginTop: "12px" }}>Loading dashboard...</p>
        </div>
    );
    if (error) return <p style={{ color: "var(--error)", textAlign: "center" }}>{error}</p>;

    const chartData = data.quiz_scores.slice().reverse().map((s, i) => ({
        attempt: `#${i + 1}`,
        score: Math.round((s.score / s.total) * 100),
    }));

    const avgScore = chartData.length > 0
        ? Math.round(chartData.reduce((a, b) => a + b.score, 0) / chartData.length)
        : 0;

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

    const diffColor = (d) => d === "Hard" ? "var(--badge-hard-text)" : d === "Medium" ? "var(--badge-medium-text)" : "var(--badge-easy-text)";

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item} style={{ textAlign: "center", marginBottom: "20px" }}>
                <h1 style={{ color: "var(--text-primary)", fontSize: "1.8rem", fontWeight: "800" }}>📊 My Dashboard</h1>
                <p style={{ color: "var(--text-secondary)" }}>Your complete study history</p>
            </motion.div>

            {/* Stats Row */}
            <motion.div variants={item} className="stats-grid" style={{ marginBottom: "20px" }}>
                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-value">{data.study_plans.length}</div>
                    <div className="stat-label">Study Plans</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🧠</div>
                    <div className="stat-value">{data.quiz_scores.length}</div>
                    <div className="stat-label">Quizzes Done</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-value">{avgScore}%</div>
                    <div className="stat-label">Avg Score</div>
                </div>
            </motion.div>

            {/* Score Chart */}
            {chartData.length > 1 && (
                <motion.div variants={item} className="card" style={{ padding: "20px" }}>
                    <h2 style={{ color: "var(--text-primary)", marginBottom: "16px", padding: "0" }}>📈 Quiz Performance</h2>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
                            <XAxis dataKey="attempt" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                            <YAxis domain={[0, 100]} stroke="var(--text-muted)" tick={{ fontSize: 12 }} unit="%" />
                            <Tooltip
                                contentStyle={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: "10px", color: "var(--text-primary)" }}
                                formatter={(v) => [`${v}%`, "Score"]}
                            />
                            <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2.5} dot={{ fill: "#818cf8", r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            )}

            {/* Study Plans */}
            <motion.div variants={item} className="card">
                <h2 style={{ color: "var(--text-primary)", padding: "18px 22px 0" }}>📚 Recent Study Plans</h2>
                <div style={{ padding: "12px 22px 18px" }}>
                    {data.study_plans.length === 0 && (
                        <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                            <p style={{ fontSize: "2rem" }}>📭</p>
                            <p>No study plans yet. Go generate one!</p>
                        </div>
                    )}
                    {data.study_plans.map((plan, i) => (
                        <div key={i} style={{ marginBottom: "12px", padding: "14px", background: "var(--glass-bg)", borderRadius: "12px", border: "1px solid var(--glass-border)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                <p style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "14px" }}>{plan.topic.toUpperCase()}</p>
                                <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "20px", background: "var(--glass-border)", color: diffColor(plan.difficulty) }}>
                                    {plan.difficulty}
                                </span>
                            </div>
                            <ul style={{ paddingLeft: "16px", margin: "0" }}>
                                {(() => { try { return JSON.parse(plan.tasks); } catch { return []; } })().map((task, j) => (
                    <li key={j} style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "3px" }}>{task}</li>
                ))}
                            </ul>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "8px" }}>{new Date(plan.created_at).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Quiz Scores */}
            <motion.div variants={item} className="card">
                <h2 style={{ color: "var(--text-primary)", padding: "18px 22px 0" }}>🧠 Quiz Scores</h2>
                <div style={{ padding: "12px 22px 18px" }}>
                    {data.quiz_scores.length === 0 && (
                        <div style={{ textAlign: "center", padding: "24px", color: "var(--text-muted)" }}>
                            <p style={{ fontSize: "2rem" }}>📝</p>
                            <p>No quiz scores yet. Take a quiz!</p>
                        </div>
                    )}
                    {data.quiz_scores.map((s, i) => {
                        const pct = Math.round((s.score / s.total) * 100);
                        return (
                            <div key={i} style={{ marginBottom: "10px", padding: "12px 14px", background: "var(--glass-bg)", borderRadius: "10px", border: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={{ fontWeight: "800", fontSize: "1.1rem", color: pct === 100 ? "var(--success)" : pct >= 60 ? "var(--accent)" : "var(--error)" }}>
                                        {s.score}/{s.total}
                                    </span>
                                    <div style={{ width: "80px", height: "6px", background: "var(--glass-border)", borderRadius: "10px", overflow: "hidden" }}>
                                        <div style={{ width: `${pct}%`, height: "100%", background: pct === 100 ? "var(--success)" : pct >= 60 ? "var(--accent)" : "var(--error)", borderRadius: "10px" }} />
                                    </div>
                                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{pct}%</span>
                                </div>
                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{new Date(s.created_at).toLocaleString()}</span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </motion.div>
    );
}

export default Dashboard;