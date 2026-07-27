import { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { IoClose } from "react-icons/io5";
import { RiBookmarkLine, RiBookmarkFill } from "react-icons/ri";

export default function ForexNewsWidget() {
    const [news, setNews] = useState([]);
    const [savedNews, setSavedNews] = useState([]);
    const [showSaved, setShowSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNews();
        loadSavedNews();
        const interval = setInterval(
            loadNews,
            300000
        );
        return () =>
            clearInterval(interval);
    }, []);

    async function loadNews() {
        try {
            const cachedNews = localStorage.getItem("forexNewsCache");
            if (cachedNews) {
                setNews(
                    JSON.parse(
                        cachedNews
                    )
                );
                setLoading(false);
            }
            const response = await fetch("https://trading-platform-backend-peyh.onrender.com/api/forex-news");
            const data = await response.json();
            const filteredNews = data.filter(article => {
                const title = article.headline.toLowerCase();
                return (
                    article.image && !article.image.toLowerCase().includes("reuters") &&
                    (
                        title.includes("usd") ||
                        title.includes("eur") ||
                        title.includes("gbp") ||
                        title.includes("jpy") ||
                        title.includes("fed") ||
                        title.includes("ecb") ||
                        title.includes("interest rate") ||
                        title.includes("inflation") ||
                        title.includes("cpi") ||
                        title.includes("employment") ||
                        title.includes("gdp") ||
                        title.includes("fomc") ||
                        title.includes("market") ||
                        title.includes("economy") ||
                        title.includes("central bank") ||
                        title.includes("currency") ||
                        title.includes("dollar") ||
                        title.includes("euro") ||
                        title.includes("yen") ||
                        title.includes("sterling") ||
                        title.includes("bank") ||
                        title.includes("rates") ||
                        title.includes("rate") ||
                        title.includes("stocks") ||
                        title.includes("trading") ||
                        title.includes("investors") ||
                        title.includes("financial") ||
                        title.includes("economic") ||
                        title.includes("treasury") ||
                        title.includes("bond") ||
                        title.includes("recession") ||
                        title.includes("growth") ||
                        title.includes("oil") ||
                        title.includes("gold") ||
                        title.includes("risk") ||
                        title.includes("tariff") ||
                        title.includes("exports") ||
                        title.includes("imports")
                    )
                );
            });
            const finalNews = filteredNews.slice(0, 12);
            setNews(finalNews);
            localStorage.setItem("forexNewsCache", JSON.stringify(finalNews));
            setLoading(false);
        }

        catch (error) {
            console.error(error);
            setLoading(false);
        }
    }

    async function loadSavedNews() {
        const user = auth.currentUser;
        if (!user) return;
        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
            setSavedNews(snap.data().savedForexNews || []);
        }
    }

    async function saveNews(article) {
        try {
            const user = auth.currentUser;
            if (!user) return;
            const exists = savedNews.some(item => item.id === article.id);
            let updatedNews;
            if (exists) {
                updatedNews = savedNews.filter(
                    item => item.id !== article.id
                );
            } else {
                updatedNews = [
                    ...savedNews,
                    {
                        id: article.id,
                        headline: article.headline,
                        image: article.image,
                        url: article.url,
                        source: article.source,
                        datetime: article.datetime
                    }
                ];
            }
            await updateDoc(doc(db, "users", user.uid),
                {
                    savedForexNews: updatedNews
                }
            );
            setSavedNews(updatedNews);
        }
        catch (error) {
            console.error("SAVE ERROR:", error);
        }
    }

    async function removeNews(id) {
        const user = auth.currentUser;
        if (!user) return;
        const updatedNews = savedNews.filter(item => item.id !== id);
        await updateDoc(doc(db, "users", user.uid),
            {
                savedForexNews: updatedNews
            }
        );
        setSavedNews(updatedNews);
    }

    function getTimeAgo(timestamp) {
        const seconds = Math.floor(Date.now() / 1000 - timestamp);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (minutes < 60)
            return `${minutes} min ago`;
        if (hours < 24)
            return `${hours} h ago`;
        return `${days} d ago`;
    }

    function getImpact(headline) {
        if (!headline)
            return "LOW";
        const title = headline.toLowerCase();
        if (
            title.includes("fed") ||
            title.includes("fomc") ||
            title.includes("interest") ||
            title.includes("inflation") ||
            title.includes("cpi") ||
            title.includes("rate")
        ) {
            return "HIGH";
        }
        if (
            title.includes("usd") ||
            title.includes("eur") ||
            title.includes("gdp") ||
            title.includes("employment") ||
            title.includes("economy") ||
            title.includes("market")
        ) {
            return "MEDIUM";
        }
        return "LOW";
    }
    if (
        loading && news.length === 0
    ) {
        return (
            <div className="news-loading">
                <h2>Loading Forex News...</h2>
            </div>
        );
    }
    const displayedNews = showSaved ? savedNews : news;

    function isSaved(articleId) {
        return savedNews.some(item => item.id === articleId
        );
    }

    return (
        <div className="forex-news-widget">
            <div className="news-tabs1">
                <button className={!showSaved ? "active-tab" : ""} onClick={() => setShowSaved(false)}>  All News</button>
                <button className={showSaved ? "active-tab" : ""} onClick={() => setShowSaved(true)}> Saved News</button>
            </div>
            {
                showSaved && displayedNews.length === 0 && (
                    <div className="empty-saved-news">
                        <div className="empty-icon"></div>
                        <h2>No Saved News Yet</h2>
                        <p>
                            Save interesting Forex news articles
                            and they will appear here.
                        </p>
                    </div>
                )
            }
            {
                displayedNews.length > 0 && (
                    <div className="news-grid1">
                        {
                            displayedNews.map((article) => (
                                <a key={article.id} href={article.url} target="_blank" rel="noreferrer" className="news-card1">
                                    <div className="news-top-bar1">
                                        <span className={`impact-badge ${getImpact(article.headline).toLowerCase()}`}>
                                            {getImpact(article.headline)}
                                        </span>
                                    </div>
                                    {
                                        article.image && (
                                            <img src={article.image} alt="" />
                                        )
                                    }
                                    <h3>{article.headline}</h3>
                                    <div className="news-actions1">
                                        {
                                            showSaved ?
                                                (
                                                    <button className="remove-news-btn" onClick={(e) => {
                                                        e.preventDefault();
                                                        removeNews(article.id);
                                                    }}>  <IoClose />
                                                    </button>
                                                )
                                                :
                                                (
                                                    <button className={`save-news-btn1 ${isSaved(article.id) ? "saved" : ""}`} onClick={(e) => {
                                                        e.preventDefault();
                                                        saveNews(article);
                                                    }}>{isSaved(article.id)
                                                        ? <RiBookmarkFill />
                                                        : <RiBookmarkLine />
                                                        }
                                                    </button>
                                                )
                                        }
                                    </div>
                                    <div className="news-footer1">
                                        <span className="news-source1">
                                            {article.source}
                                        </span>
                                        <span className="news-time1">
                                            {getTimeAgo(article.datetime)}
                                        </span>
                                    </div>
                                </a>
                            ))
                        }
                    </div>
                )
            }
        </div>
    );
}