import { useState } from "react";
import { fetchUploadPDF, fetchAskPDF } from "../services/api";

function PDFUploadCard() {
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfStatus, setPdfStatus] = useState("");
    const [pdfQuestion, setPdfQuestion] = useState("");
    const [pdfAnswer, setPdfAnswer] = useState("");
    const [pdfLoading, setPdfLoading] = useState(false);

    const uploadPDF = async () => {
        if (!pdfFile) return;
        try {
            const data = await fetchUploadPDF(pdfFile);
            setPdfStatus(`✅ Uploaded! Pages: ${data.pages}`);
        } catch {
            setPdfStatus("❌ Upload failed.");
        }
    };
    
    const askPDF = async () => {
        if (!pdfQuestion.trim()) return;
        try {
            setPdfLoading(true);
            const data = await fetchAskPDF(pdfQuestion);
            setPdfAnswer(data.answer);
        } catch {
            setPdfAnswer("❌ Could not reach backend.");
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <div className="card">
            <h2>📄 Ask from Your Notes</h2>
            <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
            />
            <div className="button-row">
                <button onClick={uploadPDF}>Upload PDF</button>
            </div>
            {pdfStatus && <p className="success">{pdfStatus}</p>}
            <input
                type="text"
                placeholder="Ask a question from your notes..."
                value={pdfQuestion}
                onChange={(e) => setPdfQuestion(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") askPDF(); }}
            />
            <div className="button-row">
                <button onClick={askPDF} disabled={pdfLoading}>
                    {pdfLoading ? "Thinking..." : "Ask Notes"}
                </button>
            </div>
            {pdfAnswer && (
                <div className="result-box">
                    <p>{pdfAnswer}</p>
                </div>
            )}
        </div>
    );
}

export default PDFUploadCard;