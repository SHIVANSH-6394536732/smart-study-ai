import { useState } from "react";
import { fetchUploadPDF, fetchAskPDF } from "../services/api";
import { toast } from "react-toastify";

function PDFUploadCard() {
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfStatus, setPdfStatus] = useState("");
    const [pdfQuestion, setPdfQuestion] = useState("");
    const [pdfAnswer, setPdfAnswer] = useState("");
    const [pdfLoading, setPdfLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [dragging, setDragging] = useState(false);

    const handleFile = (file) => {
        if (!file) return;
        if (file.type !== "application/pdf") {
            toast.error("❌ Only PDF files are allowed.");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error("❌ File too large. Maximum size is 10MB.");
            return;
        }
        setPdfFile(file);
        setPdfStatus("");
        setPdfAnswer("");
        toast.info(`📄 Selected: ${file.name}`);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const uploadPDF = async () => {
        if (!pdfFile) return;
        try {
            setUploadLoading(true);
            const result = await fetchUploadPDF(pdfFile, () =>
                toast.info("⏳ Backend is waking up, please wait 20-30 seconds...", { autoClose: 10000 })
            );
            setPdfStatus(`✅ Uploaded! Pages: ${result.pages}`);
            toast.success(`PDF uploaded! ${result.pages} pages, ${result.chunks} chunks ready.`);
            toast.warning(
                "⚠️ PDF resets after 15 min of inactivity. Re-upload if answers stop working.",
                { autoClose: 7000 }
            );
        } catch {
            toast.error("Upload failed. Please check your file and try again.");
            setPdfStatus("");
        } finally {
            setUploadLoading(false);
        }
    };

    const askPDF = async () => {
        if (!pdfQuestion.trim()) return;
        try {
            setPdfLoading(true);
            setPdfAnswer("");
            const data = await fetchAskPDF(pdfQuestion);
            setPdfAnswer(data.answer);
        } catch {
            toast.error("Could not get answer. Please re-upload your PDF and try again.");
        } finally {
            setPdfLoading(false);
        }
    };

    return (
        <div className="card">
            <h2>📄 Ask from Your Notes</h2>
            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("pdf-input").click()}
                className={`drag-zone ${dragging ? "dragging" : ""}`}
                style={{ marginBottom: "12px" }}
            >
                <p style={{ margin: 0 }}>
                    {pdfFile ? `📄 ${pdfFile.name}` : "🖱️ Drag & drop a PDF here, or click to select"}
                </p>
            </div>
            <input
                id="pdf-input"
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])}
            />
            <div className="button-row">
                <button onClick={uploadPDF} disabled={uploadLoading || !pdfFile}>
                    {uploadLoading ? "Uploading..." : "Upload PDF"}
                </button>
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