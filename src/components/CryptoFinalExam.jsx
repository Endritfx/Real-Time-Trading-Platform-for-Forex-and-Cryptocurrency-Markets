import { useEffect, useState } from "react";
import CryptoCertificate from "../components/CryptoCertificate";
import "../styles/learning.css";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { CryptoQuestions } from "../components/CryptoQuestions";

export default function CryptoFinalExam({ onBack, exitToLessons }) {

    const [current, setCurrent] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300);
    const [examQuestions, setExamQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const passMark = 70;

    useEffect(() => {
        if (finished) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    finishExam();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [finished]);

    useEffect(() => {
        if (CryptoQuestions.length) {
            startExam();
        }
    }, []);

    function startExam() {
        const shuffled = [...CryptoQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
        setExamQuestions(shuffled);
        setCurrent(0);
        setScore(0);
        setFinished(false);
        setSelected(null);
        setTimeLeft(120);
        setAnswers([]);
        setShowResults(false);
    }

    function nextQuestion() {
        const currentQ = examQuestions[current];
        const isCorrect = selected === currentQ.answer;
        if (isCorrect) {
            setScore(prev => prev + 1);
        }

        setAnswers(prev => [...prev, {
            question: currentQ.question,
            selected,
            correct: currentQ.answer,
            options: currentQ.options,
            isCorrect
        }
        ]);
        setSelected(null);
        if (current + 1 < examQuestions.length) {
            setCurrent(current + 1);
        } else {
            finishExam();
        }
    }

    function finishExam() {
        setFinished(true);
    }

    async function saveCertificate(scorePercent) {
        const user = auth.currentUser;
        if (!user) return;
        try {
            await setDoc(doc(db, "users", user.uid), {
                cryptoCertified: true,
                cryptoExamScore: scorePercent,
                cryptoExamDate: new Date().toISOString()
            },
                { merge: true }
            );
        } catch (err) {
            console.error(err);
        }
    }

    const percent = Math.round((score / examQuestions.length) * 100);
    const passed = percent >= passMark;

    if (showCertificate) {
        return (
            <CryptoCertificate onBack={exitToLessons} />
        );
    }
    if (!examQuestions.length || (!examQuestions[current] && !finished)) {
        return <div>Loading exam...</div>;
    }
    return (
        <div className="final-exam">
            <h1>🧪 Crypto Final Exam</h1>
            <button className="quiz-back-btn" onClick={onBack}>
                ← Back
            </button>
            {!finished ? (
                <>
                    {/* TIMER */}
                    <div className="exam-timer">
                        Time Left: {Math.floor(timeLeft / 60)}:
                        {(timeLeft % 60).toString().padStart(2, "0")}
                    </div>
                    {/* QUESTION */}
                    <div className="exam-question-card">
                        <h2>Question {current + 1} / {examQuestions.length}</h2>
                        <h3>{examQuestions[current].question}</h3>
                        {examQuestions[current].options.map((opt, i) => (
                            <label key={i} className="option-label">
                                <input type="radio" name="option" checked={selected === i} onChange={() => setSelected(i)} />
                                {opt}
                            </label>
                        ))}
                        <div className="exam-navigation">
                            <button disabled={selected === null} onClick={nextQuestion}>
                                {current + 1 === examQuestions.length ? "Finish Exam" : "Next"}
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="exam-result">
                    <h2>{passed ? "🎉 You Passed!" : "❌ You Failed"}</h2>
                    <h1>{percent}%</h1>
                    <p style={{ color: "#aaa", marginTop: 10 }}>Score: {score} / {examQuestions.length}</p>
                    {passed ? (
                        <button className="getcertificate-btn" onClick={async () => {
                            await saveCertificate(percent);
                            setShowCertificate(true);
                        }} >
                            Get Certificate
                        </button>
                    ) : (
                        <button className="tryagain-btn" onClick={() => {
                            setCurrent(0);
                            setScore(0);
                            setFinished(false);
                            setTimeLeft(300);
                            setSelected(null);
                            setAnswers([]);
                            setShowResults(false);
                            startExam();
                        }}
                        >
                            Try Again
                        </button>
                    )}
                    <button className="showresults-btn" onClick={() => setShowResults(prev => !prev)} >
                        {showResults ? "Hide Review" : "View Results"}
                    </button>
                    {showResults && (
                        <div className="review-section">
                            {answers.map((a, i) => (
                                <div key={i} className={`review-card ${a.isCorrect ? "correct" : "wrong"}`}>
                                    <h3>Question {i + 1}</h3>
                                    <p>{a.question}</p>
                                    <p> Your answer:{" "}
                                        <b>
                                            {a.selected !== null ? a.options[a.selected] : "No answer"}
                                        </b>
                                    </p>
                                    {!a.isCorrect && (
                                        <p>
                                            Correct answer:{" "}
                                            <b>{a.options[a.correct]}</b>
                                        </p>
                                    )}
                                    <span>
                                        {a.isCorrect ? "✅ Correct" : "❌ Wrong"}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}