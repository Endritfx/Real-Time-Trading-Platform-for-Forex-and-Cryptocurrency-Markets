import { useState, useEffect, useMemo } from "react";
import ForexFooter from "../components/ForexFooter";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase";
import ForexNavbar from "../components/ForexNavbar";
import { startForexLive, stopForexLive, getForexPrice } from "../services/forexLiveService";
import "../styles/forex-trading.css";
import ForexTradingChart from "../components/ForexTradingChart";
import { onAuthStateChanged } from "firebase/auth";
import { IoClose } from "react-icons/io5";

export default function ForexTrading() {

    const [user, setUser] = useState(null);
    const [selectedPair, setSelectedPair] = useState(
        {
            label: "EUR/USD",
            tv: "FX:EURUSD",
            api: "EUR/USD"
        }
    );
    const [accountBalance, setAccountBalance] = useState(10000);
    const [equity, setEquity] = useState(10000);
    const [marginUsed, setMarginUsed] = useState(0);
    const [freeMargin, setFreeMargin] = useState(10000);
    const [search, setSearch] = useState("");
    const [priceCache, setPriceCache] = useState({});
    const [priceLoading, setPriceLoading] = useState(false);
    const [orderType, setOrderType] = useState("Market Order");
    const [lotSize, setLotSize] = useState("");
    const [entryPrice, setEntryPrice] = useState("");
    const [stopLoss, setStopLoss] = useState("");
    const [takeProfit, setTakeProfit] = useState("");
    const [positions, setPositions] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [balance, setBalance] = useState(accountBalance);
    const [riskPercent, setRiskPercent] = useState("");
    const [slPips, setSlPips] = useState("");
    const [recommendedLot, setRecommendedLot] = useState("");
    const [riskAmount, setRiskAmount] = useState("");
    const [dataLoaded, setDataLoaded] = useState(false);
    const [tradeHistory, setTradeHistory] = useState([]);
    const [editingOrder, setEditingOrder] = useState(null);
    const [editingPosition, setEditingPosition] = useState(null);
    const [pairStats, setPairStats] = useState(null);
    const [tradeAnalysis, setTradeAnalysis] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [positionDraft, setPositionDraft] = useState(null);
    const [pendingDraft, setPendingDraft] = useState(null);
    const [editingOrderId, setEditingOrderId] = useState(null);

    const isWeekend = () => {
        const day = new Date().getDay();
        return day === 6 || day === 0;
    };

    const parseValue = (val) =>
        val === "" || val === null || val === undefined
            ? null
            : Number(val);

    const websocketPairs = [
        "EUR/USD",
        "XAU/USD"
    ];

    const activePairs = useMemo(() => {
        const set = new Set();
        set.add(selectedPair.api);
        positions.forEach(position => {
            set.add(position.pair);
        });

        pendingOrders.forEach(order => {
            set.add(order.pair);
        });
        console.log("ACTIVE PAIRS:", [...set]);
        return [...set];
    }, [selectedPair.api, positions, pendingOrders]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        activePairs.forEach(pair => {
            if (websocketPairs.includes(pair)) {
                startForexLive(pair);
            }
        });
        return () => {
            activePairs.forEach(pair => {
                if (websocketPairs.includes(pair)) {
                    stopForexLive(pair);
                }
            });
        };
    }, [activePairs]);

    useEffect(() => {
        const interval = setInterval(() => {
            setPriceCache(prev => {
                const updated = { ...prev };
                activePairs.forEach(pair => {
                    if (websocketPairs.includes(pair)) {
                        const price = getForexPrice(pair);
                        if (price) {
                            updated[pair] = { price };
                        }
                    }
                });
                return updated;
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [activePairs]);

    useEffect(() => {
        activePairs.forEach(pair => {
            if (!websocketPairs.includes(pair)) {
                fetchPrice(pair);
            }
        });
    }, [activePairs]);

    useEffect(() => {
        const interval = setInterval(() => {
            activePairs.forEach(pair => {
                if (!websocketPairs.includes(pair)) {
                    fetchPrice(pair);
                }
            });
        }, 50000);
        return () => clearInterval(interval);
    }, [activePairs]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        }
        );
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        console.log("CURRENT USER:", user);
    }, [user]);

    useEffect(() => {
        if (editingOrderId)
            return;
        pendingOrders.forEach(order => {
            const currentPrice =
                Number(priceCache[order.pair]?.price);
            if (!currentPrice)
                return;
            if (
                order.type === "BUY LIMIT" &&
                currentPrice <= order.entry
            ) {
                activateOrder(order);
            }
            if (
                order.type === "SELL LIMIT" &&
                currentPrice >= order.entry
            ) {
                activateOrder(order);
            }
        });
    }, [priceCache, pendingOrders, editingOrderId]);

    useEffect(() => {
        positions.forEach(position => {
            const currentPrice =
                Number(
                    priceCache[position.pair]?.price
                );
            if (!currentPrice)
                return;
            if (position.type === "BUY") {
                if (
                    position.tp !== null &&
                    position.tp > 0 &&
                    currentPrice >= position.tp
                ) {
                    closePosition(position.id);
                }
                if (
                    position.sl !== null &&
                    position.sl > 0 &&
                    currentPrice <= position.sl
                ) {
                    closePosition(position.id);
                }
            }

            if (position.type === "SELL") {
                if (
                    position.tp !== null &&
                    position.tp > 0 &&
                    currentPrice <= position.tp
                ) {
                    closePosition(position.id);
                }
                if (
                    position.sl !== null &&
                    position.sl > 0 &&
                    currentPrice >= position.sl
                ) {
                    closePosition(position.id);
                }
            }
        });
    }, [priceCache, positions]);

    useEffect(() => {
        const totalPnl = positions.reduce((sum, position) => {
            const currentPrice = Number(priceCache[position.pair]?.price) || 0;
            return (sum + calculatePnL(position, currentPrice));
        },
            0
        );
        setEquity(
            accountBalance + totalPnl
        );
    }, [positions, accountBalance, priceCache]);

    const leverage = 100;
    useEffect(() => {
        let totalMargin = 0;
        positions.forEach(position => {
            totalMargin += (100000 * Number(position.lot)) / 100;
        });
        setMarginUsed(totalMargin);
    }, [positions]);

    useEffect(() => {
        setFreeMargin(equity - marginUsed);
    }, [equity, marginUsed]);

    useEffect(() => {
        setBalance(accountBalance.toFixed(2));
    }, [accountBalance]);

    useEffect(() => {
        setRiskAmount("");
        setRecommendedLot("");
        setRiskPercent("");
        setSlPips("");
    }, [selectedPair]);

    useEffect(() => {
        if (!user)
            return;
        async function loadTradingData() {
            try {
                console.log("LOADING DATA...");
                const snap = await getDoc(doc(db, "users", user.uid, "trading", "account"));
                console.log("SNAP EXISTS:", snap.exists());
                console.log("SNAP DATA:", snap.data());
                if (snap.exists()) {
                    const data = snap.data();
                    setPositions(data.positions || []);
                    setPendingOrders(data.pendingOrders || []);
                    setTradeHistory(data.tradeHistory || []);
                    setAccountBalance(data.accountBalance || 10000);
                    setEquity(data.accountBalance || 10000);
                }
                else {
                    setAccountBalance(10000);
                    setEquity(10000);
                }
                setDataLoaded(true);
            }
            catch (error) {
                console.error("LOAD ERROR:", error);
            }
        }
        loadTradingData();
    }, [user]);

    useEffect(() => {
        if (!user || !dataLoaded)
            return;

        const timer = setTimeout(async () => {
            try {
                console.log("SAVING DATA...");
                await setDoc(doc(db, "users", user.uid, "trading", "account"),
                    {
                        accountBalance, positions, pendingOrders, tradeHistory
                    }
                );
                console.log("DATA SAVED");
            } catch (error) {
                console.error("SAVE ERROR:", error);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, [accountBalance, positions, pendingOrders, tradeHistory, user, dataLoaded]);

    useEffect(() => {
        fetchPairStats();
    }, [selectedPair]);

    const pairs = [
        {
            label: "EUR/USD",
            tv: "FX:EURUSD",
            api: "EUR/USD"
        },
        {
            label: "GBP/USD",
            tv: "FX:GBPUSD",
            api: "GBP/USD"
        },
        {
            label: "USD/JPY",
            tv: "FX:USDJPY",
            api: "USD/JPY"
        },
        {
            label: "USD/CHF",
            tv: "FX:USDCHF",
            api: "USD/CHF"
        },
        {
            label: "AUD/USD",
            tv: "FX:AUDUSD",
            api: "AUD/USD"
        },
        {
            label: "NZD/USD",
            tv: "FX:NZDUSD",
            api: "NZD/USD"
        },
        {
            label: "USD/CAD",
            tv: "FX:USDCAD",
            api: "USD/CAD"
        },
        {
            label: "EUR/GBP",
            tv: "FX:EURGBP",
            api: "EUR/GBP"
        },
        {
            label: "EUR/JPY",
            tv: "FX:EURJPY",
            api: "EUR/JPY"
        },
        {
            label: "EUR/CHF",
            tv: "FX:EURCHF",
            api: "EUR/CHF"
        },
        {
            label: "EUR/CAD",
            tv: "FX:EURCAD",
            api: "EUR/CAD"
        },
        {
            label: "EUR/AUD",
            tv: "FX:EURAUD",
            api: "EUR/AUD"
        },
        {
            label: "EUR/NZD",
            tv: "FX:EURNZD",
            api: "EUR/NZD"
        },

        {
            label: "GBP/JPY",
            tv: "FX:GBPJPY",
            api: "GBP/JPY"
        },
        {
            label: "GBP/CHF",
            tv: "FX:GBPCHF",
            api: "GBP/CHF"
        },
        {
            label: "GBP/CAD",
            tv: "FX:GBPCAD",
            api: "GBP/CAD"
        },
        {
            label: "GBP/AUD",
            tv: "FX:GBPAUD",
            api: "GBP/AUD"
        },
        {
            label: "GBP/NZD",
            tv: "FX:GBPNZD",
            api: "GBP/NZD"
        },

        {
            label: "AUD/JPY",
            tv: "FX:AUDJPY",
            api: "AUD/JPY"
        },
        {
            label: "AUD/CAD",
            tv: "FX:AUDCAD",
            api: "AUD/CAD"
        },
        {
            label: "AUD/CHF",
            tv: "FX:AUDCHF",
            api: "AUD/CHF"
        },

        {
            label: "NZD/JPY",
            tv: "FX:NZDJPY",
            api: "NZD/JPY"
        },
        {
            label: "NZD/CAD",
            tv: "FX:NZDCAD",
            api: "NZD/CAD"
        },
        {
            label: "NZD/CHF",
            tv: "FX:NZDCHF",
            api: "NZD/CHF"
        },

        {
            label: "CAD/JPY",
            tv: "FX:CADJPY",
            api: "CAD/JPY"
        },
        {
            label: "CHF/JPY",
            tv: "FX:CHFJPY",
            api: "CHF/JPY"
        },
        {
            label: "XAU/USD",
            tv: "OANDA:XAUUSD",
            api: "XAU/USD"
        },
        {
            label: "XAG/USD",
            tv: "OANDA:XAGUSD",
            api: "XAG/USD"
        }

    ];

    async function fetchPrice(pair) {
        const response = await fetch(`https://trading-platform-backend-peyh.onrender.com/api/twelvedata/price?symbol=${pair}`);
        const data = await response.json();
        setPriceCache(prev => ({
            ...prev,
            [pair]: data
        }));
    }

    async function fetchPairStats() {
        try {
            const response = await fetch(`https://trading-platform-backend-peyh.onrender.com/api/twelvedata/history?symbol=${selectedPair.api}`);
            const data = await response.json();
            if (!data.values)
                return;
            const today = data.values[0];
            const yesterday = data.values[1];
            const current = Number(today.close);
            const previous = Number(yesterday.close);
            const changePercent = ((current - previous) / previous) * 100;
            setPairStats({
                open: Number(today.open),
                high: Number(today.high),
                low: Number(today.low),
                close: current,
                changePercent
            });
        }
        catch (error) {
            console.error(error);
        }
    }

    function placeBuyTrade() {
        if (!lotSize) {
            alert("Enter lot size");
            return;
        }
        if (
            orderType !== "Market Order" && !entryPrice
        ) {
            alert("Enter entry price");
            return;
        }

        const currentPrice = Number(priceCache[selectedPair.api]?.price);
        if (
            orderType === "Market Order" && !currentPrice
        ) {
            alert("Live price not available yet");
            return;
        }

        const entry = orderType === "Market Order" ? currentPrice : Number(entryPrice);

        if (
            orderType === "Buy Limit" && entry >= currentPrice
        ) {
            alert(
                "Buy Limit entry must be below current price"
            );
            return;
        }

        const tp = takeProfit === "" ? null : Number(takeProfit);
        const sl = stopLoss === "" ? null : Number(stopLoss);

        if (
            tp !== null && tp <= entry
        ) {
            alert(
                "BUY Take Profit must be above Entry"
            );
            return;
        }

        if (
            sl !== null && sl >= entry
        ) {
            alert(
                "BUY Stop Loss must be below Entry"
            );
            return;
        }

        const order = {
            id: Date.now(),
            pair: selectedPair.label,
            type: orderType === "Buy Limit" ? "BUY LIMIT" : "BUY",
            lot: Number(lotSize),
            entry,
            sl: stopLoss === "" ? null : Number(stopLoss),
            tp: takeProfit === "" ? null : Number(takeProfit),
            openedAt: new Date().toISOString()
        };

        if (
            orderType === "Market Order"
        ) {
            setPositions(prev => [
                ...prev, order
            ]);
        } else {
            setPendingOrders(prev => [
                ...prev, order
            ]);
        }
        setLotSize("");
        setEntryPrice("");
        setStopLoss("");
        setTakeProfit("");
    }

    function placeSellTrade() {
        if (!lotSize) {
            alert("Enter lot size");
            return;
        }

        if (
            orderType !== "Market Order" && !entryPrice
        ) {
            alert("Enter entry price");
            return;
        }

        const currentPrice = Number(priceCache[selectedPair.api]?.price);

        if (
            orderType === "Market Order" && !currentPrice
        ) {
            alert("Live price not available yet");
            return;
        }

        const entry = orderType === "Market Order" ? currentPrice : Number(entryPrice);

        if (
            orderType === "Sell Limit" && entry <= currentPrice
        ) {
            alert("Sell Limit entry must be above current price");
            return;
        }

        const tp = takeProfit === "" ? null : Number(takeProfit);

        const sl = stopLoss === "" ? null : Number(stopLoss);

        if (
            tp !== null && tp >= entry
        ) {
            alert("SELL Take Profit must be below Entry"
            );
            return;
        }

        if (
            sl !== null && sl <= entry
        ) {
            alert("SELL Stop Loss must be above Entry");
            return;
        }

        const order = {
            id: Date.now(),
            pair: selectedPair.label,
            type: orderType === "Sell Limit" ? "SELL LIMIT" : "SELL",
            lot: Number(lotSize),
            entry,
            sl: stopLoss === "" ? null : Number(stopLoss),
            tp: takeProfit === "" ? null : Number(takeProfit),
            openedAt: new Date().toISOString()
        };

        if (
            orderType === "Market Order"
        ) {
            setPositions(prev => [
                ...prev, order
            ]);
        } else {
            setPendingOrders(prev => [
                ...prev, order
            ]);
        }

        setLotSize("");
        setEntryPrice("");
        setStopLoss("");
        setTakeProfit("");
    }

    function closePosition(id) {
        const position = positions.find(p => p.id === id);

        if (!position)
            return;

        const closePrice = Number(priceCache[position.pair]?.price);

        if (!closePrice) {
            alert("Price not available yet");
            return;
        }

        const finalPnL = calculatePnL(position, closePrice);

        setAccountBalance(prev => prev + finalPnL);
        setTradeHistory(prev => [
            ...prev,
            {
                ...position,
                closePrice,
                pnl: finalPnL.toFixed(2),
                closedAt: new Date().toISOString()
            }
        ]);
        setPositions(prev => prev.filter(p => p.id !== id));
    }

    function calculateRisk() {
        if (
            !balance || !riskPercent || !slPips
        ) {
            alert("Fill all fields");
            return;
        }
        if (
            Number(slPips) <= 0
        ) {
            alert("Stop Loss must be greater than 0");
            return;
        }

        if (
            Number(riskPercent) > 10
        ) {
            alert("Risk percentage is too high");
            return;
        }

        const riskAmount = Number(balance) * (Number(riskPercent) / 100);
        let pipValuePerLot = 10;
        if (
            selectedPair.label.includes("JPY")
        ) {
            pipValuePerLot = 9;
        }

        if (
            selectedPair.label.includes("XAU") || selectedPair.label.includes("XAG")
        ) {
            pipValuePerLot = 1;
        }

        const lotSize = riskAmount / (Number(slPips) * pipValuePerLot);

        setRiskAmount(riskAmount.toFixed(2));
        setRecommendedLot(lotSize.toFixed(2));
    }

    function activateOrder(order) {
        const activatedPosition = { ...order, type: order.type === "BUY LIMIT" ? "BUY" : "SELL" };
        setPositions(prev => [...prev, activatedPosition]);
        setPendingOrders(prev => prev.filter(p => p.id !== order.id));
    }

    function calculatePnL(position, currentPrice) {
        if (!currentPrice)
            return 0;

        const entry = Number(position.entry);
        const lot = Number(position.lot);
        const pair = position.pair;
        let pnl = 0;

        if (
            pair.includes("XAU") || pair.includes("XAG")
        ) {
            if (
                position.type === "BUY"
            ) {
                pnl = (currentPrice - entry) * 100 * lot;
            } else {
                pnl = (entry - currentPrice) * 100 * lot;
            }
            return pnl;
        }

        if (
            pair.includes("JPY")
        ) {
            if (
                position.type === "BUY"
            ) {
                pnl = (currentPrice - entry) * 1000 * lot;
            } else {
                pnl = (entry - currentPrice) * 1000 * lot;
            }
            return pnl;
        }

        if (
            position.type === "BUY"
        ) {
            pnl = (currentPrice - entry) * 100000 * lot;
        } else {
            pnl = (entry - currentPrice) * 100000 * lot;
        }
        return pnl;
    }

    function cancelPendingOrder(id) {
        setPendingOrders(prev => prev.filter(order => order.id !== id));
    }

    function savePendingModification() {
        if (!editingOrder)
            return;

        const isValid = validatePendingOrder(editingOrder);

        if (!isValid)
            return;

        setPendingOrders(prev => prev.map(order => order.id === editingOrder.id ? editingOrder : order));
        setEditingOrder(null);
    }

    function savePositionModification() {
        const entry = parseValue(editingPosition.entry);
        const tp = parseValue(editingPosition.tp);
        const sl = parseValue(editingPosition.sl);
        const lot = parseValue(editingPosition.lot);
        const currentPrice = Number(priceCache[editingPosition.pair]?.price);

        if (!currentPrice) {
            alert("Current price unavailable");
            return;
        }

        if (entry === null || isNaN(entry)) {
            alert("Entry is required");
            return;
        }

        if (lot === null || isNaN(lot) || lot <= 0) {
            alert("Lot must be greater than 0");
            return;
        }

        if (editingPosition.type === "BUY") {

            if (
                tp !== null && tp <= currentPrice
            ) {
                alert("BUY Take Profit must be above current price"
                );
                return;
            }

            if (
                sl !== null && sl >= currentPrice
            ) {
                alert("BUY Stop Loss must be below current price");
                return;
            }
        }

        if (editingPosition.type === "SELL") {

            if (
                tp !== null && tp >= currentPrice
            ) {
                alert("SELL Take Profit must be below current price");
                return;
            }

            if (
                sl !== null && sl <= currentPrice
            ) {
                alert("SELL Stop Loss must be above current price");
                return;
            }
        }

        setPositions(prev =>
            prev.map(position => position.id === editingPosition.id ? {
                ...position,
                entry,
                tp: editingPosition.tp === "" ? null : tp,
                sl: editingPosition.sl === "" ? null : sl,
                lot
            }
                : position
            )
        );
        setEditingPosition(null);
    }

    function updatePendingField(id, field, value) {
        setPendingOrders(prev => prev.map(order => order.id === id ? {
            ...order,
            [field]: value
        }
            : order
        )
        );
    }

    function validatePendingOrder(order) {
        const entry = parseValue(order.entry);
        const tp = parseValue(order.tp);
        const sl = parseValue(order.sl);
        const lot = parseValue(order.lot);

        if (entry === null || isNaN(entry)) {
            alert("Entry is required");
            return false;
        }

        if (lot === null || isNaN(lot) || lot <= 0) {
            alert("Lot size must be greater than 0");
            return false;
        }

        if (order.type === "BUY LIMIT") {

            if (
                tp !== null && tp <= entry
            ) {
                alert("BUY LIMIT Take Profit must be above Entry");
                return false;
            }

            if (
                sl !== null && sl >= entry
            ) {
                alert("BUY LIMIT Stop Loss must be below Entry");
                return false;
            }
        }

        if (order.type === "SELL LIMIT") {

            if (
                tp !== null && tp >= entry
            ) {
                alert("SELL LIMIT Take Profit must be below Entry");
                return false;
            }

            if (
                sl !== null && sl <= entry
            ) {
                alert("SELL LIMIT Stop Loss must be above Entry");
                return false;
            }
        }

        return true;
    }

    function formatPrice(pair, value) {
        const num = Number(value);

        if (isNaN(num)) return "";
        return pair.includes("JPY") ? num.toFixed(3) : num.toFixed(5);
    }

    async function analyzeTrade() {
        try {
            setAnalysisLoading(true);
            const res = await fetch("https://trading-platform-backend-peyh.onrender.com/analyze-trade", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    pair: selectedPair.label,
                    orderType,
                    hasSL: stopLoss !== null && stopLoss !== "" && stopLoss !== undefined,
                    hasTP: takeProfit !== null && takeProfit !== "" && takeProfit !== undefined,
                    market: "forex"
                })
            }
            );
            const data = await res.json();
            setTradeAnalysis(data.analysis);
        } catch (error) {
            console.error(error);
            setTradeAnalysis("Error analyzing trade");
        } finally {
            setAnalysisLoading(false);
        }
    }

    return (
        <>
            <ForexNavbar />
            <div className="forex-trading-page1">
                <div className="account-overview">
                    <div className="account-card">
                        <span>Balance</span>
                        <strong>${accountBalance.toFixed(2)}</strong>
                    </div>
                    <div className="account-card">
                        <span>Equity</span>
                        <strong>${equity.toFixed(2)}
                        </strong>
                    </div>
                    <div className="account-card">
                        <span>Margin Used</span>
                        <strong>${marginUsed.toFixed(2)}</strong>
                    </div>
                    <div className="account-card">
                        <span>Free Margin</span>
                        <strong>${freeMargin.toFixed(2)}</strong>
                    </div>
                </div>
                <div className="trading-main-layout1">
                    {/* LEFT SIDE */}
                    <div className="chart-section1">
                        <div className="section-header1">
                            <div className="pair-search-box">
                                <input type="text" placeholder="Search Pair..." value={search} onChange={(e) => setSearch(e.target.value)} />
                                {
                                    search.length > 0 && (
                                        <div className="pair-results">
                                            {
                                                pairs.filter(pair => pair.label
                                                    .toLowerCase()
                                                    .replace("/", "")
                                                    .includes(
                                                        search
                                                            .toLowerCase()
                                                            .replace("/", "")
                                                    )
                                                )
                                                    .map(pair => (
                                                        <div key={pair.tv} className="pair-item" onClick={() => {
                                                            setSelectedPair(pair);
                                                            setSearch("");
                                                        }}>{pair.label}
                                                        </div>
                                                    ))
                                            }
                                        </div>
                                    )
                                }
                            </div>
                            <div className="live-price-panel">
                                <div>
                                    <div className="pair-name">
                                        {selectedPair.label}
                                    </div>
                                </div>
                                <div className="current-price">
                                    {
                                        priceLoading ? "Loading..." : Number(priceCache[selectedPair.api]?.price || 0).toFixed(5)
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="chart-placeholder1">
                            <ForexTradingChart key={selectedPair.tv} symbol={selectedPair.tv} />
                        </div>
                        {
                            pairStats && (
                                <div className="pair-stats">
                                    <div className="stat-card">
                                        <span>Open</span>
                                        <strong>
                                            {
                                                formatPrice(
                                                    selectedPair.label,
                                                    pairStats.open
                                                )
                                            }
                                        </strong>
                                    </div>
                                    <div className="stat-card">
                                        <span>High</span>
                                        <strong>
                                            {
                                                formatPrice(
                                                    selectedPair.label,
                                                    pairStats.high
                                                )
                                            }
                                        </strong>
                                    </div>
                                    <div className="stat-card">
                                        <span>Low</span>
                                        <strong>
                                            {
                                                formatPrice(
                                                    selectedPair.label,
                                                    pairStats.low
                                                )
                                            }
                                        </strong>
                                    </div>
                                    <div className="stat-card">
                                        <span>24h Change</span>
                                        <strong style={{ color: pairStats.changePercent >= 0 ? "#16c784" : "#ea3943" }}>
                                            {
                                                pairStats.changePercent.toFixed(2)
                                            }
                                            %
                                        </strong>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                    {/* RIGHT SIDE */}
                    <div className="right-panel1">
                        <div className="trade-panel1">
                            <h2>Place Trade</h2>
                            <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                                <option>Market Order</option>
                                <option>Buy Limit</option>
                                <option>Sell Limit</option>
                            </select>
                            {orderType !== "Market Order" && (
                                <input type="number" placeholder="Entry Price" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} />
                            )}
                            <input type="number" placeholder="Lot Size" value={lotSize} onChange={(e) => setLotSize(e.target.value)} />
                            <input type="number" placeholder="Stop Loss" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} />
                            <input type="number" placeholder="Take Profit" value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} />
                            <div className="trade-buttons1">
                                {orderType !== "Sell Limit" && (
                                    <button className="buy-btn1" onClick={() => {
                                        if (isWeekend()) {
                                            alert(" Trading is closed during weekend!");
                                            return;
                                        }
                                        placeBuyTrade();
                                    }}>
                                        BUY
                                    </button>
                                )}
                                {orderType !== "Buy Limit" && (
                                    <button className="sell-btn1" onClick={() => {
                                        if (isWeekend()) {
                                            alert(" Trading is closed during weekend!");
                                            return;
                                        }
                                        placeSellTrade();
                                    }}>
                                        SELL
                                    </button>
                                )}
                                <button className="ai-btn" onClick={() => {
                                    analyzeTrade();
                                    setIsDrawerOpen(true);
                                }}>
                                    AI Trade Review
                                </button>
                            </div>
                        </div>
                        <div className="risk-calculator1">
                            <h2>Risk Calculator</h2>
                            <div className="calculator-pair">
                                Current Pair:
                                <strong>{selectedPair.label}</strong>
                            </div>
                            <div className="input-group">
                                <label>
                                    Account size: ($)
                                </label>
                                <input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>
                                    Risk Ratio, %:
                                </label>
                                <input type="number" placeholder="Example: 0.5 or 1" value={riskPercent} onChange={(e) => setRiskPercent(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>
                                    Stop-Loss, pips:
                                </label>
                                <input type="number" placeholder="Example: 1.2" value={slPips} onChange={(e) => setSlPips(e.target.value)} />
                            </div>
                            <button className="buy-btn1" onClick={calculateRisk} style={{ width: "100%", marginTop: "15px" }}>
                                Calculate
                            </button>
                            <div className="calculator-result1">
                                <p> Risk Amount:<strong>${riskAmount}</strong></p>
                                <p>Recommended Lot:<strong>{recommendedLot}</strong></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
            {/* OPEN POSITIONS */}
            <div className="positions-section1">
                <h2>Open Positions</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Pair</th>
                            <th>Type</th>
                            <th>Lot</th>
                            <th>Entry</th>
                            <th>SL</th>
                            <th>TP</th>
                            <th>PnL</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            positions.length === 0 ? (
                                <tr>
                                    <td colSpan="8">
                                        No Open Positions
                                    </td>
                                </tr>
                            )
                                : positions.map(position => (
                                    <tr key={position.id}>
                                        <td>{position.pair}</td>
                                        <td>{position.type}</td>
                                        <td>{position.lot}</td>
                                        <td>{formatPrice(position.pair, position.entry)}</td>
                                        <td>{editingPosition?.id === position.id ?
                                            <input type="number" step="0.00001" value={editingPosition.sl} onChange={(e) => setEditingPosition({
                                                ...editingPosition,
                                                sl: e.target.value
                                            })} />
                                            :
                                            (position.sl > 0 ? formatPrice(position.pair, position.sl) : "-")
                                        }
                                        </td>
                                        <td>{editingPosition?.id === position.id ?
                                            <input type="number" step="0.00001" value={editingPosition.tp} onChange={(e) => setEditingPosition({
                                                ...editingPosition,
                                                tp: e.target.value
                                            })} />
                                            :
                                            (position.tp > 0 ? formatPrice(position.pair, position.tp) : "-")
                                        }
                                        </td>
                                        <td style={{ color: calculatePnL(position, Number(priceCache[position.pair]?.price)) >= 0 ? "#0ecb81" : "#f6465d" }}>
                                            {
                                                calculatePnL(position, Number(priceCache[position.pair]?.price)).toFixed(2)
                                            }
                                        </td>
                                        <td className="action-buttons">
                                            {
                                                editingPosition?.id === position.id ? (
                                                    <>
                                                        <button className="modify-btn" onClick={savePositionModification}>
                                                            Save
                                                        </button>
                                                        <button className="cancel-btn" onClick={() => setEditingPosition(null)}>
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="action-buttons">
                                                            <button className="modify-btn" onClick={() => setEditingPosition({
                                                                ...position,
                                                                entry: formatPrice(position.pair, position.entry),
                                                                tp: position.tp === null ? "" : formatPrice(position.pair, position.tp),
                                                                sl: position.sl === null ? "" : formatPrice(position.pair, position.sl),
                                                                lot: position.lot
                                                            })}>
                                                                Modify
                                                            </button>
                                                            <button className="cancel-btn" onClick={() => closePosition(position.id)}>
                                                                Close
                                                            </button>
                                                        </div>
                                                    </>
                                                )
                                            }
                                        </td>
                                    </tr>
                                ))
                        }
                    </tbody>
                </table>
            </div >
            <div className="positions-section1">
                <h2>Pending Orders</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Pair</th>
                            <th>Type</th>
                            <th>Lot</th>
                            <th>Entry</th>
                            <th>SL</th>
                            <th>TP</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            pendingOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="empty-table">
                                        No Pending Orders
                                    </td>
                                </tr>
                            ) : (
                                pendingOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>{order.pair}</td>
                                        <td>{order.type}</td>
                                        {/* LOT */}
                                        <td>
                                            {editingOrderId === order.id ? (
                                                <input value={pendingDraft?.lot ?? ""} onChange={(e) => setPendingDraft({
                                                    ...pendingDraft,
                                                    lot: e.target.value
                                                })} />) : (order.lot)
                                            }
                                        </td>
                                        {/* ENTRY */}
                                        <td>
                                            {editingOrderId === order.id ? (
                                                <input type="number" step={order.pair.includes("JPY") ? "0.001" : "0.00001"}
                                                    value={pendingDraft?.entry ?? ""} onChange={(e) => setPendingDraft({
                                                        ...pendingDraft,
                                                        entry: e.target.value
                                                    })}
                                                />) : (formatPrice(order.pair, order.entry))
                                            }
                                        </td>
                                        {/* SL */}
                                        <td>
                                            {editingOrderId === order.id ? (
                                                <input type="number" value={pendingDraft?.sl ?? ""} onChange={(e) => setPendingDraft({
                                                    ...pendingDraft,
                                                    sl: e.target.value
                                                })}
                                                />) : (order.sl > 0 ? formatPrice(order.pair, order.sl) : "-")
                                            }
                                        </td>
                                        {/* TP */}
                                        <td>
                                            {editingOrderId === order.id ? (
                                                <input type="number" value={pendingDraft?.tp ?? ""} onChange={(e) => setPendingDraft({
                                                    ...pendingDraft,
                                                    tp: e.target.value
                                                })}
                                                />) : (order.tp > 0 ? formatPrice(order.pair, order.tp) : "-")
                                            }
                                        </td>
                                        {/* ACTIONS */}
                                        <td className="action-buttons">
                                            {editingOrderId === order.id ? (
                                                <>
                                                    <button className="modify-btn" onClick={() => {
                                                        if (!validatePendingOrder(pendingDraft)) return;
                                                        setPendingOrders(prev => prev.map(o => o.id === order.id ? {
                                                            ...pendingDraft,
                                                            entry: Number(pendingDraft.entry),
                                                            lot: Number(pendingDraft.lot),
                                                            tp: pendingDraft.tp === "" ? null : Number(pendingDraft.tp),
                                                            sl: pendingDraft.sl === "" ? null : Number(pendingDraft.sl)
                                                        }
                                                            : o
                                                        )
                                                        );
                                                        setEditingOrderId(null);
                                                        setPendingDraft(null);
                                                    }}>
                                                        Save
                                                    </button>
                                                    <button className="cancel-btn" onClick={() => {
                                                        setEditingOrderId(null);
                                                        setPendingDraft(null);
                                                    }}>
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="modify-btn" onClick={() => {
                                                        setEditingOrderId(order.id);
                                                        setPendingDraft({
                                                            ...order,
                                                            entry: formatPrice(order.pair, order.entry),
                                                            tp: order.tp == null ? "" : formatPrice(order.pair, order.tp),
                                                            sl: order.sl == null ? "" : formatPrice(order.pair, order.sl),
                                                            lot: order.lot
                                                        });
                                                    }}>
                                                        Modify
                                                    </button>
                                                    <button className="cancel-btn" onClick={() => cancelPendingOrder(order.id)}>
                                                        Cancel
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )
                        }
                    </tbody>
                </table>
            </div>
            <div className="positions-section1">
                <h2>Trade History</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Pair</th>
                            <th>Type</th>
                            <th>Lot</th>
                            <th>Entry</th>
                            <th>Close</th>
                            <th>PnL</th>
                            <th>Closed At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            tradeHistory.length === 0 ? (
                                <tr>
                                    <td colSpan="7">
                                        No Closed Trades
                                    </td>
                                </tr>
                            ) : (
                                tradeHistory.map(trade => (
                                    <tr key={trade.id}>
                                        <td>{trade.pair}</td>
                                        <td>{trade.type}</td>
                                        <td>{trade.lot}</td>
                                        <td> {formatPrice(trade.pair, trade.entry)}</td>
                                        <td>{trade.closePrice ? formatPrice(trade.pair, trade.closePrice) : "-"}</td>
                                        <td style={{ color: Number(trade.pnl) >= 0 ? "#16c784" : "#ea3943" }}>{Number(trade.pnl).toFixed(2)}</td>
                                        <td>{new Date(trade.closedAt).toLocaleString()}</td>
                                    </tr>
                                ))
                            )
                        }
                    </tbody>
                </table>
            </div>
            {
                isDrawerOpen && (
                    <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
                        <div className="drawer" onClick={(e) => e.stopPropagation()}>
                            <div className="drawer-header">
                                <h2>AI Trade Review</h2>
                                <button className="close-btn" onClick={() => setIsDrawerOpen(false)}><IoClose /></button>
                            </div>
                            <div className="drawer-content">
                                {analysisLoading && (
                                    <p> Analyzing trade...</p>
                                )}
                                {!analysisLoading && !tradeAnalysis && (
                                    <p>
                                        Fill trade details and run analysis.
                                    </p>
                                )}
                                {!analysisLoading && tradeAnalysis && (
                                    <div className="analysis-result">
                                        {tradeAnalysis}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            <ForexFooter />
        </>
    );
}