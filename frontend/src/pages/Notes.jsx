import { useEffect } from "react";
import { PDFUploadCard, QuizCard, FlashcardCard } from "../components";

function Notes() {
    useEffect(() => { document.title = "Smart Study AI — Notes"; }, []);
    return (
        <div>
            <PDFUploadCard />
            <QuizCard />
            <FlashcardCard />
        </div>
    );
}

export default Notes;