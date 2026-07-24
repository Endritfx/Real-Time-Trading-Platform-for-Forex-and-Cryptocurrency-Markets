import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import { forexQuestions } from "../services/forexQuestions";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ForexFinalExam({ onPass, onExit }) {

    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [questions] = useState([...forexQuestions].sort(() => Math.random() - 0.5).slice(0, 10));
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const question = questions[currentQuestion];
    const passingScore = Math.ceil(questions.length * 0.7);
    const [showCertificate, setShowCertificate] = useState(false);
    const [showReview, setShowReview] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);
    const [userName, setUserName] = useState("");
    const [examDate, setExamDate] = useState("");
    const [timeExpired, setTimeExpired] = useState(false);

    useEffect(() => {
        async function loadUser() {
            const user = auth.currentUser;
            if (!user) return;
            const snap = await getDoc(doc(db, "users", user.uid));

            if (
                snap.exists()
            ) {
                setUserName(snap.data().username);
            }
        }
        loadUser();
    }, []);

    useEffect(() => {

        if (score !== null)
            return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setTimeExpired(true);
                    finishExam();
                    return 0;
                }
                return prev - 1;
            }
            );
        }, 1000);
        return () => clearInterval(timer);
    }, [score]);

    async function finishExam() {

        let correct = 0;
        questions.forEach((q, index) => {

            if (
                answers[index] === q.answer
            ) {
                correct++;
            }
        }
        );
        setScore(correct);
        if (correct >= passingScore) {
            await saveExamResult(correct);
        }
    }

    async function saveExamResult(result) {
        try {
            const user = auth.currentUser;

            if (!user)
                return;

            const date = new Date().toISOString();

            await updateDoc(doc(db, "users", user.uid),
                {
                    forexExamPassed: true,
                    forexExamScore: result,
                    forexExamDate: date,
                    forexCertificate: true
                }
            );
            setExamDate(date);
        }
        catch (err) {
            console.log(err);
        }
    }

    async function downloadCertificate() {

        const certificate = document.getElementById("forex-certificate");
        const canvas = await html2canvas(certificate);
        const img = canvas.toDataURL("image/png");
        const pdf = new jsPDF("landscape", "px", "a4");

        pdf.addImage(img, "PNG", 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
        pdf.save(`Forex-Certificate-${userName}.pdf`);
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="final-exam">
            <h1>Final Forex Exam</h1>
            {
                score === null && (
                    <button className="exit-exam-btn" onClick={() => { if (onExit) onExit(); }}>
                        ← Back to Academy
                    </button>
                )
            }

            <div className="exam-timer">
                ⏰ {minutes}:
                {
                    seconds.toString().padStart(2, "0")
                }
            </div>

            {
                !timeExpired && score === null && (
                    <div className="exam-question-card">
                        <h2> Question {currentQuestion + 1}/ {questions.length}</h2>
                        <h3>{question.question}</h3>
                        {
                            question.options.map(option => (
                                <label key={option} className="option-label">
                                    <input type="radio" checked={answers[currentQuestion] === option} onChange={() => setAnswers({
                                        ...answers,
                                        [currentQuestion]:
                                            option
                                    })
                                    }
                                    />
                                    {option}
                                </label>
                            )
                            )
                        }
                    </div>
                )
            }
            {
                score === null && !timeExpired && (
                    <div className="exam-navigation">
                        <button disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(currentQuestion - 1)}>
                            Previous
                        </button>
                        <button disabled={currentQuestion === questions.length - 1} onClick={() => setCurrentQuestion(currentQuestion + 1)}>
                            Next
                        </button>
                    </div>
                )
            }
            {
                !timeExpired && score === null && currentQuestion === questions.length - 1 && (
                    <button className="finish-exam-btn" onClick={finishExam} disabled={Object.keys(answers).length < questions.length}>
                        Finish Exam
                    </button>
                )
            }
            {
                score !== null && (
                    <div className="exam-result">
                        <h2> Result:{" "}{score}/{questions.length} </h2>
                        {
                            score >= passingScore ?
                                <>
                                    <h1>
                                        ✅ PASSED
                                    </h1>
                                    <button className="certificate-btn3" onClick={() => setShowCertificate(true)}>
                                        🎓 View Certificate
                                    </button>
                                    <button className="review-btn3" onClick={() => setShowReview(!showReview)}>
                                        📖
                                        {
                                            showReview ? "Hide Review" : "Review Answers"
                                        }
                                    </button>
                                    <button className="continue-btn3" onClick={() => { if (onPass) onPass(); }}>
                                        Continue
                                    </button>
                                    {
                                        showReview && (
                                            <div className="exam-review">
                                                {
                                                    questions.map((question, index) => {
                                                        const correct = answers[index] === question.answer;
                                                        return (
                                                            <div key={index} className="review-card">
                                                                <h3>Question {index + 1}</h3>
                                                                <p>{question.question}</p>
                                                                {
                                                                    correct ?
                                                                        <p className="correct-answer">
                                                                            ✅ Correct
                                                                        </p>
                                                                        :
                                                                        <>
                                                                            <p className="wrong-answer">
                                                                                ❌ Wrong
                                                                            </p>
                                                                            <p>Your Answer:{" "}{answers[index] || "No Answer"}</p>
                                                                            <p>Correct Answer:{" "}{question.answer}</p>
                                                                        </>
                                                                }
                                                            </div>
                                                        )
                                                    }
                                                    )
                                                }
                                            </div>
                                        )
                                    }
                                </>
                                :
                                <>
                                    <h1>
                                        ❌ FAILED
                                    </h1>
                                    <button className="continue-btn4" onClick={() => { if (onExit) onExit(); }}>
                                        ⬅ Back to Academy
                                    </button>
                                </>
                        }
                    </div>
                )
            }
            {
                showCertificate && (
                    <div className="certificate-wrapper">
                        <div id="forex-certificate" className="certificate">
                            <h1> CERTIFICATE</h1>
                            <h2>Forex Academy</h2>
                            <p>This certifies that</p>
                            <h2>{userName}</h2>
                            <p>
                                has successfully completed
                                Forex Academy Final Exam.
                            </p>
                            <h3>Score:{" "}{score}/{questions.length}</h3>
                            <p> Date: {" "}{examDate && new Date(examDate).toLocaleDateString()}</p>
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
                        <button className="download-certificate-btn" onClick={downloadCertificate} >
                            📥 Download Certificate
                        </button>
                    </div>
                )
            }
        </div >
    )
}