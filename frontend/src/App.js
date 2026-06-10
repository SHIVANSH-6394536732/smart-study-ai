import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar, ErrorBoundary, ProtectedRoute } from "./components";
import { Home, Notes, Login, Dashboard } from "./pages";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Home, Notes, Login, Dashboard, NotFound } from "./pages";


function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <ToastContainer position="top-right" autoClose={3000} />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/*" element={
                        <ProtectedRoute>
                            <Navbar />
                            <ErrorBoundary>
                                <div className="page-content">
                                    <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="notes" element={<Notes />} />
  <Route path="dashboard" element={<Dashboard />} />
                                    </Routes>
                                    <Route path="*" element={<NotFound />} />

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