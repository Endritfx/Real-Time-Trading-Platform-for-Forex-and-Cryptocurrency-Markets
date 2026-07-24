import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/wallet.css";
import { startLiveTrading, stopLiveTrading } from "../services/liveService";
import { subscribeUser, getPrice } from "../services/portfolioService";

export default function Wallet() {

    const [userData, setUserData] = useState(null);
    const [history, setHistory] = useState([]);
    const [showAllHistory, setShowAllHistory] = useState(false);
    const [refreshPrices, setRefreshPrices] = useState(false);

    useEffect(() => {
        let unsubHistory = null;
        const unsub = subscribeUser(setUserData);
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (!user) return;
            const historyRef = query(collection(db, "users", user.uid, "walletHistory"), orderBy("createdAt", "desc"));
            unsubHistory =
                onSnapshot(
                    historyRef,
                    (snapshot) => {
                        const data = [];
                        snapshot.forEach((doc) => {
                            data.push({ id: doc.id, ...doc.data() });
                        });
                        setHistory(data);
                    }
                );
        });

        return () => {
            if (unsub) {
                unsub();
            }

            if (unsubHistory) {
                unsubHistory();
            }

            if (unsubscribeAuth) {
                unsubscribeAuth();
            }

        };

    }, []);

    useEffect(() => {

        if (!userData) return;

        const portfolio = userData.portfolio || {};

        Object.keys(portfolio).forEach((symbol) => {

            startLiveTrading(

                symbol.toLowerCase(),

                () => setRefreshPrices(prev => !prev)

            );

        });

    }, [userData]);

    useEffect(() => {

        if (!userData) return;

        const portfolio =
            userData.portfolio || {};

        Object.keys(portfolio).forEach(symbol => {
            startLiveTrading(
                symbol.toLowerCase(),
                () => setRefreshPrices(prev => !prev)
            );
        });

        return () => {

            Object.keys(portfolio).forEach(symbol => {
                stopLiveTrading(symbol);
            });

        };

    }, [userData]);

    if (userData === null) {
        return (
            <>
                <Navbar />
                <div className="wallet-container">
                    <h2> Loading...</h2>
                </div>
                <Footer />
            </>
        );
    }

    const portfolio = userData.portfolio || {};
    const balance = Number(userData.balance || 0);
    let totalWallet = balance;
    let assetCount = 0;
    let bestAsset = "None";
    let bestValue = 0;

    const holdings =
        Object.entries(portfolio)
            .map(([symbol, asset]) => {
                const numericAmount = Number(asset.amount || 0);
                const avgPrice = Number(asset.avgPrice || 0);
                const cleanSymbol = symbol.replace("USDT", "").toUpperCase();
                const price = Number(getPrice(cleanSymbol)) || 0;
                const value = numericAmount * price;
                const invested = numericAmount * avgPrice;
                const profit = value - invested;
                const profitPercent = invested > 0 ? (profit / invested) * 100 : 0;

                totalWallet += value;

                if (numericAmount > 0) {
                    assetCount++;
                }

                if (value > bestValue) {
                    bestValue = value;
                    bestAsset = cleanSymbol;
                }

                return {
                    symbol: cleanSymbol,
                    amount: numericAmount,
                    price,
                    value,
                    avgPrice,
                    invested,
                    profit,
                    profitPercent
                };
            })

            .filter(item => item.amount > 0);

    const allocationData = holdings.map((item) => ({
        ...item,
        percentage: totalWallet > 0 ? ((item.value / totalWallet) * 100) : 0
    }));

    return (
        <>
            <Navbar />
            <div className="wallet-container">
                {/* STATS */}
                <div className="stats-grid1">
                    <div className="card"> <span>Total Wallet</span>
                        <h2>{totalWallet.toFixed(2)}$</h2>
                    </div>
                    <div className="card"><span>Cash Balance</span>
                        <h2>{balance.toFixed(2)}$</h2>
                    </div>
                    <div className="card"><span>Assets</span>
                        <h2>{assetCount}</h2>
                    </div>
                    <div className="card"><span>Biggest Holding</span>
                        <h2>{bestAsset}<small className="best-asset-value">({bestValue.toFixed(2)}$)</small></h2>
                    </div>
                </div>
                {/* HOLDINGS + ALLOCATION */}
                <div className="wallet-grid">
                    {/* Left */}
                    <div className="section holdings-section">
                        <h2>Holdings</h2>
                        <div className="trade-grid">
                            {holdings.length === 0 ? (
                                <div className="no-holdings">Start trading to build your portfolio</div>
                            )
                                : (
                                    holdings.map((item) => {
                                        const percentage = totalWallet > 0 ? ((item.value / totalWallet) * 100).toFixed(1) : 0;

                                        return (
                                            <div key={item.symbol} className="trade-card" >
                                                <div className="trade-left">
                                                    <div className="symbol">{item.symbol}</div>
                                                    <small>{item.amount.toFixed(6)}</small>
                                                </div>
                                                <div className="trade-right">
                                                    <div className="trade-profit">
                                                        <small className={item.profit >= 0 ? "profit-green" : "profit-red"}>
                                                            {item.profit >= 0 ? "+" : ""}
                                                            {item.profit.toFixed(2)}$
                                                            ({item.profitPercent.toFixed(2)}%)
                                                        </small>
                                                        {item.value.toFixed(2)}$
                                                    </div>
                                                    <small className="portfolio-percent">
                                                        {percentage}% of wallet
                                                    </small>
                                                </div>
                                            </div>
                                        );
                                    })
                                )
                            }
                        </div>
                    </div>
                    {/* Right */}
                    <div className="section allocation-section">
                        <h2>Portfolio Allocation</h2>
                        <div className="allocation-list">
                            {allocationData.length === 0 ? (
                                <div className="no-trades">No holdings yet<br />
                                    <small> Start trading to see your portfolio allocation</small>
                                </div>
                            ) : (
                                allocationData.map((item) => (
                                    <div key={item.symbol} className="allocation-item">
                                        <div className="allocation-header">
                                            <span className="allocation-symbol">
                                                {item.symbol}
                                            </span>
                                            <span className="allocation-percent">
                                                {item.percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="allocation-bar-bg">
                                            <div className="allocation-bar-fill" style={{ width: `${item.percentage}%` }} />
                                        </div>
                                        <small className="allocation-value">
                                            {item.value.toFixed(2)}$
                                        </small>
                                    </div>
                                ))
                            )
                            }
                        </div>
                    </div>
                </div>
                {/* HISTORY */}
                <div className="section">

                    <h2> Wallet History </h2>
                    <div className="history-list">
                        {history.length === 0 ? (
                            <div className="no-history">
                                No wallet history yet<br />
                                <small>Your buy and sell activity will appear here</small>
                            </div>
                        )
                            : (
                                (showAllHistory ? history : history.slice(0, 5)).map((item) => (
                                    <div key={item.id} className="history-card">
                                        {/* LEFT */}
                                        <div className="history-left">
                                            <div className={`history-badge ${item.type}`}>
                                                {item.type === "BUY" ? "🟢 BUY" : "🔴 SELL"}
                                            </div>
                                            <div className="history-info">
                                                <div className="history-symbol"> {item.symbol}</div>
                                                <small>
                                                    {Number(item.amountCrypto || 0).toFixed(6)}
                                                    {" "}
                                                    {item.symbol?.replace("USDT", "")}
                                                </small>
                                            </div>
                                        </div>
                                        {/* RIGHT */}
                                        <div className="history-right">
                                            <div className="history-amount">
                                                {Number(item.amountUSD || 0).toFixed(2)}$
                                            </div>
                                            <small>
                                                {" "}
                                                {Number(item.price || 0).toFixed(2)}$
                                            </small>
                                        </div>
                                    </div>
                                ))
                            )
                        }
                    </div>
                    {history.length > 5 && (
                        <div className="show-more-wrapper">
                            <button className="show-more-btn" onClick={() => setShowAllHistory(!showAllHistory)}>
                                {showAllHistory ? "Show Less" : "Show More"}
                            </button>
                        </div>
                    )
                    }
                </div>
            </div>
            <Footer />
        </>
    );
}