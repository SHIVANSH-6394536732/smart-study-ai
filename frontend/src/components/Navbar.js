import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api";
import { useEffect, useState } from "react";

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const username = localStorage.getItem("username");
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const logout = async () => {
        await logoutUser();
        localStorage.removeItem("username");
        navigate("/login");
    };

    const initials = username ? username.slice(0, 2).toUpperCase() : "?";

    return (
        <nav className="navbar">
            <span className="navbar-brand">🎓 Smart Study AI</span>
            <div className="navbar-links">
                <Link to="/" className={location.pathname === "/" ? "nav-link active" : "nav-link"}>
                    🏠 Home
                </Link>
                <Link to="/notes" className={location.pathname === "/notes" ? "nav-link active" : "nav-link"}>
                    📄 Notes
                </Link>
                <Link to="/dashboard" className={location.pathname === "/dashboard" ? "nav-link active" : "nav-link"}>
                    📊 Dashboard
                </Link>
                <button
                    className="dark-toggle"
                    onClick={() => setDarkMode(!darkMode)}
                >
                    {darkMode ? "☀️ Light" : "🌙 Dark"}
                </button>
                {username && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div className="avatar">{initials}</div>
                        <span style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>
                            {username}
                        </span>
                    </div>
                )}
                <button
                    onClick={logout}
                    style={{ padding: "8px 16px", fontSize: "13px", background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;