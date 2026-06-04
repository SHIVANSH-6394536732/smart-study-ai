import { Link, useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/api";

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const username = localStorage.getItem("username");

    const logout = async () => {
        await logoutUser();
        localStorage.removeItem("username");
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <span className="navbar-brand">🎓 Smart Study AI</span>
            <div className="navbar-links">
                <Link to="/" className={location.pathname === "/" ? "nav-link active" : "nav-link"}>
                    Home
                </Link>
                <Link to="/notes" className={location.pathname === "/notes" ? "nav-link active" : "nav-link"}>
                    📄 Notes & Quiz
                </Link>
                <Link to="/dashboard" className={location.pathname === "/dashboard" ? "nav-link active" : "nav-link"}>
                    📊 Dashboard
                </Link>
                {username && <span style={{color: "white", fontSize: "14px", padding: "8px"}}>👤 {username}</span>}
                <button onClick={logout} style={{padding: "8px 16px", fontSize: "14px"}}>Logout</button>
            </div>
        </nav>
    );
}

export default Navbar;