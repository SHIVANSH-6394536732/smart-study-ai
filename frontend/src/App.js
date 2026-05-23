import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar, ErrorBoundary, ProtectedRoute } from "./components";
import { Home, Notes, Login } from "./pages";

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <Navbar />
                            <ErrorBoundary>
                                <div className="page-content">
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/notes" element={<Notes />} />
                                    </Routes>
                                </div>
                            </ErrorBoundary>
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;