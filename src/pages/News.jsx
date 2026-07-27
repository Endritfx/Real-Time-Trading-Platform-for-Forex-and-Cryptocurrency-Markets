import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/news.css";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { FaHeart, FaRegHeart } from "react-icons/fa";

export default function News() {
    const [news, setNews] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [savedNews, setSavedNews] = useState([]);
    const [activeTab, setActiveTab] = useState("live");
    const fallbackImage = "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800";

    useEffect(() => {
        async function fetchNews() {
            try {
                const res = await fetch("https://trading-platform-backend-peyh.onrender.com/api/news");
                const data = await res.json();
                setNews(data.articles || []);
            } catch (err) {
                console.log(err);
            }
        }

        const unsub = onAuthStateChanged(auth, async (user) => {
            if (!user) return;

            const userRef = doc(db, "users", user.uid);
            const snap = await getDoc(userRef);

            setSavedNews(snap.data()?.savedNews || []);
        });

        fetchNews();

        return () => unsub();
    }, []);

    function getImpact(score) {
        if (score >= 70) return "high";
        if (score >= 40) return "medium";
        return "low";
    }

    const scoredNews = news
        .map((item) => {
            const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
            let score = 0;
            if (text.includes("etf")) score += 50;
            if (text.includes("sec")) score += 40;
            if (text.includes("fed") || text.includes("federal reserve")) score += 40;
            if (text.includes("interest rate")) score += 40;
            if (text.includes("inflation")) score += 30;
            if (text.includes("hack")) score += 35;
            if (text.includes("exploit")) score += 35;
            if (text.includes("liquidation")) score += 30;
            if (text.includes("crash")) score += 30;
            if (text.includes("rally")) score += 20;
            if (text.includes("bitcoin")) score += 15;
            if (text.includes("ethereum")) score += 15;
            if (text.includes("crypto")) score += 10;
            return { ...item, score };
        })
        .sort((a, b) => b.score - a.score);

    const filteredNews = scoredNews.filter((item) => {
        const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
        const matchSearch = !search || text.includes(search.toLowerCase());
        const matchCategory = !category || text.includes(category.toLowerCase());
        return matchSearch && matchCategory;
    });

    const normalizedSaved = savedNews.map((item) => {
        const text = `${item.title || ""} ${item.description || ""}`.toLowerCase();
        let score = 0;
        if (text.includes("etf")) score += 50;
        if (text.includes("sec")) score += 40;
        if (text.includes("fed") || text.includes("federal reserve")) score += 40;
        if (text.includes("interest rate")) score += 40;
        if (text.includes("inflation")) score += 30;
        if (text.includes("hack")) score += 35;
        if (text.includes("exploit")) score += 35;
        if (text.includes("liquidation")) score += 30;
        if (text.includes("crash")) score += 30;
        if (text.includes("rally")) score += 20;
        if (text.includes("bitcoin")) score += 15;
        if (text.includes("ethereum")) score += 15;
        if (text.includes("crypto")) score += 10;
        return {
            ...item, url: item.url, urlToImage: item.image, publishedAt: item.date, score
        };
    });

    const displayedNews = activeTab === "live" ? filteredNews : normalizedSaved;

    async function toggleSaveNews(item) {
        const user = auth.currentUser;
        if (!user) return;

        const alreadySaved = savedNews.some((n) => n.url === item.url);

        const safeImage = item.urlToImage || fallbackImage;

        let updated;

        if (alreadySaved) {
            updated = savedNews.filter((n) => n.url !== item.url);
        } else {
            updated = [
                ...savedNews,
                {
                    title: item.title,
                    url: item.url,
                    image: safeImage,
                    date: item.publishedAt,
                    description: item.description,
                },
            ];
        }

        setSavedNews(updated);

        await updateDoc(doc(db, "users", user.uid), {
            savedNews: updated,
        });
    }

    function timeAgo(dateString) {
        if (!dateString) return "";

        const now = new Date();
        const published = new Date(dateString);

        const diffMs = now - published;

        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return `${seconds}s ago`;
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }
    return (
        <>
            <Navbar />
            <div className="news">
                <div className="top-news">
                    <h1>Crypto Market News</h1>
                    <div className="news-filters">
                        <input className="news-search" type="text" placeholder="Search news..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        <div className="news-filters-right">
                            <button className={`news-icon-btn ${activeTab === "live" ? "active" : ""}`} onClick={() => setActiveTab("live")}>
                                Live
                            </button>
                            <button className={`news-icon-btn ${activeTab === "saved" ? "active" : ""}`} onClick={() => setActiveTab("saved")}>
                                Saved
                            </button>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option value="">All</option>
                                <option value="bitcoin">Bitcoin</option>
                                <option value="ethereum">Ethereum</option>
                                <option value="market">Market</option>
                                <option value="regulation">Regulation</option>
                            </select>
                        </div>
                    </div>
                </div>

                {activeTab === "live" && filteredNews.length > 0 && (
                    <div className="breaking">
                        Breaking: {filteredNews[0].title}
                    </div>
                )}

                <div className="news-grid">
                    {displayedNews.length > 0 ? (
                        displayedNews.slice(0, 18).map((item, index) => {
                            const isSaved = savedNews.some(
                                (n) => n.url === item.url
                            );

                            const impact = getImpact(item.score || 0);

                            return (
                                <div className="news-card" key={index}>

                                    <img className="news-img"
                                        src={item.urlToImage || fallbackImage}
                                        alt={item.title}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = fallbackImage;
                                        }}
                                    />

                                    <div className="news-content">
                                        <div className="news-source">
                                            <span>{item.source?.name || "Crypto News"}</span>
                                            <span>{timeAgo(item.publishedAt)}</span>
                                        </div>
                                        <div className="news-title"> {item.title} </div>
                                        <div className="news-desc">
                                            {(item.description || "")
                                                .replace(/<[^>]*>/g, "")
                                                .substring(0, 120)}
                                            ...
                                        </div>
                                        <div className="news-footer">
                                            <div className={`sentiment ${impact}`}>
                                                {impact.toUpperCase()} IMPACT
                                            </div>
                                            <div className="news-actions">
                                                <button
                                                    className={`bookmark-btn ${isSaved ? "saved" : ""}`}
                                                    onClick={() => toggleSaveNews(item)}
                                                >
                                                    {isSaved ? <FaHeart /> : <FaRegHeart />}
                                                </button>
                                                <a
                                                    className="news-link"
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Read
                                                </a>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="loading">No market-impact news found</div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}