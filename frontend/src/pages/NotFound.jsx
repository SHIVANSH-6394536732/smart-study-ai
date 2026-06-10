import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function NotFound() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}
        >
            <div className="card" style={{ textAlign: "center", maxWidth: "480px", padding: "40px 32px" }}>
                <div style={{ fontSize: "72px", marginBottom: "8px" }}>🔍</div>
                <h1 style={{ fontSize: "64px", fontWeight: 800, margin: "0 0 8px", background: "var(--btn-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    404
                </h1>
                <h2 style={{ margin: "0 0 12px", color: "var(--text-primary)" }}>Page not found</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: "28px", lineHeight: 1.6 }}>
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="button-row" style={{ justifyContent: "center" }}>
                    <Link to="/">
                        <button>← Back to Home</button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

export default NotFound;
