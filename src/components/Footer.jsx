import "../styles/style.css";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="footer-brand">
                    <h2>Trading App</h2>
                    <p>
                        Educational crypto trading platform featuring
                        live market data, portfolio tracking,
                        trading simulations, analytics,
                        and interactive learning modules.
                    </p>
                </div>
                <div className="footer-col">
                    <h3>Pages</h3>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/wallet">Wallet</Link>
                    <Link to="/news">News</Link>
                    <Link to="/learning">Learning</Link>
                </div>
                <div className="footer-col">
                    <h3>Technologies</h3>
                    <span>React.js</span>
                    <span>JavaScript</span>
                    <span>CSS3</span>
                    <span>Firebase</span>
                    <span>Binance API</span>
                    <span>TradingView</span>
                    <span>NewsAPI</span>
                    <span>Groq</span>
                </div>
                <div className="footer-col">
                    <h3>Resources</h3>
                    <a href="https://www.binance.com" target="_blank" rel="noopener noreferrer">Binance</a>
                    <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer"> TradingView</a>
                    <a href="https://firebase.google.com" target="_blank" rel="noopener noreferrer" >Firebase</a>
                    <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer">NewsAPI</a>
                    <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">Groq </a>
                </div>
            </div>
            <div className="footer-bottom">
                <span>
                    © 2026 Real-Time Trading Platform for Forex and Cryptocurrency Markets
                </span>
            </div>
        </footer >
    );
}