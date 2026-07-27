import { auth, db } from "../../services/firebase";
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import ForexNavbar from "../components/ForexNavbar";
import ForexFinalExam from "../components/ForexFinalExam";
import ForexCertificate from "../components/ForexCertificate";
import ForexFooter from "../components/ForexFooter";
import "../styles/forex-learning.css";
import { FaCheckCircle } from "react-icons/fa";
import { IoChevronUp, IoChevronDown } from "react-icons/io5";

export default function ForexLearning() {

    const [activeSection, setActiveSection] = useState("basics");
    const [openChapter, setOpenChapter] = useState(null);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [examMode, setExamMode] = useState(null);
    const [examPassed, setExamPassed] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadProgress();
    }, []);

    async function loadProgress() {
        try {
            const user = auth.currentUser;
            if (!user)
                return;
            const snap = await getDoc(doc(db, "users", user.uid));

            if (snap.exists()) {
                setCompletedLessons(snap.data().completedForexLessons || []);
                setExamPassed(snap.data().forexExamPassed || false);
                setShowCertificate(false);
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    async function completeLesson(title) {
        try {
            const user = auth.currentUser;
            if (!user)
                return;
            await setDoc(doc(db, "users", user.uid),
                {
                    completedForexLessons: arrayUnion(title)
                },
                {
                    merge: true
                }
            );

            setCompletedLessons(prev => prev.includes(title) ? prev : [...prev, title]);
        }
        catch (err) {
            console.log(err);
        }
    }

    async function retakeExam() {
        const user = auth.currentUser;
        if (!user)
            return;
        await updateDoc(doc(db, "users", user.uid),
            {
                forexExamPassed: false, forexCertificate: false
            }
        );
        setExamPassed(false);
        setShowCertificate(false);
        setExamMode("exam");
    }

    const content = {
        basics: {
            title: " Forex Basics",
            description:
                "Learn the fundamentals of the Forex Market.",
            chapters: [
                {
                    title: "What is Forex?",
                    text: "Forex (Foreign Exchange Market) is the global marketplace where currencies are bought and sold. It is the largest financial market in the world, with more than $7 trillion traded every day. Unlike stock markets, Forex operates 24 hours a day from Monday to Friday because trading takes place across different financial centers around the world. Traders participate in Forex to profit from changes in exchange rates between currencies. Banks, governments, institutions and retail traders all contribute to the market's liquidity. Understanding how Forex works is the foundation of becoming a successful trader."
                },

                {
                    title: "Currency Pairs",
                    text: "Currencies are always traded in pairs because when one currency is bought, another currency is sold. For example, in EUR/USD, the Euro is the base currency and the US Dollar is the quote currency. If EUR/USD rises, it means the Euro is gaining value against the Dollar. Currency pairs allow traders to speculate on the strength or weakness of one economy compared to another. Understanding currency pairs is essential because every Forex trade is based on the relationship between two currencies."
                },

                {
                    title: "Major Pairs",
                    text: "Major currency pairs are the most traded pairs in the Forex market and always include the US Dollar. Examples include EUR/USD, GBP/USD, USD/JPY and USD/CHF. These pairs generally have high liquidity and lower spreads because they are actively traded by millions of market participants. Major pairs often provide smoother price movements and are usually recommended for beginner traders. Because of their popularity, they also receive the most market analysis and news coverage."
                },

                {
                    title: "Minor Pairs",
                    text: "Minor currency pairs do not include the US Dollar but still involve major global currencies. Examples include EUR/GBP, EUR/JPY and GBP/JPY. Although they are less liquid than major pairs, they can still provide excellent trading opportunities. Minor pairs often react strongly to economic news from the countries involved. Traders who understand the behavior of these currencies can find unique opportunities outside of the most popular markets."
                },

                {
                    title: "Exotic Pairs",
                    text: "Exotic currency pairs consist of one major currency and one currency from an emerging or developing economy. Examples include USD/TRY, USD/ZAR and EUR/SEK. These pairs often have wider spreads and lower liquidity than major pairs. Because of this, price movements can be more volatile and unpredictable. Exotic pairs can offer large profit opportunities, but they also carry greater risk and are generally better suited for experienced traders."
                },

                {
                    title: "Pips",
                    text: "A pip is the smallest standard unit used to measure price movement in the Forex market. In most currency pairs, a pip represents the fourth decimal place. For example, if EUR/USD moves from 1.1000 to 1.1001, it has moved one pip. Traders use pips to calculate profits, losses and risk. Understanding pips is essential because almost every trading calculation is based on pip movement."
                },

                {
                    title: "Lots",
                    text: "A lot is the standard measurement used to define trade size in Forex. A standard lot equals 100,000 units of a currency, while a mini lot equals 10,000 units and a micro lot equals 1,000 units. The lot size directly affects how much profit or loss is generated from each pip movement. Choosing the correct lot size is an important part of risk management. Professional traders adjust their lot size according to account balance and stop-loss distance."
                },

                {
                    title: "Leverage",
                    text: "Leverage allows traders to control larger positions using a smaller amount of capital. For example, with 1:100 leverage, a trader can control a $10,000 position using only $100. While leverage can significantly increase profits, it can also magnify losses. Many beginner traders fail because they use excessive leverage without proper risk management. Successful traders understand that leverage is a tool, not a strategy."
                },

                {
                    title: "Margin",
                    text: "Margin is the amount of money required by a broker to open and maintain a trading position. It acts as a security deposit rather than a fee. The required margin depends on the leverage being used and the size of the trade. If account equity falls below the required margin level, the broker may issue a margin call or automatically close positions. Understanding margin helps traders avoid unnecessary account losses."
                },

                {
                    title: "Spread",
                    text: "The spread is the difference between the buying price (Ask) and selling price (Bid) of a currency pair. It represents the broker's compensation for facilitating the trade. Lower spreads generally mean lower trading costs. Major currency pairs usually have smaller spreads because of high liquidity. Traders should always consider spread costs when calculating risk and potential profit."
                },

                {
                    title: "Trading Sessions",
                    text: "The Forex market operates through four major trading sessions: Sydney, Tokyo, London and New York. Each session has unique characteristics and levels of volatility. The London and New York sessions typically generate the highest trading volume because they involve major financial centers. Understanding trading sessions helps traders choose the best times to enter the market. Different strategies may perform better during specific sessions."
                },

                {
                    title: "Bid & Ask Price",
                    text: "Every Forex quote contains two prices: the Bid price and the Ask price. The Bid price is the price at which traders can sell a currency pair, while the Ask price is the price at which they can buy it. The difference between these two prices is called the spread. Understanding Bid and Ask prices is important because every trade starts with a small cost due to the spread. This concept is fundamental to understanding order execution."
                }

            ]
        },

        technical: {
            title: " Technical Analysis",
            description:
                "Understand charts and market behavior.",
            chapters: [
                {
                    title: "Support & Resistance",
                    text: "Support and resistance are among the most important concepts in technical analysis. Support is a price level where buying pressure tends to increase, preventing the market from falling further. Resistance is a level where selling pressure often appears, preventing the market from moving higher. Traders use these levels to identify potential entry and exit points. Strong support and resistance zones can influence price for days, weeks or even months. Learning to identify these levels accurately is a key skill for every trader."
                },

                {
                    title: "Trend Analysis",
                    text: "Trend analysis helps traders determine the overall direction of the market. An uptrend is characterized by higher highs and higher lows, while a downtrend forms lower highs and lower lows. Trading in the direction of the trend generally increases the probability of success. Traders often use trendlines, moving averages and market structure to identify trends. Understanding trend direction helps traders avoid taking trades against market momentum."
                },

                {
                    title: "Market Structure",
                    text: "Market structure refers to the way price moves through highs and lows over time. A bullish market creates Higher Highs (HH) and Higher Lows (HL), while a bearish market creates Lower Highs (LH) and Lower Lows (LL). By studying market structure, traders can identify trends, reversals and continuation opportunities. Many professional traders rely on market structure before using indicators. It provides a clear picture of how buyers and sellers are behaving."
                },

                {
                    title: "Candlestick Patterns",
                    text: "Candlestick patterns provide important information about market sentiment. Patterns such as Bullish Engulfing, Bearish Engulfing, Pin Bars and Dojis can indicate potential reversals or continuation moves. Traders use these formations to improve entry timing and confirm trade setups. Candlestick patterns are most effective when combined with support and resistance zones. Understanding price action through candlesticks is one of the foundations of technical analysis."
                },

                {
                    title: "RSI",
                    text: "The Relative Strength Index (RSI) is a momentum indicator used to measure the strength of price movements. RSI values range between 0 and 100. Readings above 70 are often considered overbought, while readings below 30 are considered oversold. Traders use RSI to identify potential reversals and momentum shifts. Although RSI can be useful, it should not be used alone and works best when combined with other forms of analysis."
                },

                {
                    title: "Moving Averages",
                    text: "Moving Averages smooth out price fluctuations and help traders identify market trends. Commonly used moving averages include the 50 EMA and 200 EMA. When price is above a moving average, the market is generally considered bullish. When price is below it, the market is considered bearish. Moving averages can also act as dynamic support and resistance levels. Many trading strategies are built around moving average crossovers."
                },

                {
                    title: "MACD",
                    text: "The Moving Average Convergence Divergence (MACD) indicator helps traders analyze momentum and trend strength. It consists of two moving average lines and a histogram. Crossovers between the MACD line and signal line can indicate potential buying or selling opportunities. Traders often use MACD to confirm trend direction and identify momentum shifts. Like any indicator, it works best when combined with price action analysis."
                },

                {
                    title: "Volume Analysis",
                    text: "Volume analysis measures the level of market participation behind a price movement. High volume often confirms the strength of a move, while low volume may indicate weakness. Traders use volume to validate breakouts, reversals and trend continuation. Strong trends are usually supported by increasing volume. Understanding volume helps traders distinguish between genuine market moves and false signals."
                },

                {
                    title: "Fibonacci Retracement",
                    text: "Fibonacci Retracement is a tool used to identify potential pullback levels within a trend. Common retracement levels include 38.2%, 50% and 61.8%. Traders use these levels to look for possible entries during market corrections. Fibonacci works particularly well when combined with support, resistance and market structure. It is one of the most widely used tools in technical analysis."
                },

                {
                    title: "Trendlines",
                    text: "Trendlines are lines drawn on a chart to connect important highs or lows. They help traders visualize the direction of the market and identify potential support or resistance areas. A valid trendline should touch multiple points without cutting through price action excessively. Trendlines can also be used to identify breakout opportunities. They are simple yet powerful tools for understanding market behavior."
                },

                {
                    title: "Chart Patterns",
                    text: "Chart patterns are recurring formations that appear on price charts and can provide clues about future market direction. Popular patterns include Triangles, Flags, Pennants, Double Tops, Double Bottoms and Head & Shoulders. These formations help traders identify continuation or reversal opportunities. Understanding chart patterns can improve trade timing and overall market analysis."
                },

                {
                    title: "Multi Timeframe Analysis",
                    text: "Multi Timeframe Analysis involves studying the same market across different timeframes. Traders often use higher timeframes to identify trend direction and lower timeframes for precise entries. For example, a trader may analyze the 4-hour chart for trend direction and use the 15-minute chart for entry execution. This approach provides a broader market perspective and improves decision-making. Many professional traders rely heavily on multi timeframe analysis."
                }

            ]
        },

        strategy: {
            title: " Trading Strategies",
            description:
                "Discover practical trading systems.",
            chapters: [
                {
                    title: "Scalping",
                    text: "Scalping is a short-term trading strategy where traders aim to profit from very small price movements. Scalpers usually hold trades for a few seconds or minutes and may execute dozens of trades in a single day. This strategy requires fast decision-making, strict discipline and a reliable trading plan. Scalping works best during highly liquid market sessions such as London and New York. Because profit targets are small, risk management becomes extremely important. Beginners should practice extensively before using this strategy on a live account."
                },

                {
                    title: "Day Trading",
                    text: "Day Trading involves opening and closing all trades within the same trading day. Traders avoid holding positions overnight, reducing exposure to unexpected news events. Day traders typically use technical analysis, support and resistance levels and market structure to identify opportunities. This strategy offers a balance between trade frequency and risk. Success in day trading requires patience, discipline and consistency. Many professional traders prefer day trading because it allows them to avoid overnight market uncertainty."
                },

                {
                    title: "Swing Trading",
                    text: "Swing Trading focuses on capturing larger market movements that can last several days or even weeks. Traders analyze higher timeframes to identify trends and major market opportunities. Because trades remain open longer, swing traders are less affected by short-term market noise. This strategy requires patience and strong emotional control. Swing trading is popular among people who cannot monitor charts throughout the day. It often provides a favorable balance between effort and potential reward."
                },

                {
                    title: "Breakout Trading",
                    text: "Breakout Trading involves entering the market when price breaks through an important support or resistance level. Breakouts often indicate that strong momentum is entering the market. Traders look for confirmation such as increased volume or strong candlestick closes before entering. Successful breakouts can lead to significant price movements. However, false breakouts are common, which is why confirmation is important. Risk management should always be used when trading breakouts."
                },

                {
                    title: "Retest Entry",
                    text: "A Retest Entry occurs when price breaks an important level and then returns to test it before continuing in the breakout direction. Many traders prefer retest entries because they provide better risk-to-reward opportunities compared to entering immediately after a breakout. Retests often offer more precise stop-loss placement. This strategy is commonly used alongside support and resistance analysis. Learning to identify quality retests can significantly improve trade accuracy."
                },

                {
                    title: "Trend Following",
                    text: "Trend Following is one of the simplest and most effective trading strategies. The idea is to trade in the same direction as the overall market trend. Traders identify an uptrend or downtrend and look for opportunities to join the movement rather than predict reversals. Trend following reduces the risk of fighting market momentum. Many professional traders believe that the trend is one of the strongest advantages available in the market."
                },

                {
                    title: "Range Trading",
                    text: "Range Trading is used when the market moves sideways between support and resistance levels. Traders buy near support and sell near resistance, expecting price to remain within the range. This strategy works best during periods of low volatility. Understanding market structure is essential for identifying valid trading ranges. Traders should always be prepared for potential breakouts that may end the range."
                },

                {
                    title: "London Session Strategy",
                    text: "The London trading session is one of the most active periods in the Forex market. High liquidity and strong volatility create many trading opportunities. Traders often focus on breakouts, trend continuation and market structure during this session. The first few hours of the London session are particularly important because significant institutional activity enters the market. Many professional Forex traders consider London the most important trading session."
                },

                {
                    title: "New York Session Strategy",
                    text: "The New York session overlaps with the London session for several hours, creating some of the highest trading volume of the day. Major economic news releases often occur during this period, leading to increased volatility. Traders focus on momentum setups, breakouts and continuation patterns. Because of the high activity level, risk management becomes even more important. Understanding New York session behavior can help traders take advantage of strong market movements."
                },

                {
                    title: "News Trading",
                    text: "News Trading involves taking positions based on major economic announcements and financial events. Examples include interest rate decisions, inflation reports, employment data and GDP releases. News can create rapid price movements and increased volatility. While this strategy can offer significant opportunities, it also carries higher risk due to unpredictable market reactions. Successful news traders understand economic calendars and prepare their trades before major announcements occur."
                }

            ]
        },

        smc: {
            title: " Smart Money Concepts",
            description:
                "Learn how institutions move the market.",
            chapters: [
                {
                    title: "Market Structure",
                    text: "Market Structure is the foundation of Smart Money Concepts. It helps traders understand whether the market is moving in a bullish or bearish direction. A bullish structure is formed by Higher Highs (HH) and Higher Lows (HL), while a bearish structure is formed by Lower Highs (LH) and Lower Lows (LL). Institutions often follow market structure when making trading decisions. By identifying structure correctly, traders can align themselves with the dominant market direction instead of trading against it. Understanding market structure is essential before learning advanced SMC concepts."
                },

                {
                    title: "Break Of Structure (BOS)",
                    text: "Break Of Structure, commonly known as BOS, occurs when price breaks a significant swing high or swing low in the direction of the current trend. A BOS confirms that the market intends to continue moving in the same direction. For example, in an uptrend, a break above a previous high often signals bullish continuation. Traders use BOS as confirmation before entering trades. It provides evidence that buyers or sellers remain in control of the market. Many institutional trading models rely heavily on BOS confirmation."
                },

                {
                    title: "CHOCH",
                    text: "CHOCH stands for Change Of Character. It occurs when the market breaks a key structure level in the opposite direction of the current trend. Unlike BOS, which suggests continuation, CHOCH may indicate the beginning of a trend reversal. Traders use CHOCH as an early warning signal that market sentiment could be changing. While CHOCH does not guarantee a reversal, it often provides valuable information about potential shifts in market control. Combining CHOCH with liquidity and order flow analysis improves accuracy."
                },

                {
                    title: "Liquidity",
                    text: "Liquidity refers to areas in the market where a large number of pending orders and stop losses are concentrated. Institutions often target these areas because they require liquidity to execute large positions efficiently. Liquidity is commonly found above recent highs, below recent lows and around obvious support or resistance levels. Many retail traders place stop losses in predictable locations, making them attractive targets for larger market participants. Understanding liquidity helps traders avoid common traps and identify potential institutional activity."
                },

                {
                    title: "Internal Liquidity",
                    text: "Internal Liquidity exists inside the current trading range or market structure. It usually consists of smaller highs and lows that have not yet been swept. Institutions may target internal liquidity before continuing toward larger objectives. Internal liquidity often provides clues about short-term price movements. Traders use these areas to anticipate market reactions and improve trade entries. Understanding internal liquidity helps build a more detailed view of market behavior."
                },

                {
                    title: "External Liquidity",
                    text: "External Liquidity is found outside the current trading range, typically above major highs or below major lows. These areas contain large amounts of stop-loss orders and pending positions. Institutions frequently target external liquidity because it provides the volume necessary for large transactions. After liquidity is collected, price may reverse sharply or continue aggressively. Many Smart Money traders focus on identifying external liquidity before entering trades."
                },

                {
                    title: "Inducement",
                    text: "Inducement is a market move designed to encourage traders to enter positions before the actual institutional move occurs. It often creates a false sense of confidence, attracting buyers or sellers into poor positions. Once enough liquidity is created, institutions may move price in the opposite direction. Inducement is one of the reasons why many retail traders experience stop-loss hunts. Learning to recognize inducement can significantly improve trading decisions and reduce emotional trading."
                },

                {
                    title: "Order Blocks",
                    text: "Order Blocks are areas where institutions are believed to have placed large buy or sell orders before a significant market move. These zones often act as future support or resistance levels when price returns to them. Traders use Order Blocks to identify potential entry points with favorable risk-to-reward ratios. Not every candle qualifies as an Order Block, which is why understanding market structure is important. Properly identified Order Blocks can provide highly accurate trading opportunities."
                },

                {
                    title: "Breaker Blocks",
                    text: "Breaker Blocks are failed Order Blocks that become important market zones after structure changes. When a previously respected Order Block fails, it can often serve as support or resistance in the future. Breaker Blocks are frequently used by Smart Money traders to identify continuation opportunities after a market reversal. They provide additional confirmation when combined with liquidity and market structure analysis. Understanding Breaker Blocks adds depth to institutional trading strategies."
                },

                {
                    title: "Fair Value Gaps",
                    text: "Fair Value Gaps (FVGs) are price imbalances created when the market moves aggressively and leaves an area with little or no trading activity. These gaps represent inefficiencies in the market that price often revisits before continuing its trend. Traders use FVGs to identify high-probability entry zones. Fair Value Gaps are especially powerful when aligned with Order Blocks and market structure. Many institutional trading models incorporate FVGs as part of their execution process."
                },

                {
                    title: "Mitigation Blocks",
                    text: "Mitigation Blocks are areas where institutions return to manage or rebalance previous positions. These zones often appear after a strong market movement and can act as important reaction points. Traders look for price to revisit Mitigation Blocks before continuing in the intended direction. They are commonly used together with liquidity analysis and market structure. Understanding Mitigation Blocks helps traders identify where institutions may re-enter the market."
                },

                {
                    title: "Premium & Discount",
                    text: "Premium and Discount concepts help traders determine whether price is relatively expensive or cheap within a given trading range. The upper half of a range is considered Premium, while the lower half is considered Discount. Smart Money traders generally prefer buying in Discount areas and selling in Premium areas. This approach improves risk-to-reward opportunities and aligns trading decisions with institutional logic. Premium and Discount analysis is often combined with Fibonacci levels, liquidity and market structure."
                }

            ]
        },

        risk: {
            title: " Risk Management",
            description:
                "Protect your capital like a professional trader.",
            chapters: [
                {
                    title: "Risk Per Trade",
                    text:
                        "Professional traders focus on protecting their capital before thinking about profits. A common rule is to risk only 1-2% of the account balance on a single trade. This approach helps traders survive losing streaks and stay consistent over the long term."
                },
                {
                    title: "Position Sizing",
                    text:
                        "Position sizing is the process of determining how large your trade should be. The correct lot size depends on your account balance, risk percentage, and stop-loss distance. Proper position sizing ensures that every trade follows your risk management plan."
                },
                {
                    title: "Risk Reward Ratio",
                    text:
                        "The risk-reward ratio compares the amount you are willing to lose with the amount you expect to gain. For example, risking $100 to potentially earn $300 gives a 1:3 risk-reward ratio. Successful traders often look for trades with favorable risk-reward opportunities."
                },
                {
                    title: "Stop Loss Placement",
                    text:
                        "A stop loss is a protective order that automatically closes a trade when the market reaches a predefined level. Proper stop-loss placement should be based on market structure and technical analysis rather than emotions. It helps prevent large and unexpected losses."
                },
                {
                    title: "Daily Loss Limit",
                    text:
                        "A daily loss limit is the maximum amount of money a trader allows themselves to lose in a single day. Once this limit is reached, trading should stop for the day. This rule helps traders avoid emotional decisions and protects the trading account from significant damage."
                },
                {
                    title: "Maximum Drawdown",
                    text:
                        "Drawdown represents the decline of an account from its highest point to its lowest point. Managing drawdown is critical because recovering from large losses requires significantly higher percentage gains. Professional traders always focus on keeping drawdowns small."
                },
                {
                    title: "Trading Psychology",
                    text:
                        "Trading psychology refers to the emotions and mindset involved in decision-making. Fear, greed, impatience, and overconfidence can negatively affect performance. Developing discipline and emotional control is just as important as having a profitable strategy."
                },
                {
                    title: "Revenge Trading",
                    text:
                        "Revenge trading happens when traders try to recover losses immediately after a losing trade. This behavior often leads to poor decisions, larger losses, and emotional trading. Successful traders accept losses as part of the business and follow their trading plan."
                },
                {
                    title: "Overtrading",
                    text:
                        "Overtrading occurs when traders take too many trades without valid setups. This often results from boredom, greed, or the desire to make money quickly. Quality trades are always more important than quantity."
                },
                {
                    title: "Trading Journal",
                    text:
                        "A trading journal is a record of all trading activity, including entries, exits, profits, losses, and emotions. Reviewing a journal helps traders identify mistakes, improve strategies, and develop consistency over time."
                },
                {
                    title: "Consistency",
                    text:
                        "Consistency is one of the most important traits of successful traders. Rather than focusing on making large profits quickly, professional traders aim to follow their plan repeatedly and execute high-quality trades over a long period."
                },
                {
                    title: "Funded Account Rules",
                    text:
                        "Prop firms and funded accounts usually have strict rules regarding daily loss limits, maximum drawdowns, and risk management. Understanding and respecting these rules is essential for passing evaluations and maintaining funded trader status."
                }
            ]
        }
    };

    const totalLessons = Object.values(content).reduce((total, section) => total + section.chapters.length, 0);
    const progressPercentage = Math.round((completedLessons.length / totalLessons) * 100);
    const allCompleted = completedLessons.length >= totalLessons;
    const section = content[activeSection];
    const allChapters = Object.entries(content).flatMap(([sectionKey, section]) => section.chapters.map((chapter, index) => ({
        ...chapter,
        index,
        sectionKey,
        sectionTitle: section.title
    })
    )
    );
    const searchResults = searchTerm.length >= 3 ? allChapters.filter(chapter => chapter.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
        || chapter.text
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <>
            {
                examMode !== "exam" &&
                <ForexNavbar />
            }

            {
                examMode !== "exam" && (
                    <div className="forex-learning-page">
                        <div className="forex-hero">
                            <h1>Learn Forex Trading Step By Step</h1>
                            <p>From Beginner to Advanced Trader.</p>
                            <div className="progress-section">
                                <h3>{completedLessons.length}/{totalLessons}Lessons Completed</h3>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
                                </div>
                            </div>
                        </div>
                        <div className="forex-category-grid">
                            {
                                Object.keys(content).map(key => (
                                    <div key={key} className={`forex-category-card ${activeSection === key ? "active" : ""}`} onClick={() => {
                                        setActiveSection(key);
                                        setOpenChapter(null);
                                    }}
                                    >
                                        <h3>{content[key].title}</h3>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="forex-content-box">
                            <h2>{section.title}</h2>
                            <p>{section.description}</p>
                            <div className="lesson-search">
                                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search lesson..." />
                            </div>
                            {
                                searchTerm.length >= 3 &&
                                (
                                    <div className="search-results">
                                        <h3>Search Results</h3>
                                        {
                                            searchResults.map((chapter, index) => (
                                                <div key={index} className="search-result-card" onClick={() => {
                                                    setActiveSection(chapter.sectionKey);
                                                    setOpenChapter(`${chapter.sectionKey}-${chapter.index}`);
                                                    setSearchTerm("");
                                                }}>
                                                    <span>{chapter.sectionTitle}</span>
                                                    <h4>{chapter.title}</h4>
                                                </div>
                                            )
                                            )
                                        }
                                    </div>
                                )
                            }
                            <div className="chapter-list">
                                {
                                    section.chapters.map((chapter, index) => (
                                        <div key={index} className="chapter-card">
                                            <div className="chapter-header" onClick={() => setOpenChapter(
                                                openChapter === `${activeSection}-${index}` ? null : `${activeSection}-${index}`)}>
                                                <h3>{chapter.title}</h3>
                                                <span className="chapter-status">
                                                    {completedLessons.includes(`${activeSection}-${chapter.title}`) ? (
                                                        <FaCheckCircle className="status-done" />
                                                    ) : openChapter === `${activeSection}-${index}` ? (
                                                        <IoChevronUp className="status-arrow" />
                                                    ) : (
                                                        <IoChevronDown className="status-arrow" />
                                                    )}
                                                </span>
                                            </div>
                                            {
                                                openChapter === `${activeSection}-${index}` &&
                                                (
                                                    <div className="chapter-body">
                                                        <p>{chapter.text}</p>
                                                        {
                                                            completedLessons.includes(`${activeSection}-${chapter.title}`) ?
                                                                <button className="completed-btn5"> Completed</button>
                                                                :
                                                                <button className="complete-btn5" onClick={() => completeLesson(`${activeSection}-${chapter.title}`)}>
                                                                    Mark as Completed
                                                                </button>
                                                        }
                                                    </div>
                                                )
                                            }
                                        </div>
                                    )
                                    )
                                }
                            </div>
                        </div>
                    </div >
                )
            }
            {

                examMode === "exam" &&
                <ForexFinalExam onPass={() => {
                    setExamPassed(true);
                    setExamMode(null);
                }}
                    onExit={() => {
                        setExamMode(null);
                    }}
                />
            }

            {
                allCompleted && !examPassed && examMode !== "exam" &&
                <div className="quiz-unlock">
                    <h2>Forex Academy Completed</h2>
                    <button className="start-quiz-btn" onClick={() => setExamMode("exam")}>
                        Start Final Exam
                    </button>
                </div>
            }
            {
                examPassed &&
                <div className="quiz-unlock">
                    <h2> Congratulations</h2>
                    <button className="start-quiz-btn" onClick={() => setShowCertificate(true)} >
                        View Certificate
                    </button>
                </div>
            }
            {
                showCertificate &&
                <ForexCertificate />
            }
            {
                examMode !== "exam" &&
                <ForexFooter />
            }
        </>
    )
}