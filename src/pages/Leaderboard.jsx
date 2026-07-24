import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/leaderboard.css";

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [sortType, setSortType] = useState("profit");

    useEffect(() => {
        const unsub = onSnapshot(collection(db, "users"), (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
                const d = doc.data();
                data.push({
                    id: doc.id, username: d.username || "Trader",
                    balance:
                        Number(d.balance || 0),
                    totalProfit: Number(d.totalProfit || 0),
                    wins: Number(d.wins || 0),
                    totalTrades: Number(d.totalTrades || 0)
                });
            });
            setUsers(data);
        }
        );
        return () => unsub();
    }, []);

    const sortedUsers =
        [...users];

    if (sortType === "profit") {
        sortedUsers.sort(
            (a, b) => b.totalProfit - a.totalProfit
        );
    }

    if (sortType === "balance") {
        sortedUsers.sort(
            (a, b) => b.balance - a.balance
        );
    }

    if (sortType === "winrate") {
        sortedUsers.sort(
            (a, b) => {
                const aRate = a.totalTrades > 0 ? (a.wins / a.totalTrades) * 100 : 0;
                const bRate = b.totalTrades > 0 ? (b.wins / b.totalTrades) * 100 : 0;
                return bRate - aRate;
            }
        );
    }

    const myIndex = sortedUsers.findIndex((u) => u.id === auth.currentUser?.uid);
    return (
        <>
            <Navbar />
            <div className="leaderboard-container" >
                <div className="top-box">
                    <h1>🏆 Top Traders </h1>
                    <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
                        <option value="profit">Profit</option>
                        <option value="balance"> Balance </option>
                        <option value="winrate"> Win Rate </option>
                    </select>
                </div>
                <div className="my-rank">
                    Your Rank:
                    {
                        myIndex >= 0
                            ? ` #${myIndex + 1}`
                            : " --"
                    }
                </div>
                <div className="leaderboard-header">
                    <span>Rank</span>
                    <span>User</span>
                    <span>Balance</span>
                    <span>Profit</span>
                    <span>Win Rate</span>
                </div>
                <div className="leaderboard-list" >
                    {
                        sortedUsers.map(
                            (user, index) => {
                                let medal = "#" + (index + 1);
                                if (index === 0) medal = "👑";
                                if (index === 1) medal = "🥈";
                                if (index === 2) medal = "🥉";

                                const winRate = user.totalTrades > 0 ? (
                                    (
                                        user.wins /
                                        user.totalTrades
                                    ) * 100
                                ).toFixed(1)
                                    : "0";

                                return (
                                    <div key={user.id} className={user.id === auth.currentUser?.uid ? "row current-user" : "row"}>
                                        <div> {medal}</div>
                                        <div>{user.username}</div>
                                        <div>{user.balance.toFixed(2)}$</div>
                                        <div className={user.totalProfit >= 0 ? "profit-positive" : "profit-negative"}>
                                            {user.totalProfit >= 0 ? "+" : ""}
                                            {user.totalProfit.toFixed(2)}$
                                        </div>
                                        <div> {winRate}%</div>
                                    </div>
                                );
                            }
                        )
                    }
                </div>
            </div>
            <Footer />
        </>
    );
}