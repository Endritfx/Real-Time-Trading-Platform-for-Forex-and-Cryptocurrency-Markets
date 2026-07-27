import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/learning.css";
import { db, auth } from "../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import CryptoFinalExam from "../components/CryptoFinalExam";
import CryptoCertificate from "../components/CryptoCertificate";

const data = [
    {
        category: " Basics",
        lessons: [
            {
                title: "What is Cryptocurrency?",
                content: `Cryptocurrency is digital money that exists only on the internet and does not rely on banks or governments.
Instead of being controlled by one company or institution, it runs on a decentralized network of computers around the world. These computers verify every transaction to make sure everything is fair and secure.
 Simple example:
Sending crypto is like sending a WhatsApp message — fast, global, and without needing a bank to approve it.
 Why people use crypto:
- Fast international payments (seconds or minutes)
- Lower fees compared to banks
- Investment opportunities
- Access to global digital economy
 Important:
Crypto prices can change very quickly, so it is both an opportunity and a risk. `},

            {
                title: "What is Blockchain?",
                content: `Blockchain is the technology behind cryptocurrency. Think of it as a digital record book that stores all transactions.
Every transaction is grouped into a “block”, and each block is connected to the previous one, forming a chain — that’s why it is called blockchain.
 Simple explanation:
Imagine a Google Sheet that:
- Everyone can view
- Nobody can secretly edit
- Every change is recorded forever

 Why blockchain is powerful:
- Very secure (almost impossible to hack)
- Transparent (everyone can verify data)
- Decentralized (no single owner)

This is what makes crypto different from normal banking systems.`},

            {
                title: "What is Bitcoin?",
                content: `Bitcoin is the first cryptocurrency ever created in 2009 by Satoshi Nakamoto.
It was designed as a digital version of money that works without banks.
 Key idea:
Instead of trusting a bank, Bitcoin trusts math and computer networks.
 Important facts:
- Only 21 million Bitcoin will ever exist
- No central authority controls it
- Transactions are verified globally

 Why people call it “digital gold”:
Because it is rare, valuable, and many people use it as long-term storage of value rather than daily spending.`},

            {
                title: "What is Ethereum?",
                content: `Ethereum is not just a cryptocurrency — it is a full blockchain platform.

It allows developers to build applications that run without servers or middlemen.

 What makes Ethereum special:
- Smart contracts (automatic agreements)
- Decentralized apps (dApps)
- NFT systems
- DeFi platforms

 Simple example:
If Bitcoin is digital money, Ethereum is like a global internet computer where people build financial apps, games, and digital systems.

This is why Ethereum is used in thousands of crypto projects today.`},

            {
                title: "What is a Crypto Wallet?",
                content: `A crypto wallet is a tool that lets you store, send, and receive cryptocurrencies.

But important: wallets do NOT store coins inside them — they store private keys that give access to your crypto on the blockchain.

 Types of wallets:
- Hot Wallet → connected to internet (easy but less secure)
- Cold Wallet → offline device (very secure)

 Examples:
MetaMask, Trust Wallet, Ledger

 Important:
If you lose your private key or seed phrase, there is NO way to recover your funds.`},

            {
                title: "Private Key & Seed Phrase",
                content: `A private key is like your secret password that controls your crypto wallet.

A seed phrase is a backup recovery phrase (usually 12 or 24 words) that can restore your wallet.

 Very important rules:
- Never share your seed phrase with anyone
- Never store it in screenshots or online files
- Always keep it offline and safe

 Simple idea:
If someone gets your seed phrase, they have FULL control over your crypto — like giving someone your bank account + password together.`}
        ]
    },

    {
        category: " Wallets & Security",
        lessons: [
            {
                title: "Hot vs Cold Wallets",
                content: `Hot wallets are connected to the internet and are very easy to use for daily trading and transactions.

Cold wallets are offline devices that store your crypto keys without internet access.

 Hot Wallet:
- Easy access
- Good for small amounts
- Less secure

 Cold Wallet:
- Very secure
- Best for long-term storage
- Harder to access quickly

 Most smart users use both: hot wallet for trading, cold wallet for savings.`},

            {
                title: "What is a Seed Phrase?",
                content: `A seed phrase is a backup key that restores your crypto wallet.

If your phone or device gets lost, stolen, or broken, the seed phrase allows you to recover everything.

 Danger:
Anyone who gets your seed phrase can steal your entire wallet instantly.

 Rule:
Treat it like your passport + bank PIN combined.` },

            {
                title: "How Crypto Gets Stolen",
                content: `Crypto is usually NOT hacked from the blockchain itself. Instead, people lose money through mistakes and scams.

 Common ways:
- Fake websites (phishing links)
- Fake support agents on Telegram/Discord
- Malware or keyloggers
- Fake airdrops and giveaways

 Key lesson:
Most losses happen from human error, not system failure.`},

            {
                title: "2FA Security",
                content: `Two-factor authentication (2FA) adds an extra layer of security to your account.

Even if someone knows your password, they still need a second code from your phone.

 Why it matters:
- Protects exchange accounts
- Prevents unauthorized login
- Stops many hacking attempts

 Always use Google Authenticator instead of SMS if possible.` },

            {
                title: "Safe Wallet Practices",
                content: `To stay safe in crypto, you need strong habits.

✔ Always use trusted wallets
✔ Double-check URLs before logging in
✔ Never click random links
✔ Keep large funds in cold wallets

 Think of crypto security like protecting physical cash — once it's gone, it's gone.`},

            {
                title: "Common Beginner Mistakes",
                content: `Most beginners lose money because of simple mistakes, not trading strategy.

 Common errors:
- Saving seed phrase on phone or cloud
- Trusting fake “support”
- Investing in unknown coins without research
- FOMO buying during hype

 Solution:
Slow down, learn first, invest later.`}
        ]
    },

    {
        category: " Trading Basics",
        lessons: [
            {
                title: "What is Trading?",
                content: `Trading means buying and selling crypto to make profit from price changes.

The goal is simple:
Buy at a lower price and sell at a higher price.

 But in reality:
Successful trading requires:
- Strategy
- Risk management
- Patience
- Emotional control

 Without knowledge, trading becomes gambling.`},

            {
                title: "Buy Low Sell High",
                content: `This is the basic idea of trading.

You buy an asset when the price is low and sell it when the price increases.

 Example:
Buy Bitcoin at $30,000 → Sell at $35,000 = profit

 Problem:
Nobody knows the perfect bottom or top, so timing is very difficult.` },

            {
                title: "What is Leverage?",
                content: `Leverage allows you to control a bigger trade using borrowed money from an exchange.

 Example:
10x leverage means $100 becomes a $1000 position.

 Risk:
- Profits can increase fast
- Losses can also increase fast
- You can get liquidated quickly if market moves against you

 Always use leverage carefully.`},

            {
                title: "What is Stop Loss?",
                content: `A stop loss is a safety tool that automatically closes your trade when price reaches a certain loss level.

 Why it is important:
- Protects your capital
- Removes emotional decisions
- Helps you survive long-term in trading

Without stop loss, one bad trade can destroy your account.
                `},

            {
                title: "What is Take Profit?",
                content: `Take profit automatically closes your trade when your target profit is reached.

 Benefits:
- Locks in profits automatically
- Prevents greed
- Keeps discipline in trading

Many traders fail because they don’t take profit on time.`},

            {
                title: "Long vs Short",
                content: `Long = you make profit when price goes UP  
Short = you make profit when price goes DOWN

 Example:
If Bitcoin drops, short traders still make money.

 Used in:
- Bull markets → long positions
- Bear markets → short positions`}
        ]
    },

    {
        category: " Indicators",
        lessons: [
            {
                title: "Candlestick Basics",
                content: `Candlesticks show price movement over time.

Each candle contains:
- Open price
- Close price
- Highest price
- Lowest price

 Green candle = price went up  
 Red candle = price went down

Traders use patterns to predict market behavior.`},

            {
                title: "RSI Indicator",
                content: `RSI measures whether a coin is overbought or oversold.

 Scale: 0 - 100
- Above 70 → overbought (might drop)
- Below 30 → oversold (might rise)

 It helps traders find potential reversal points.` },

            {
                title: "MACD Indicator",
                content: `MACD is used to identify trend direction and momentum.

It helps traders see:
- When trend is starting
- When trend is weakening
- Possible buy/sell signals

 It works best combined with other indicators.`},

            {
                title: "Support & Resistance",
                content: `Support = price level where market usually stops falling  
Resistance = price level where market usually stops rising

 Think of them like invisible barriers in the market.`},

            {
                title: "Volume",
                content: `Volume shows how much trading activity is happening.

High volume = strong movement  
Low volume = weak movement

 Volume confirms whether a price move is real or fake.`},

            {
                title: "Trend Analysis",
                content: `Markets usually move in trends:
- Uptrend (bullish)
- Downtrend (bearish)
- Sideways (range)

 “Trend is your friend” in trading.`}
        ]
    },

    {
        category: " Advanced",
        lessons: [
            {
                title: "Smart Contracts",
                content: `Smart contracts are programs on blockchain that run automatically when conditions are met.

 No banks, no lawyers, no middlemen.

Used in:
- DeFi systems
- NFT marketplaces
- Crypto apps`},

            {
                title: "DeFi Explained",
                content: `DeFi means decentralized finance.

It removes banks and allows people to:
- Lend crypto
- Borrow crypto
- Earn interest

 Everything works through smart contracts instead of banks.`},

            {
                title: "NFTs",
                content: `NFTs are unique digital assets.

Each NFT is different and cannot be replaced.

Used for:
- Digital art
- Game items
- Collectibles` },

            {
                title: "Staking",
                content: `Staking means locking your crypto to help secure the network.

 In return, you earn rewards (like interest).

It is like putting money in a savings account but in crypto form.`},

            {
                title: "Mining",
                content: `Mining is the process of verifying transactions using powerful computers.

Miners are rewarded with crypto, but:
- It requires expensive hardware
- It uses a lot of electricity`},

            {
                title: "Stablecoins",
                content: `Stablecoins are cryptocurrencies tied to stable assets like USD.

Example:
- USDT
- USDC

 They are used to avoid volatility during trading.` }
        ]
    },

    {
        category: " Risk & Psychology",
        lessons: [
            {
                title: "Crypto Volatility",
                content: `Crypto prices can change very fast within minutes or hours.

 This creates:
- High profit opportunities
- High risk of losses

Always be prepared for sudden market moves.`},

            {
                title: "Risk Management",
                content: `Risk management means protecting your money while trading.

 Rules:
- Never risk too much on one trade
- Always use stop loss
- Don’t overtrade

Survival is more important than profit.` },

            {
                title: "Trading Psychology",
                content: `Trading is mostly psychological.

Emotions like:
- Fear
- Greed
- Revenge trading

 These emotions cause most losses.

Discipline is the real edge.`},

            {
                title: "FOMO",
                content: `FOMO means fear of missing out.

It happens when people buy because others are buying.

 Problem:
You usually buy at the top during hype.`},

            {
                title: "Revenge Trading",
                content: `Revenge trading is when you try to recover losses quickly.

 Result:
It usually leads to even bigger losses because emotions take control.`},

            {
                title: "Discipline",
                content: `Discipline is the key to long-term success.

 Good traders:
- Follow a plan
- Don’t trade emotionally
- Accept losses as part of the game`}
        ]
    }
];

