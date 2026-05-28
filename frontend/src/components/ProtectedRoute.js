import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getMe } from "../services/api";

function ProtectedRoute({ children }) {
    const [auth, setAuth] = useState(null);

    useEffect(() => {
        getMe()
            .then(() => setAuth(true))
            .catch(() => setAuth(false));
    }, []);

    if (auth === null) return <p style={{color:"white", textAlign:"center"}}>Loading...</p>;
    if (auth === false) return <Navigate to="/login" />;
    return children;
}

export default ProtectedRoute;