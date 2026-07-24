import { collection, addDoc, deleteDoc, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export function subscribeOpenTrades(callback) {
    let unsubFirestore = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
        if (!user) return;

        unsubFirestore = onSnapshot(
            collection(db, "users", user.uid, "openTrades"),
            (snapshot) => {
                const trades = [];
                snapshot.forEach((docu) => {
                    trades.push({
                        id: docu.id,
                        ...docu.data()
                    });
                });
                callback(trades);
            }
        );
    });

    return () => {
        unsubAuth();
        if (unsubFirestore) unsubFirestore();
    };
}

export function subscribeTrades(callback) {
    let unsubFirestore = null;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
        if (!user) return;
        unsubFirestore = onSnapshot(
            collection(db, "users", user.uid, "trades"),
            (snapshot) => {
                const trades = [];
                snapshot.forEach((docu) => {
                    trades.push({
                        id: docu.id,
                        ...docu.data()
                    });
                });
                callback(trades);
            }
        );
    });
    return () => { unsubAuth(); if (unsubFirestore) unsubFirestore(); };
}

export async function openTrade(data) {
    if (!auth.currentUser) { throw new Error("Login required"); }
    if (!data.amount || data.amount <= 0) { throw new Error("Invalid margin amount"); }

    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        throw new Error("User not found");
    }

    const userData = userSnap.data();
    const balance = userData.balance || 0;
    const margin = Number(data.amount);

    if (margin > balance) { throw new Error("Not enough balance"); }

    await updateDoc(userRef, { reservedMargin: (userData.reservedMargin || 0) + margin });

    await addDoc(collection(db, "users", auth.currentUser.uid, "openTrades"),
        {
            pair: data.pair,
            side: data.side,
            amount: margin,
            leverage: Number(data.leverage),
            tp: Number(data.tp),
            sl: Number(data.sl),
            entry: Number(data.entry),
            createdAt: Date.now()
        }
    );
}

export async function closeTrade(id, trade, livePrice) {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const userData = userSnap.data();
    const margin = Number(trade.amount);
    const leverage = Number(trade.leverage);
    const positionSize = margin * leverage;
    const pnl = trade.side === "buy" ? (livePrice - trade.entry) * (positionSize / trade.entry) : (trade.entry - livePrice) * (positionSize / trade.entry);
    const newBalance = (userData.balance || 0) + margin + pnl;
    await updateDoc(userRef, {
        balance: newBalance,
        totalProfit: (userData.totalProfit || 0) + pnl,
        totalTrades: (userData.totalTrades || 0) + 1,
        wins: pnl > 0 ? (userData.wins || 0) + 1 : (userData.wins || 0),
        reservedMargin: Math.max((userData.reservedMargin || 0) - margin, 0)
    });
    await addDoc(collection(db, "users", auth.currentUser.uid, "trades"),
        {
            symbol: trade.pair,
            entry: Number(trade.entry),
            exit: Number(livePrice),
            amount: margin,
            leverage,
            side: trade.side,
            profit: pnl,
            createdAt: Date.now()
        }
    );
    await deleteDoc(doc(db, "users", auth.currentUser.uid, "openTrades", id));
}

export async function updateTrade(id, tp, sl) {
    if (!auth.currentUser) {
        return;
    }
    await updateDoc(doc(db, "users", auth.currentUser.uid, "openTrades", id),
        { tp: Number(tp), sl: Number(sl) }
    );
}