export default function CryptoLearning() {

    const [user, setUser] = useState(null);
    const [activeCategory, setActiveCategory] = useState(0);
    const [openLesson, setOpenLesson] = useState(null);
    const [completed, setCompleted] = useState([]);
    const [showQuiz, setShowQuiz] = useState(false);
    const [isCertified, setIsCertified] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);

    const lessons = data[activeCategory].lessons;

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u || null);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!user?.uid) return;

        const load = async () => {
            const ref = doc(db, "users", user.uid);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                const data = snap.data();
                setCompleted(data.cryptoCompleted || []);
                setIsCertified(data.cryptoCertified || false);
            }
        };
        load();
    }, [user]);

    const saveProgress = async (updated) => {
        if (!user?.uid) return;
        try {
            const ref = doc(db, "users", user.uid);
            await setDoc(ref, {
                cryptoCompleted: updated
            }, { merge: true });
        } catch (err) {
            console.error(err);
        }
    };

    function completeLesson(i) {
        const lesson = lessons[i];
        const id = lesson.title;

        if (completed.includes(id)) return;
        const updated = [...completed, id];
        setCompleted(updated);
        saveProgress(updated);
    }

    const toggleLesson = (i) => { setOpenLesson(openLesson === i ? null : i); };
    const totalLessons = data.reduce((acc, cat) => acc + cat.lessons.length, 0);
    const progress = totalLessons ? Math.round((completed.length / totalLessons) * 100) : 0;
    const isCompletedAll = completed.length === totalLessons;

    return (
        <>
            {showQuiz ? (
                <div className="quiz-fullscreen">
                    <CryptoFinalExam onBack={() => setShowQuiz(false)}
                        exitToLessons={() => {
                            setShowQuiz(false);
                            setIsCertified(true);
                        }}
                    />
                </div>
            ) : (
                <>
                    <Navbar />
                    <div className="crypto-page">
                        {/* HERO */}
                        <div className="crypto-hero">
                            <h1> Crypto Academy</h1>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }} />
                            </div>
                            <p>
                                Progress: {completed.length}/{totalLessons}
                            </p>
                        </div>
                        {/* CATEGORIES */}
                        <div className="crypto-categories">
                            {data.map((cat, i) => (
                                <div key={i} className={`crypto-category ${activeCategory === i ? "active" : ""}`} onClick={() => {
                                    setActiveCategory(i);
                                    setOpenLesson(null);
                                }}
                                >
                                    {cat.category}
                                </div>
                            ))}
                        </div>
                        {/* LESSONS */}
                        <div className="crypto-lessons">
                            {lessons.map((lesson, i) => {
                                const id = lesson.title;
                                const isOpen = openLesson === i;
                                const isDone = completed.includes(id);
                                return (
                                    <div key={id} className="crypto-card">
                                        <div className="crypto-head" onClick={() => toggleLesson(i)}>
                                            <h3>{lesson.title}</h3>
                                            <span className={isDone ? "done-tag" : "open-tag"}>
                                                {isDone ? " Done" : "Open"}
                                            </span>
                                        </div>
                                        {isOpen && (
                                            <div className="crypto-body">
                                                <p>{lesson.content}</p>
                                                <button
                                                    onClick={() => completeLesson(i)}
                                                    className={isDone ? "done-btn6" : "complete-btn6"}
                                                >
                                                    {isDone ? "Completed" : "Mark Complete"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* FINISH */}
                        {isCompletedAll && !isCertified && (
                            <div className="quiz-unlock">
                                <h2> Completed All Lessons</h2>
                                <p>You are ready for the quiz.</p>
                                <button className="start-quiz-btn" onClick={() => setShowQuiz(true)}>
                                    Start Quiz
                                </button>
                            </div>
                        )}
                        {isCertified && (
                            <div className="quiz-unlock">
                                <h2> Certificate Earned</h2>
                                <p> You successfully passed the Crypto Final Exam. </p>
                                <button
                                    className="start-quiz-btn" onClick={() => setShowCertificate(true)}>
                                    View Certificate
                                </button>
                            </div>
                        )}
                    </div>
                    {showCertificate && (
                        <div className="quiz-fullscreen">
                            <CryptoCertificate />
                        </div>
                    )}
                    <Footer />
                </>
            )}
        </>
    );
}
