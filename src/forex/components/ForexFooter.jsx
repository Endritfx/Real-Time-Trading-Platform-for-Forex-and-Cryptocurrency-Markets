import "../../styles/style.css";
import { Link } from "react-router-dom";

export default function ForexFooter() {
    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="footer-brand">
                    <h2>Trading App</h2>
                    <p>
                        Educational Forex trading platform featuring
                        live exchange rates, AI trade reviews,
                        trading simulations, performance analytics,
                        and interactive learning modules.
                    </p>
                </div>
                <div className="footer-col">
                    <h3>Pages</h3>
                    <Link to="/forex/ForexTrading">Trading</Link>
                    <Link to="/forex/ForexNews">News</Link>
                    <Link to="/forex/EconomicCalendar">Calendar</Link>
                    <Link to="/forex/ForexLearning">Learning</Link>
                </div>
                <div className="footer-col">
                    <h3>Technologies</h3>
                    <span>React.js</span>
                    <span>JavaScript</span>
                    <span>CSS3</span>
                    <span>Firebase</span>
                    <span>TradingView</span>
                    <span>TwelveData</span>
                    <span>Finnhub</span>
                    <span>Groq</span>
                </div>
                <div className="footer-col">
                    <h3>Resources</h3>
                    <a href="https://www.tradingview.com" target="_blank" rel="noopener noreferrer">TradingView</a>
                    <a href="https://firebase.google.com" target="_blank" rel="noopener noreferrer">Firebase </a>
                    <a href="https://twelvedata.com" target="_blank" rel="noopener noreferrer">Twelvedata</a>
                    <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer">Finnhub</a>
                    <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">Groq</a>
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