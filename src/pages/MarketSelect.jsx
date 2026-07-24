import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../styles/market-select.css";

export default function MarketSelect() {

    const navigate = useNavigate();
    useEffect(() => {
        const elements = document.querySelectorAll(".reveal");

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("active");
                    }
                });
            },
            {
                threshold: 0.15,
            }
        );

        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (

        <div className="market-page">
            <div className="bg-glow glow1"></div>
            <div className="bg-glow glow2"></div>
            {/* HERO */}
            <section className="market-hero">
                <div className="market-badge">
                    REAL-TIME FOREX & CRYPTO PLATFORM
                </div>
                <h1> Learn The Markets. <br /> <span> Build Real Trading Knowledge. </span> </h1>
                <p>
                    A complete financial learning platform that combines
                    real-time market data, trading practice, AI assistance
                    and professional tools for Crypto and Forex.

                    Learn, analyze and improve your trading knowledge
                    in a realistic market environment before making real decisions.
                </p>
                <div className="hero-stats">
                    <div>
                        <span>📚</span>
                        <h3> Learning </h3>
                        <p> Courses & market education </p>
                    </div>
                    <div>
                        <span>📊</span>
                        <h3> Live Data </h3>
                        <p> Real-time prices & charts</p>
                    </div>
                    <div>
                        <span>🤖</span>
                        <h3> AI Support</h3>
                        <p> Smart trade analysis</p>
                    </div>
                    <div>
                        <span>🎯</span>
                        <h3> Practice</h3>
                        <p> Risk-free simulation</p>
                    </div>
                </div>
            </section>
            {/* INTRO */}
            <section className="intro reveal">
                <h2> One Platform. Complete Market Experience. </h2>
                <p>
                    Instead of using multiple platforms,
                    this project combines education,
                    market analysis, AI assistance and trading tools
                    into one complete environment.

                    Users can learn, practice and improve their
                    skills step by step.
                </p>
            </section>
            {/* MARKETS */}
            <h2 className="choose-title">
                Choose Your Trading Environment
            </h2>
            <div className="market-grid reveal">
                {/* CRYPTO */}
                <div className="market-card crypto-card">
                    <div className="card-badge">
                        POPULAR MARKET
                    </div>
                    <div className="market-icon">
                        ₿
                    </div>
                    <h2>
                        Crypto Market
                    </h2>
                    <h3>
                        Learn, analyze and practice digital assets
                    </h3>
                    <p>
                        Explore cryptocurrency markets with live prices,
                        interactive charts, portfolio management and
                        real-time market information.

                        Learn strategies, analyze movements and practice
                        before making real trading decisions.
                    </p>
                    <div className="features">
                        <div>✔ Live Crypto Prices </div>
                        <div>✔ Advanced Charts</div>
                        <div>✔ Portfolio System</div>
                        <div>✔ Market News</div>
                        <div>✔ AI Assistant</div>
                        <div>✔ Learning Modules</div>
                    </div>
                    <button onClick={() => navigate("/dashboard")}>
                        Explore Crypto Market
                    </button>
                </div>
                {/* FOREX */}
                <div className="market-card forex-card">
                    <div className="card-badge">
                        PROFESSIONAL MARKET
                    </div>
                    <div className="market-icon">
                        📈
                    </div>
                    <h2>
                        Forex Market
                    </h2>
                    <h3>
                        Master global currency markets
                    </h3>
                    <p>
                        Explore currency markets with professional tools.
                        Analyze currency pairs, economic events and market
                        conditions using real-time Forex data.
                    </p>
                    <div className="features">
                        <div>✔ Live Forex Rates</div>
                        <div>✔ Economic Calendar</div>
                        <div>✔ Forex Calculator</div>
                        <div>✔ FX News</div>
                        <div>✔ AI Trade Review</div>
                        <div>✔ Risk Management</div>
                    </div>
                    <button className="forex-btn" onClick={() => navigate("/forex/ForexTrading")}>
                        Explore Forex Market
                    </button>
                </div>
            </div>
        </div>
    )
}