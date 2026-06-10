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