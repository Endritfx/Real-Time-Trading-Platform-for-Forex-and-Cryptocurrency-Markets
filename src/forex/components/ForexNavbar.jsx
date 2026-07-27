import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useState } from "react";
import "../styles/forex-navbar.css";
import Chatbot from "../components/Chatbot";
import { FiMenu } from "react-icons/fi";

export default function ForexNavbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    async function handleLogout() {
        await signOut(auth);
        navigate("/");
    }

    return (
        <nav className="forex-navbar">
            {/* LEFT */}
            <Link to="/marketselect" className="forex-logo">
                <span> Trading App</span>
            </Link>
            {/* MOBILE BTN */}
            <button className="forex-menu-btn" onClick={() => setOpen(!open)}>
                <FiMenu />
            </button>
            {/* LINKS */}
            <div className={open ? "forex-links show" : "forex-links"}>
                <Link to="/forex/ForexTrading" className={location.pathname === "/forex/ForexTrading" ? "active" : ""}>
                    Trading
                </Link>
                <Link to="/forex/ForexNews" className={location.pathname === "/forex/ForexNews" ? "active" : ""}>
                    News
                </Link>
                <Link to="/forex/EconomicCalendar" className={location.pathname === "/forex/EconomicCalendar" ? "active" : ""}>
                    Calendar
                </Link>
                <Link to="/forex/ForexLearning" className={location.pathname === "/forex/ForexLearning" ? "active" : ""}>
                    Learning
                </Link>
                <button className="forex-logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
            <Chatbot />
        </nav >
    );
}