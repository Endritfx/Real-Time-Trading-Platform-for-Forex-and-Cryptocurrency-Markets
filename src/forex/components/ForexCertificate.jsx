import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ForexCertificate() {

    const [userName, setUserName] = useState("");
    const [score, setScore] = useState(0);
    const [examDate, setExamDate] = useState("");

    useEffect(() => {
        loadUser();
    }, []);

    async function loadUser() {

        const user = auth.currentUser;

        if (!user) return;

        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {

            const data = snap.data();
            setUserName(data.username || "");
            setScore(data.forexExamScore || 0);
            setExamDate(data.forexExamDate || "");
        }
    }

    async function downloadCertificate() {

        const certificate = document.getElementById("forex-certificate");
        const canvas = await html2canvas(certificate);
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("landscape", "px", "a4");
        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, "PNG", 0, 0, width, height);
        pdf.save(`Forex-Certificate-${userName}.pdf`);
    }

    return (
        <div className="certificate-wrapper">
            <div id="forex-certificate" className="certificate">
                <h1>CERTIFICATE</h1>
                <h2>Forex Academy</h2>
                <p>This certifies that</p>
                <h2 className="certificate-name1">{userName}</h2>
                <p>
                    has successfully completed
                    the Forex Academy Final
                    Examination.
                </p>
                <h3>Score:{" "}{score}/ 10</h3>
                <p>Date: {" "}{examDate ? new Date(examDate).toLocaleDateString() : "-"}</p>
                <div className="certificate-signature">
                    <div>
                        <h4>Forex Academy</h4>
                        <p>Instructor</p>
                    </div>
                    <div>
                        <h4>Official Certificate</h4>
                        <p>Verified</p>
                    </div>
                </div>
            </div>
            <button className="download-certificate-btn" onClick={downloadCertificate}>
                📥 Download Certificate
            </button>
        </div>
    );
}