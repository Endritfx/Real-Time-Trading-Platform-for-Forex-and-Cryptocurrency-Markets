import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { connectToTwelveData } from "./forexSocket.js";

dotenv.config();

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.action === "subscribe") {
                connectToTwelveData(data.symbol, ws);
            }
        } catch (err) {
            console.error("Invalid WS message:", err);
        }
    });
    ws.on("close", () => {
    });
});

app.post("/chat", async (req, res) => {
    try {
        const { messages } = req.body;
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                messages: messages.map(m => ({
                    role: m.role,
                    content: m.content
                }))
            })
        }
        );
        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content || data?.error?.message || "No response";
        return res.json({ reply });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

app.post("/analyze-trade", async (req, res) => {
    try {
        const {
            pair,
            orderType,
            hasSL,
            hasTP,
            market
        } = req.body;
        let prompt = "";

        if (market === "forex") {
            prompt = `
You are a Senior Forex Trading Mentor.

Your purpose is to review the trade setup like a professional trader and provide educational feedback.

STRICT RULES:
- Never calculate anything.
- Never mention risk/reward ratios.
- Never mention percentages.
- Never mention pips.
- Never estimate profits or losses.
- Never use formulas.
- Focus only on trade quality, planning, discipline and structure.

Trade Information:

Pair: ${pair}
Order Type: ${orderType}
Stop Loss Present: ${hasSL ? "YES" : "NO"}
Take Profit Present: ${hasTP ? "YES" : "NO"}

ANALYSIS RULES:
- If Stop Loss is missing, mention lack of protection.
- If Take Profit is missing, mention missing exit plan.
- If both exist, praise discipline.
- Give insights about pair and order type.
- Give one trading tip.

OUTPUT FORMAT:
PAIR: ${pair}
PAIR INSIGHT:
ORDER REVIEW:
TRADE DISCIPLINE:
RISK MANAGEMENT:
PROFESSIONAL TIP:
OVERALL RATING:
FINAL COMMENT:
`;
        }
        else if (market === "crypto") {
            prompt = `
You are a Senior Crypto Trading Analyst.

Your purpose is to review crypto trades with focus on volatility, liquidity, and execution quality.

STRICT RULES:
- Never calculate profits, percentages, pips or risk/reward.
- Do NOT use Forex terminology.
- Focus on crypto volatility and market behavior only.

Trade Information:

Pair: ${pair}
Order Type: ${orderType}
Stop Loss Present: ${hasSL ? "YES" : "NO"}
Take Profit Present: ${hasTP ? "YES" : "NO"}

ANALYSIS RULES:
- Highlight crypto volatility risks.
- If SL missing, mention high volatility exposure.
- If TP missing, mention weak exit strategy.
- If both exist, praise structured crypto risk control.
- Give one crypto-specific trading tip.

OUTPUT FORMAT:
PAIR: ${pair}
CRYPTO MARKET INSIGHT:
ORDER REVIEW:
TRADE STRUCTURE:
TRADER TIP:
OVERALL RATING:
FINAL COMMENT:
`;
        }
        else {
            return res.status(400).json({
                error: "Invalid market type. Use 'forex' or 'crypto'."
            });
        }
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional trading coach."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        }
        );
        const data = await response.json();
        const analysis = data?.choices?.[0]?.message?.content || data?.error?.message || "No analysis generated";
        return res.json({ analysis });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

app.post("/ai-market-insight", async (req, res) => {
    try {
        const {
            symbol,
            currentPrice,
            high24h,
            low24h,
            change24h,
            trend
        } = req.body;
        if (!symbol) {
            return res.status(400).json({
                error: "Missing symbol"
            });
        }
        const prompt = `
You are a professional crypto market analyst.

Analyze ONLY the provided data.

Symbol: ${symbol}
Current Price: ${currentPrice}
24h High: ${high24h}
24h Low: ${low24h}
24h Change: ${change24h}%
Trend: ${trend}

Rules:
- Maximum 60 words
- No financial advice
- No fake indicators (RSI, EMA, etc.)
- Only use given data
- Be concise and clear

Output a short market insight.
`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional crypto market analyst."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        }
        );
        const data = await response.json();
        const insight = data?.choices?.[0]?.message?.content || data?.error?.message || "No insight generated";
        return res.json({
            insight
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.message
        });
    }
});

app.get("/api/news", async (req, res) => {
    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q=crypto&language=en&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to fetch news"
        });
    }
});

app.get("/api/forex-news", async (req, res) => {
    try {
        const response = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${process.env.FINNHUB_API_KEY}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to fetch forex news"
        });
    }
});

app.get("/api/twelvedata/price", async (req, res) => {
    try {
        const { symbol } = req.query;
        const response = await fetch(`https://api.twelvedata.com/price?symbol=${symbol}&apikey=${process.env.TWELVEDATA_API_KEY}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to fetch price"
        });
    }
});

app.get("/api/twelvedata/history", async (req, res) => {
    try {
        const { symbol } = req.query;
        const response = await fetch(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=2&apikey=${process.env.TWELVEDATA_API_KEY}`);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Failed to fetch history"
        });
    }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});