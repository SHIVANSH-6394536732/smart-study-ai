import { useState } from "react";
import { fetchGenerateFlashcards } from "../services/api";

function FlashcardCard() {
    const [flashcards, setFlashcards] = useState([]);
    const [flashcardLoading, setFlashcardLoading] = useState(false);
    const [flashcardError, setFlashcardError] = useState("");
    const [flippedCards, setFlippedCards] = useState({});

    const generateFlashcards = async () => {
        try {
            setFlashcardLoading(true);
            setFlashcardError("");
            setFlashcards([]);
            setFlippedCards({});
            const res = await fetch(`${process.env.REACT_APP_API_URL}/generate-flashcards`);
            if (!res.ok) {
                const err = await res.json();
                setFlashcardError(`❌ ${err.detail}`);
                return;
            }
            const data = await fetchGenerateFlashcards();
            setFlashcards(data.flashcards);
            if (data.error) {
                setFlashcardError(data.error);
            } else {
                setFlashcards(data.flashcards);
            }
        } catch {
            setFlashcardError("❌ Network error. Is the backend running?");
        } finally {
            setFlashcardLoading(false);
        }
    };

    const toggleFlip = (index) => {
        setFlippedCards((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    return (
        <div className="card">
            <h2>🃏 Flashcards from Notes</h2>
            <p style={{color: "#6b7280", fontSize: "14px"}}>Upload a PDF above first, then generate flashcards</p>
            <div className="button-row">
                <button onClick={generateFlashcards} disabled={flashcardLoading}>
                    {flashcardLoading ? "⏳ Generating..." : "Generate Flashcards"}
                </button>
            </div>
            {flashcardError && <p className="error">{flashcardError}</p>}
            {flashcards.length > 0 && (
                <div style={{marginTop: "16px"}}>
                    <p style={{color: "#6b7280", fontSize: "13px", marginBottom: "12px"}}>
                        👆 Click a card to reveal the answer
                    </p>
                    <div className="flashcards-grid">
                        {flashcards.map((card, index) => (
                            <div
                                key={index}
                                className={`flashcard ${flippedCards[index] ? "flipped" : ""}`}
                                onClick={() => toggleFlip(index)}
                            >
                                <div className="flashcard-inner">
                                    <div className="flashcard-front">
                                        <p>{card.question}</p>
                                    </div>
                                    <div className="flashcard-back">
                                        <p>{card.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default FlashcardCard;