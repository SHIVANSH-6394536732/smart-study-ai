import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components";
import { Home, Notes } from "./pages";

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Navbar />
                <div className="page-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/notes" element={<Notes />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;