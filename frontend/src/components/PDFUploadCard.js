import { useState } from "react";
import { fetchUploadPDF, fetchAskPDF } from "../services/api";
import { toast } from "react-toastify";

function PDFUploadCard() {
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfStatus, setPdfStatus] = useState(localStorage.getItem("pdf_uploaded") || "");
    const [pdfReady, setPdfReady] = useState(!!localStorage.getItem("pdf_uploaded"));
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
            const statusMsg = `✅ Uploaded! Pages: ${result.pages}`;
            setPdfStatus(statusMsg);
            setPdfReady(true);
            localStorage.setItem("pdf_uploaded", statusMsg);
            toast.success(`PDF uploaded! ${result.pages} pages, ${result.chunks} chunks ready.`);
            toast.warning(
                "⚠️ PDF resets after 15 min of inactivity. Re-upload if answers stop working.",
                { autoClose: 7000 }
            );
        } catch {
            toast.error("Upload failed. Please check your file and try again.");
            setPdfStatus("");
            localStorage.removeItem("pdf_uploaded");
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
                {pdfReady && (
                    <button
                        onClick={() => { setPdfReady(false); setPdfStatus(""); setPdfFile(null); localStorage.removeItem("pdf_uploaded"); toast.info("PDF cleared."); }}
                        style={{ background: "var(--glass-bg)", color: "var(--error)", border: "1px solid var(--glass-border)", boxShadow: "none" }}
                    >
                        🗑 Clear PDF
                    </button>
                )}
            </div>
            {pdfStatus && <p className="success">{pdfStatus}</p>}
            {pdfReady && !pdfFile && (
    <div style={{ marginTop: "8px", padding: "10px 14px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: "10px" }}>
        <p style={{ color: "var(--warning)", fontSize: "13px", fontWeight: "600", margin: 0 }}>
            ⚠️ Your previous PDF may have reset. Please re-upload to continue using quiz and flashcards.
        </p>
    </div>
)}
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