import ForexNavbar from "../components/ForexNavbar";
import ForexFooter from "../components/ForexFooter";
import EconomicCalendarWidget from "../components/EconomicCalendarWidget";
import "../styles/economic-calendar.css";

export default function EconomicCalendar() {
    return (
        <>
            <ForexNavbar />
            <div className="economic-calendar-page">
                {/* HERO */}
                <div className="calendar-hero">
                    <div className="hero-overlay"></div>
                    <h1>Stay Ahead Of Market Events</h1>
                    <p>
                        Track important economic releases,
                        interest rate decisions, inflation reports
                        and high-impact market events that move
                        Forex prices.
                    </p>
                    <div className="hero-stats">
                        <div className="hero-stat-card">
                            <h3>500+</h3>
                            <span>Economic Events</span>
                        </div>
                        <div className="hero-stat-card">
                            <h3>24/5</h3>
                            <span>Forex Market</span>
                        </div>
                        <div className="hero-stat-card">
                            <h3>Live</h3>
                            <span>News Updates</span>
                        </div>
                    </div>
                </div>
                {/* WIDGET */}
                <div className="calendar-content">
                    <div className="calendar-left">
                        <EconomicCalendarWidget />
                    </div>
                </div>
            </div>
            <ForexFooter />
        </>
    );
}