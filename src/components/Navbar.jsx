import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import Chatbot from "../forex/components/Chatbot";
import { FiMenu } from "react-icons/fi";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await signOut(auth);
            navigate("/");
        } catch (err) {
            console.error("Logout error:", err);
        }
    }

    function isActive(path) {
        return location.pathname === path;
    }

    return (
        <nav className="navbar">
            {/* LOGO */}
            <Link to="/marketselect" className="logo">
                <span>Trading App</span>
            </Link>
            {/* MOBILE BUTTON */}
            <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}><FiMenu /></button>
            {/* LINKS */}
            <div className={`nav-links ${menuOpen ? "show" : ""}`}>
                <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""} onClick={() => setMenuOpen(false)} >
                    Dashboard
                </Link>
                <Link to="/wallet" className={isActive("/wallet") ? "active" : ""} onClick={() => setMenuOpen(false)}>
                    Wallet
                </Link>
                <Link to="/leaderboard" className={isActive("/leaderboard") ? "active" : ""} onClick={() => setMenuOpen(false)}>
                    Leaderboard
                </Link>
                <Link to="/news" className={isActive("/news") ? "active" : ""} onClick={() => setMenuOpen(false)}>
                    News
                </Link>
                <Link to="/learning" className={isActive("/learning") ? "active" : ""} onClick={() => setMenuOpen(false)}>
                    Learning
                </Link>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
            <Chatbot />
        </nav >
    );
}