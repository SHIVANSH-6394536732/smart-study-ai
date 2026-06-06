import { useState } from "react";
import { fetchGenerateFlashcards } from "../services/api";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";

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
    const downloadFlashcards = () => {
        const pdf = new jsPDF();
        pdf.setFontSize(18);
        pdf.setTextColor(79, 70, 229);
        pdf.text("Smart Study AI — Flashcards", 20, 20);
        pdf.setFontSize(10);
        pdf.setTextColor(107, 114, 128);
        pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 30);
        pdf.setDrawColor(226, 232, 240);
        pdf.line(20, 34, 190, 34);
    
        let y = 44;
        flashcards.forEach((card, i) => {
            pdf.setFillColor(248, 250, 255);
            pdf.roundedRect(15, y - 4, 180, 28, 3, 3, 'F');
            pdf.setFontSize(10);
            pdf.setTextColor(79, 70, 229);
            pdf.text(`Card ${i + 1}`, 20, y + 2);
            pdf.setFontSize(10);
            pdf.setTextColor(30, 27, 75);
            const qLines = pdf.splitTextToSize(`Q: ${card.question}`, 165);
            pdf.text(qLines, 20, y + 9);
            pdf.setTextColor(22, 163, 74);
            const aLines = pdf.splitTextToSize(`A: ${card.answer}`, 165);
            pdf.text(aLines, 20, y + 9 + qLines.length * 6);
            y += 36 + (qLines.length + aLines.length) * 2;
            if (y > 260) { pdf.addPage(); y = 20; }
        });
    
        pdf.save("SmartStudyAI_Flashcards.pdf");
        toast.success("Flashcards downloaded as PDF!");
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
                    <div style={{marginTop: "16px", textAlign: "center"}}>
                        <button
                            onClick={downloadFlashcards}
                            style={{background: "#10b981", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", cursor: "pointer", fontSize: "14px"}}
                        >
                            ⬇️ Download Flashcards PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FlashcardCard;