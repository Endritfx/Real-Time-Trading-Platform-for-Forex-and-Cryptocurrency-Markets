import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CryptoCertificate({ onBack }) {

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
            const data = snap.data(); setUserName(
                data.username || user.email?.split("@")[0] || "Crypto Trader"
            );

            setScore(
                data.cryptoExamScore ?? Number(localStorage.getItem("cryptoScore")) ?? 0
            );

            setExamDate(
                data.cryptoExamDate || new Date().toISOString()
            );
        }
    }

    async function downloadCertificate() {
        const certificate = document.getElementById("crypto-certificate");
        const canvas = await html2canvas(certificate, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("landscape", "px", "a4");
        const width = pdf.internal.pageSize.getWidth();
        const height = pdf.internal.pageSize.getHeight();

        pdf.addImage(imgData, "PNG", 0, 0, width, height);
        pdf.save(`Crypto-Certificate-${userName}.pdf`);
    }

    return (
        <div className="certificate-wrapper">
            {onBack && (
                <button className="certificate-back-btn" onClick={onBack}>
                    ← Back
                </button>
            )
            }
            {/* CERTIFICATE */}
            <div id="crypto-certificate" className="certificate">
                <h1>🎓 CERTIFICATE</h1>
                <h2>Crypto Academy</h2>
                <p>This certifies that</p>
                <h2 className="certificate-name1">{userName}</h2>
                <p>has successfully completed the Crypto Academy Final Examination.</p>
                <h3>Score: {score}%</h3>
                <p>Date:{" "}{examDate ? new Date(examDate).toLocaleDateString() : "-"}</p>
                {/* SIGNATURE */}
                <div className="certificate-signature">
                    <div>
                        <h4>Crypto Academy</h4>
                        <p>Instructor</p>
                    </div>
                    <div>
                        <h4>Official Certificate</h4>
                        <p>Verified</p>
                    </div>
                </div>
            </div>
            {/* BUTTON */}
            <button className="download-certificate-btn" onClick={downloadCertificate}>
                📥 Download Certificate
            </button>
        </div >
    );
}