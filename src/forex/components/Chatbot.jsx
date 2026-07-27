import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import "../styles/ChatBot.css";
import { X as CloseIcon } from "lucide-react";

export default function ChatBot() {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [chatLoaded, setChatLoaded] = useState(false);
    const [typing, setTyping] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content:
                "Hello  I am your Trading Assistant AI. I can help you understand Forex and Crypto markets, explain trading concepts, analyze strategies, and answer questions about risk management, technical analysis, and market tools."
        }
    ]);
    const messagesEndRef = useRef(null);
    const getUserId = () => {
        return auth.currentUser?.uid;
    };

    const loadMessages = async () => {
        try {
            const uid = getUserId();
            if (!uid) {
                setChatLoaded(true);
                return;
            }
            const docRef = doc(db, "chatSessions", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data?.messages?.length > 0) {
                    setMessages(data.messages);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setChatLoaded(true);
        }
    };

    const saveMessages = async (msgs) => {
        try {
            const uid = getUserId();
            if (!uid) return;
            await setDoc(
                doc(db, "chatSessions", uid),
                { messages: msgs },
                { merge: true }
            );
        } catch (error) {
            console.error("Save chat error:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(() => {
            loadMessages();
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!chatLoaded) return;
        saveMessages(messages);
    }, [messages, chatLoaded]);

    useEffect(() => {
        if (open) {
            messagesEndRef.current?.scrollIntoView({
                behavior: "smooth"
            });
        }
    }, [messages, loading, open]);

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({
                    behavior: "smooth"
                });
            }, 100);
        }
    }, [open]);

    const sendMessage = async () => {
        if (!message.trim() || loading || typing) return;
        const userMessage = { role: "user", content: message };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setMessage("");
        setLoading(true);
        try {
            const response = await fetch("https://trading-platform-backend-peyh.onrender.com/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: updatedMessages
                })
            }
            );
            const data = await response.json();
            const reply = data.reply || "No response from AI.";
            setTyping(true);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: ""
                }
            ]);
            let index = 0;
            const interval = setInterval(() => {
                setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = reply.slice(0, index);
                    return updated;
                });
                index++;
                if (index > reply.length) {
                    clearInterval(interval);
                    setTyping(false);
                }
            }, 25);
        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Something went wrong. Try again."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {!open && (
                <button className="chat-fab" onClick={() => setOpen(true)}>
                    <MessageCircle size={24} />
                </button>
            )}
            {open && (
                <div className="chat-window">
                    <div className="chat-header">
                        <h4>Trading Assistant AI</h4>
                        <button className="chat-close" onClick={() => setOpen(false)}><CloseIcon size={18} /></button>
                    </div>
                    <div className="chat-body">
                        {messages.map((msg, index) => (
                            <div key={index} className={msg.role === "user" ? "user-msg" : "bot-msg"}> {msg.content}</div>
                        ))}
                        {loading && (
                            <div className="bot-msg">
                                Typing...
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-footer">
                        <input value={message} placeholder={loading || typing ? "Trading Assistant is responding..." : "Ask about Forex, Crypto, strategies..."}
                            onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} disabled={loading || typing}
                        />
                        <button1 className="send-button" onClick={sendMessage} disabled={loading || typing}><Send size={18} /></button1>
                    </div>
                </div>
            )}
        </>
    );
}