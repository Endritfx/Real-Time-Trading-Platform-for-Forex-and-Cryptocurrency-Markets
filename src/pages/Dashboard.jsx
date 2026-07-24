import { useEffect, useMemo, useState, useRef } from "react";
import { FaPen, FaTimes } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/style.css";
import { subscribeTrades, subscribeOpenTrades, openTrade, closeTrade, updateTrade } from "../services/tradeService";
import { startLiveTrading, stopLiveTrading, getCurrentPrice } from "../services/liveService";
import { buyCrypto, sellCrypto } from "../services/portfolioService";
import { auth, db } from "../services/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { getMarketStats } from "../services/marketService";

export default function Dashboard() {

    const [pair, setPair] = useState("BTCUSDT");
    const [refresh, setRefresh] = useState(0);
    const [balance, setBalance] = useState(10000);
    const [portfolio, setPortfolio] = useState({});
    const [openTradesData, setOpenTradesData] = useState([]);
    const [tradeHistory, setTradeHistory] = useState([]);
    const [margin, setMargin] = useState("");
    const [leverage, setLeverage] = useState(1);
    const [side, setSide] = useState("buy");
    const [tp, setTp] = useState("");
    const [sl, setSl] = useState("");
    const [buyAmount, setBuyAmount] = useState("");
    const [sellAmount, setSellAmount] = useState("");
    const [buyPercent, setBuyPercent] = useState(0);
    const [sellPercent, setSellPercent] = useState(0);
    const [marketStats, setMarketStats] = useState(null);
    const [toast, setToast] = useState(null);
    const [historyFilter, setHistoryFilter] = useState("newest");
    const [showAllHistory, setShowAllHistory] = useState(false);
    const [cryptoAnalysis, setCryptoAnalysis] = useState(null);
    const [cryptoLoading, setCryptoLoading] = useState(false);
    const [isCryptoDrawerOpen, setIsCryptoDrawerOpen] = useState(false);
    const [symbols, setSymbols] = useState([]);
    const [search, setSearch] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [aiInsight, setAiInsight] = useState("");
    const [aiLoading, setAiLoading] = useState(false);
    const [editingTrade, setEditingTrade] = useState(null);
    const [editTp, setEditTp] = useState("");
    const [editSl, setEditSl] = useState("");
    const closingTrades = useRef(new Set());
    const hasGeneratedAI = useRef(false);
    const dropdownRef = useRef(null);

    const filteredSymbols = useMemo(() => {
        if (!search) return [];
        return symbols.filter(sym =>
            sym.toLowerCase().includes(search.toLowerCase())
        );
    }, [search, symbols]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        startLiveTrading(pair, () => setRefresh(prev => prev + 1));
        return () => { stopLiveTrading(); };
    }, [pair]);

    useEffect(() => {
        async function loadStats() {
            const data =
                await getMarketStats(pair);
            if (data) {
                setMarketStats(data);
            }
        }
        loadStats();
    }, [pair]);

    useEffect(() => {
        let unsubUser = null;
        let unsubTrades = null;
        let unsubOpen = null;

        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (!user) return;
            unsubUser = onSnapshot(
                doc(db, "users", user.uid),
                (snap) => {
                    const data = snap.data();
                    if (!data) return;
                    setBalance(data.balance || 0);
                    setPortfolio(data.portfolio || {});
                }
            );

            unsubTrades = subscribeTrades(setTradeHistory);
            unsubOpen = subscribeOpenTrades(setOpenTradesData);
        });

        return () => {
            unsubscribeAuth();
            if (unsubUser) unsubUser();
            if (unsubTrades) unsubTrades();
            if (unsubOpen) unsubOpen();
        };
    }, []);

    useEffect(() => {

        const oldScript = document.getElementById("tradingview-script");

        if (oldScript) { oldScript.remove(); }

        document.getElementById("tvchart").innerHTML = "";
        const script = document.createElement("script");
        script.id = "tradingview-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;
        script.onload = () => {
            if (window.TradingView) {
                new window.TradingView.widget({
                    autosize: true,
                    symbol: `BINANCE:${pair}`,
                    interval: "15",
                    timezone: "Europe/Skopje",
                    container_id: "tvchart",
                    theme: "dark",
                    style: "1",
                    locale: "en",
                    toolbar_bg: "#0b0e11",
                    enable_publishing: false,
                    allow_symbol_change: true,
                    withdateranges: true,
                    hide_side_toolbar: false,
                    details: true,
                    calendar: true,
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            const currentScript = document.getElementById("tradingview-script");
            if (currentScript) { currentScript.remove(); }
        };

    }, [pair]);

    const livePrice =
        Number(getCurrentPrice(pair)) || 0;

    const stats = useMemo(() => {
        let totalProfit = 0;
        let wins = 0;
        let best = -Infinity;
        let worst = Infinity;

        tradeHistory.forEach((trade) => {
            const profit = Number(trade.profit || 0);
            totalProfit += profit;
            if (profit > 0) wins++;
            if (profit > best) best = profit;
            if (profit < worst) worst = profit;
        });

        return {
            totalProfit,
            totalTrades: tradeHistory.length,
            winRate: tradeHistory.length > 0 ? ((wins / tradeHistory.length) * 100).toFixed(1) : "0",
            bestTrade: best === -Infinity ? 0 : best,
            worstTrade: worst === Infinity ? 0 : worst
        };
    }, [tradeHistory]);

    const livePnl = useMemo(() => {
        let total = 0;
        openTradesData.forEach((trade) => {
            const positionSize = (trade.amount * trade.leverage) / trade.entry;
            const currentTradePrice = Number(getCurrentPrice(trade.pair)) || trade.entry;
            const pnl = trade.side === "buy" ? (
                currentTradePrice - trade.entry
            ) * positionSize
                : (
                    trade.entry - currentTradePrice
                ) * positionSize;
            total += pnl;
        });
        return total;
    }, [openTradesData, livePrice]);

    const filteredTradeHistory = [...tradeHistory];
    if (historyFilter === "newest") {
        filteredTradeHistory.sort(
            (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
        );
    }
    if (historyFilter === "oldest") {
        filteredTradeHistory.sort(
            (a, b) => (a.createdAt || 0) - (b.createdAt || 0)
        );
    }
    if (historyFilter === "profit-high") {
        filteredTradeHistory.sort(
            (a, b) => Number(b.profit || 0) - Number(a.profit || 0)
        );
    }
    if (historyFilter === "profit-low") {
        filteredTradeHistory.sort(
            (a, b) => Number(a.profit || 0) - Number(b.profit || 0)
        );
    }

    useEffect(() => {
        openTradesData.forEach((trade) => {
            const currentPrice = Number(getCurrentPrice(trade.pair));
            if (!currentPrice) return;
            let shouldClose = false;
            if (trade.side === "buy") {
                if (trade.tp > 0 && currentPrice >= trade.tp) { shouldClose = true; }
                if (trade.sl > 0 && currentPrice <= trade.sl) { shouldClose = true; }
            }

            if (trade.side === "sell") {
                if (trade.tp > 0 && currentPrice <= trade.tp) { shouldClose = true; }
                if (trade.sl > 0 && currentPrice >= trade.sl) { shouldClose = true; }
            }

            if (shouldClose) {
                if (closingTrades.current.has(trade.id)) {
                    return;
                }
                closingTrades.current.add(trade.id);
                closeTrade(trade.id, trade, currentPrice)
                    .catch((err) => {
                        console.error(err);
                    })
                    .finally(() => {
                        closingTrades.current.delete(trade.id);
                    });
            }
        });
    }, [openTradesData, refresh]);

    function updateBuyPercent(percent) {
        setBuyPercent(percent);
        const value = (balance * percent) / 100;
        setBuyAmount(value.toFixed(2));
    }

    function updateSellPercent(percent) {
        setSellPercent(percent);
        const owned = Number(portfolio[pair]?.amount || 0);
        const value = (owned * percent) / 100;
        setSellAmount(value.toFixed(6));
    }

    async function handleOpenTrade() {
        try {
            const safeMargin = parseFloat(margin);
            if (!safeMargin || safeMargin <= 0) {
                return showToast("Enter valid margin", "error");
            }
            const entry = livePrice;

            if (side === "buy") {
                if (tp && Number(tp) <= entry) {
                    return showToast("TP must be higher than entry for BUY", "error");
                }
                if (sl && Number(sl) >= entry) {
                    return showToast("SL must be lower than entry for BUY", "error");
                }
            }

            if (side === "sell") {
                if (tp && Number(tp) >= entry) {
                    return showToast("TP must be lower than entry for SELL", "error");
                }
                if (sl && Number(sl) <= entry) {
                    return showToast("SL must be higher than entry for SELL", "error");
                }
            }

            await openTrade({
                pair,
                side,
                amount: safeMargin,
                leverage: Number(leverage),
                tp: tp ? Number(tp) : 0,
                sl: sl ? Number(sl) : 0,
                entry: livePrice
            });

            setMargin("");
            setTp("");
            setSl("");

            showToast(`Position opened on ${pair}`, "success");

        } catch (err) {
            showToast(err.message, "error");
        }
    }

    async function handleBuy() {
        try {
            await buyCrypto(
                pair,
                Number(buyAmount)
            );
            setBuyAmount("");
            showToast(`Successfully bought ${pair}`, "buy");
        } catch (err) {
            showToast(err.message, "error");
        }
    }

    async function handleSell() {
        try {
            await sellCrypto(
                pair,
                Number(sellAmount)
            );
            setSellAmount("");
            showToast(`Successfully sold ${pair}`, "sell");
        } catch (err) {
            showToast(err.message, "error"
            );
        }
    }

    function handleModify(trade) {
        setEditingTrade(trade.id);
        setEditTp(trade.tp || "");
        setEditSl(trade.sl || "");
    }

    async function handleSaveModify(trade) {
        const tpValue = Number(editTp);
        const slValue = Number(editSl);
        const entry = Number(trade.entry);
        const currentPrice = Number(getCurrentPrice(trade.pair)) || entry;

        if (trade.side === "buy") {
            if (tpValue > 0 && tpValue <= entry) {
                return showToast("TP must be above entry price", "error");
            }
            if (slValue > 0 && slValue >= currentPrice) {
                return showToast("SL must be below current price", "error");
            }
        }
        if (trade.side === "sell") {
            if (tpValue > 0 && tpValue >= entry) {
                return showToast("TP must be below entry price", "error");
            }
            if (slValue > 0 && slValue <= currentPrice) {
                return showToast("SL must be above current price", "error");
            }
        }
        await updateTrade(trade.id, tpValue, slValue);
        setEditingTrade(null);
        showToast("Trade updated", "success");
    }

    function showToast(message, type = "success") {
        setToast({ message, type });
        setTimeout(() => { setToast(null); }, 3000);
    }

    async function analyzeCryptoTrade() {
        try {
            setCryptoLoading(true);
            const res = await fetch("http://localhost:5000/analyze-trade", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    pair: pair,
                    orderType: side,
                    hasSL: !!sl,
                    hasTP: !!tp,
                    market: "crypto"
                })
            });
            const data = await res.json();
            setCryptoAnalysis(data.analysis);
        } catch (error) {
            console.error(error);
            setCryptoAnalysis("Error analyzing crypto trade");
        } finally {
            setCryptoLoading(false);
        }
    }

    const generateAIInsight = async () => {
        if (!marketStats) return;
        setAiLoading(true);
        try {
            const res = await fetch("http://localhost:5000/ai-market-insight", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    symbol: pair,
                    currentPrice: livePrice || 0,
                    high24h: marketStats?.high || 0,
                    low24h: marketStats?.low || 0,
                    change24h: marketStats?.changePercent || 0,
                    trend: (marketStats?.changePercent || 0) >= 0 ? "Bullish" : "Bearish"
                })
            });
            const data = await res.json();
            if (!res.ok) {
                console.log("Backend error:", data);
                setAiInsight("AI failed to load data");
                return;
            }
            setAiInsight(data.insight);
        } catch (err) {
            console.log("AI error:", err);
            setAiInsight("AI insight not available right now.");
        } finally {
            setAiLoading(false);
        }
    };
    useEffect(() => {
        if (!marketStats) return;
        if (!livePrice) return;
        if (hasGeneratedAI.current) return;
        hasGeneratedAI.current = true;
        generateAIInsight();
    }, [marketStats, livePrice]);

    useEffect(() => {
        hasGeneratedAI.current = false;
    }, [pair]);

    useEffect(() => {
        async function loadSymbols() {
            try {
                const res = await fetch("https://api.binance.com/api/v3/exchangeInfo");
                const data = await res.json();
                const usdtPairs = data.symbols.filter(s => s.quoteAsset === "USDT").map(s => s.symbol);
                setSymbols(usdtPairs);
            } catch (err) {
                console.error("Error loading symbols", err);
            }
        }
        loadSymbols();
    }, []);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, []);
    return (
        <>
            <Navbar />
            <div className="container">
                {/* STATS */}
                <div className="stats-grid">
                    <div className="card">
                        <span>Balance</span>
                        <h2>{balance.toFixed(2)}$</h2>
                    </div>
                    <div className="card">
                        <span>Total Profit</span>
                        <h2>{stats.totalProfit.toFixed(2)}$</h2>
                    </div>
                    <div className="card">
                        <span>Win Rate</span>
                        <h2>{stats.winRate}%</h2>
                    </div>
                    <div className="card">
                        <span>Total Trades</span>
                        <h2>{stats.totalTrades}</h2>
                    </div>
                    <div className="card">
                        <span>Best Trade</span>
                        <h2 style={{ color: "lime" }}>{stats.bestTrade.toFixed(2)}$</h2>
                    </div>
                    <div className="card">
                        <span>Worst Trade</span>
                        <h2 style={{ color: "red" }}>{stats.worstTrade.toFixed(2)}$</h2>
                    </div>
                </div>
                {/* MAIN */}
                <div className="main-grid">
                    {/* CHART */}
                    <div className="chart-box">
                        <div className="chart-top">
                            <div className="coin-dropdown" ref={dropdownRef}>
                                {/* input search */}
                                <input value={search} onChange={(e) => {
                                    const value = e.target.value;
                                    setSearch(value);
                                    if (value.length > 0) {
                                        setDropdownOpen(true);
                                    } else {
                                        setDropdownOpen(false);
                                    }
                                }}
                                    onFocus={() => {
                                        if (search.length > 0) {
                                            setDropdownOpen(true);
                                        }
                                    }}
                                    placeholder="Search coin..."
                                    className="coin-search"
                                />
                                {/* dropdown list */}
                                {dropdownOpen && filteredSymbols.length > 0 && (
                                    <div className="coin-list">
                                        {filteredSymbols.slice(0, 15).map(sym => (
                                            <div key={sym} className="coin-item" onClick={() => {
                                                setPair(sym);
                                                setSearch("");
                                                setDropdownOpen(false);
                                            }}
                                            >
                                                {sym}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <h3> Live Price: {" "} {livePrice.toFixed(2)}$</h3>
                        </div>
                        <div id="tvchart"></div>
                        <div className="market-stats-grid">
                            <div className="market-stat">
                                <span>24H High</span>
                                <strong>{marketStats?.high?.toFixed(2)}$</strong>
                            </div>
                            <div className="market-stat">
                                <span>24H Low</span>
                                <strong>{marketStats?.low?.toFixed(2)}$</strong>
                            </div>
                            <div className="market-stat">
                                <span>Trend</span>
                                <strong className={marketStats?.changePercent >= 0 ? "green" : "red"} >
                                    {marketStats?.changePercent >= 0 ? "Bullish" : "Bearish"}
                                </strong>
                            </div>
                            <div className="market-stat">
                                <span>24H Change</span>
                                <strong className={marketStats?.changePercent >= 0 ? "green" : "red"}>
                                    {marketStats?.changePercent?.toFixed(2)}%
                                </strong>
                            </div>
                        </div>
                        <div className="ai-box">
                            <h3>🤖 AI Market Insight</h3>
                            {aiLoading ? (
                                <p>Analyzing market...</p>
                            ) : (
                                <p>{aiInsight}</p>
                            )}
                        </div>
                    </div>
                    {/* TRADE PANEL */}
                    <div className="trade-box">
                        <h2>Open Trade</h2>
                        <select value={side} onChange={(e) => setSide(e.target.value)}>
                            <option value="buy">BUY</option>
                            <option value="sell">SELL</option>
                        </select>
                        <input value={margin} onChange={(e) => setMargin(e.target.value)} placeholder="Margin (Risk per trade)" />
                        <select value={leverage} onChange={(e) => setLeverage(e.target.value)}>
                            <option value="1">1x</option>
                            <option value="5">5x</option>
                            <option value="10">10x</option>
                            <option value="20">20x</option>
                            <option value="50">50x</option>
                        </select>
                        <input value={tp} onChange={(e) => setTp(e.target.value)} placeholder="Take Profit" />
                        <input value={sl} onChange={(e) => setSl(e.target.value)} placeholder="Stop Loss" />
                        <div className="trade-actions">
                            <button onClick={handleOpenTrade}>Open Position</button>
                            <button className="ai-btn" onClick={() => {
                                analyzeCryptoTrade();
                                setIsCryptoDrawerOpen(true);
                            }}
                            >
                                AI Trade Review
                            </button>
                        </div>
                        <div className="livepnl">
                            Live PNL:
                            <span style={{ color: livePnl >= 0 ? "lime" : "red" }}>
                                {" "}
                                {livePnl.toFixed(2)}$
                            </span>
                        </div>
                        <hr style={{ margin: "20px 0" }} />
                        {/* BUY */}
                        <h3>💰 Buy Crypto</h3>
                        <input value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} placeholder="USD Amount" />
                        <div className="sell-buttons">
                            <button onClick={() => updateBuyPercent(25)}> 25%</button>
                            <button onClick={() => updateBuyPercent(50)}>50%</button>
                            <button onClick={() => updateBuyPercent(100)}>100%</button>
                        </div>
                        <input type="range" min="0" max="100" step="1" value={buyPercent} onChange={(e) => updateBuyPercent(Number(e.target.value))} className="slider" style={{ '--progress': `${buyPercent}%` }} />
                        <div className="slider-value">{buyPercent}% of Balance</div>
                        <button onClick={handleBuy}>Buy</button>
                        {/* SELL */}
                        <h3 style={{ marginTop: "25px" }}>💸 Sell Crypto</h3>
                        <input value={sellAmount} onChange={(e) => setSellAmount(e.target.value)} placeholder="Crypto Amount" />
                        <div className="sell-buttons">
                            <button onClick={() => updateSellPercent(25)}>25%</button>
                            <button onClick={() => updateSellPercent(50)}>50%</button>
                            <button onClick={() => updateSellPercent(100)}>100%</button>
                        </div>
                        <input type="range" min="0" max="100" step="1" value={sellPercent} onChange={(e) => updateSellPercent(Number(e.target.value))} className="slider" style={{ '--progress': `${sellPercent}%` }} />
                        <div className="slider-value">{sellPercent}% of Holdings</div>
                        <button onClick={handleSell}>Sell</button>
                    </div>
                </div>
                {/* OPEN TRADES */}
                <div className="section">
                    <h2>🟢 Open Positions</h2>
                    <div className="trade-grid">
                        {
                            openTradesData.length === 0 ? (
                                <div className="no-trades">No open positions</div>
                            ) : (
                                openTradesData.map(
                                    (trade) => {
                                        const positionSize = (trade.amount * trade.leverage) / trade.entry;
                                        const currentTradePrice = Number(getCurrentPrice(trade.pair)) || trade.entry;
                                        const pnl = trade.side === "buy"
                                            ? (
                                                currentTradePrice - trade.entry
                                            ) * positionSize
                                            : (
                                                trade.entry - currentTradePrice
                                            ) * positionSize;
                                        return (
                                            <div key={trade.id} className="trade-card">
                                                <div className="trade-left">
                                                    <div className="symbol">{trade.pair}</div>
                                                    <div className="trade-details">
                                                        <small>
                                                            {trade.side.toUpperCase()}
                                                            {" | "}
                                                            {trade.leverage}x
                                                        </small>
                                                        <small>
                                                            Entry:
                                                            {" "}
                                                            {
                                                                Number(
                                                                    trade.entry
                                                                ).toFixed(2)
                                                            }$
                                                        </small>
                                                        {
                                                            trade.tp > 0 && (
                                                                <small className="tp-text">
                                                                    TP:
                                                                    {" "}
                                                                    {
                                                                        Number(
                                                                            trade.tp
                                                                        ).toFixed(2)
                                                                    }$
                                                                </small>
                                                            )
                                                        }
                                                        {
                                                            trade.sl > 0 && (
                                                                <small className="sl-text">
                                                                    SL:
                                                                    {" "}
                                                                    {
                                                                        Number(
                                                                            trade.sl
                                                                        ).toFixed(2)
                                                                    }$
                                                                </small>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                                <div className="trade-right">
                                                    {editingTrade !== trade.id ? (
                                                        <>
                                                            <div className="trade-profit" style={{ color: pnl >= 0 ? "#41d67a" : "#ff5b5b" }}>
                                                                {pnl.toFixed(2)}$
                                                            </div>
                                                            <div className="trade-actions-right">
                                                                <button className="modify-btn" onClick={() => {
                                                                    setEditingTrade(trade.id);
                                                                    setEditTp(trade.tp || "");
                                                                    setEditSl(trade.sl || "");
                                                                }}
                                                                    title="Modify TP / SL"
                                                                >
                                                                    <FaPen />
                                                                </button>
                                                                <button className="close-btn2" onClick={() => closeTrade(
                                                                    trade.id,
                                                                    trade,
                                                                    currentTradePrice
                                                                )
                                                                }
                                                                    title="Close Position"
                                                                >
                                                                    <FaTimes />
                                                                </button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="modify-inline">
                                                            <div className="trade-profit" style={{ color: pnl >= 0 ? "#41d67a" : "#ff5b5b" }}>
                                                                {pnl.toFixed(2)}$
                                                            </div>
                                                            <div className="current-price1" >
                                                                Current: {(Number(getCurrentPrice(trade.pair)) || Number(trade.entry)).toFixed(2)}
                                                            </div>
                                                            <div className="input-wrapper">
                                                                <span className="prefix">TP</span>
                                                                <input value={editTp} onChange={(e) => setEditTp(e.target.value)} />
                                                            </div>
                                                            <div className="input-wrapper">
                                                                <span className="prefix">SL</span>
                                                                <input value={editSl} onChange={(e) => setEditSl(e.target.value)} />
                                                            </div>
                                                            <button className="save-btn" onClick={() => handleSaveModify(trade)}>Save</button>
                                                            <button className="cancel-btn" onClick={() => setEditingTrade(null)}>
                                                                <FaTimes />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }
                                )
                            )
                        }
                    </div>
                </div>
                {/* HISTORY */}
                <div className="section">
                    <div className="history-header">
                        <h2>📜 Trade History</h2>
                        {
                            tradeHistory.length > 2 && (
                                <select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)}>
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="profit-high">Highest Profit</option>
                                    <option value="profit-low">Lowest Profit</option>
                                </select>
                            )
                        }
                    </div>
                    <div className="trade-grid">
                        {
                            filteredTradeHistory.length === 0 ? (
                                <div className="no-trades">No trades yet</div>
                            ) : (
                                (showAllHistory
                                    ? filteredTradeHistory
                                    : filteredTradeHistory.slice(0, 5)
                                ).map((trade) => (
                                    <div key={trade.id} className="trade-card">
                                        <div className="trade-left">
                                            <div className="symbol"> {trade.symbol}</div>
                                            <div className="history-details">
                                                <small>
                                                    Entry:{" "} {Number(trade.entry).toFixed(2)}$
                                                </small>
                                                <small>
                                                    Exit: {" "}{Number(trade.exit).toFixed(2)}$
                                                </small>
                                                <small>
                                                    Amount: {" "}{Number(trade.amount).toFixed(2)}$
                                                </small>
                                                <small>
                                                    {trade.leverage ? `${trade.leverage}X` : "1X"}
                                                </small>
                                            </div>
                                        </div>
                                        <div className="trade-profit" style={{ color: trade.profit >= 0 ? "lime" : "red" }}>
                                            {Number(trade.profit).toFixed(2)}$
                                        </div>
                                    </div>
                                ))
                            )
                        }
                    </div>
                    {
                        filteredTradeHistory.length > 5 && (
                            <div className="show-more-wrapper">
                                <button className="show-more-btn" onClick={() => setShowAllHistory(!showAllHistory)} >
                                    {showAllHistory ? "Show Less" : "Show More"}
                                </button>
                            </div>
                        )
                    }
                </div>
            </div >
            {
                toast && (
                    <div id="toast" className={` show ${toast.type}`}>
                        {toast.message}
                    </div>
                )
            }
            <Footer />
            {
                isCryptoDrawerOpen && (
                    <div className="drawer-overlay1">
                        <div className="drawer1">
                            <div className="drawer-header1">
                                <h3>AI Crypto Trade Review</h3>
                                <button
                                    className="close-btn1"
                                    onClick={() => setIsCryptoDrawerOpen(false)}
                                >
                                    X
                                </button>
                            </div>

                            <div className="drawer-content1">
                                {cryptoLoading && (<p>🤖 Analyzing crypto trade...</p>)}
                                {!cryptoLoading && !cryptoAnalysis && (<p>Click analyze to get AI review.</p>)}
                                {!cryptoLoading && cryptoAnalysis && (<pre>{cryptoAnalysis}</pre>)}
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}