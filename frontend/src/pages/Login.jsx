import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/api";
import { useEffect } from "react";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { document.title = "Smart Study AI — Login"; }, []);

    const handleSubmit = async () => {
        if (!username.trim() || !password.trim()) return;
        if (username.trim().length < 3) { setError("❌ Username must be at least 3 characters."); return; }
        if (username.trim().length > 30) { setError("❌ Username must be under 30 characters."); return; }
        if (password.length < 6) { setError("❌ Password must be at least 6 characters."); return; }
        if (password.length > 50) { setError("❌ Password must be under 50 characters."); return; }
        try {
            setLoading(true);
            setError("");
            if (isRegister) {
                await registerUser(username, password);
                setIsRegister(false);
                setError("✅ Registered! Please login.");
            } else {
                const data = await loginUser(username, password);
                localStorage.setItem("username", data.username);
                navigate("/");
            }
        } catch (err) {
            setError(`❌ ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="card auth-card">
                <h2>{isRegister ? "📝 Register" : "🔐 Login"}</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                />
                <div style={{ position: "relative", marginTop: "12px" }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                        style={{ width: "100%", paddingRight: "44px", marginTop: 0 }}
                    />
                    <button
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: "absolute", right: "10px", top: "50%",
                            transform: "translateY(-50%)",
                            background: "none", border: "none", boxShadow: "none",
                            cursor: "pointer", fontSize: "16px", padding: "4px",
                            color: "var(--text-muted)"
                        }}
                        title={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                </div>
                <div className="button-row" style={{marginTop: "16px"}}>
                    <button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
                    </button>
                </div>
                {error && <p className="error" style={{marginTop: "12px"}}>{error}</p>}
                <p
                    style={{color: "#667eea", cursor: "pointer", marginTop: "16px", fontSize: "14px"}}
                    onClick={() => { setIsRegister(!isRegister); setError(""); }}
                >
                    {isRegister ? "Already have an account? Login" : "No account? Register here"}
                </p>
            </div>
        </div>
    );
}

export default Login;