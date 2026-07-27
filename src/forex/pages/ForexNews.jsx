import ForexNavbar from "../components/ForexNavbar";
import ForexFooter from "../components/ForexFooter";
import ForexNewsWidget from "../components/ForexNewsWidget";
import "../styles/forex-news.css";

export default function ForexNews() {
    return (
        <>
            <ForexNavbar />
            <div className="forex-news-page">
                <div className="news-hero1">
                    <h1>Latest Forex & Financial News</h1>
                    <p>
                        Follow major market headlines,
                        economic developments and global
                        events affecting Forex markets.
                    </p>
                </div>
                <ForexNewsWidget />
            </div>
            <ForexFooter />
        </>
    );
}