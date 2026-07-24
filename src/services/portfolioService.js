import { doc, getDoc, updateDoc, addDoc, collection, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";
import { getPrices } from "./liveService";

export function getPrice(symbol) {

    const prices = getPrices();

    if (!symbol) { return 0; }

    let formattedSymbol = symbol.toUpperCase();

    if (!formattedSymbol.endsWith("USDT")) { formattedSymbol = formattedSymbol + "USDT"; }

    const price = prices[formattedSymbol];
    return Number(price) || 0;

}

export function subscribeUser(callback) {

    let unsubscribeSnapshot = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {

        if (!user) {
            return;
        }

        unsubscribeSnapshot =
            onSnapshot(
                doc(db, "users", user.uid),

                (snap) => {
                    if (!snap.exists()) {
                        return;
                    }
                    callback({ id: snap.id, ...snap.data() });
                }
            );
    }
    );
    return () => {
        unsubscribeAuth();
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
        }
    };
}

export async function buyCrypto(symbol, usdAmount) {
    if (!auth.currentUser) {
        throw new Error(
            "Login required"
        );
    }

    if (!usdAmount || usdAmount <= 0) {
        throw new Error(
            "Invalid amount"
        );
    }

    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    const balance = userData.balance || 0;

    if (usdAmount > balance) {
        throw new Error(
            "Not enough balance"
        );
    }

    const livePrice = getPrice(symbol);

    if (!livePrice) {
        throw new Error(
            "Price not loaded"
        );
    }

    const cryptoAmount = usdAmount / livePrice;
    const portfolio = userData.portfolio || {};
    const existingAsset = portfolio[symbol] || { amount: 0, avgPrice: 0 };
    const oldAmount = Number(existingAsset.amount || 0);
    const oldAvgPrice = Number(existingAsset.avgPrice || 0);
    const oldInvestment = oldAmount * oldAvgPrice;
    const totalAmount = oldAmount + cryptoAmount;
    const avgPrice = (oldInvestment + usdAmount) / totalAmount;

    portfolio[symbol] = { amount: totalAmount, avgPrice };

    await updateDoc(userRef, {
        balance: balance - usdAmount,
        portfolio
    });

    await addDoc(collection(db, "users", auth.currentUser.uid, "walletHistory"),
        { type: "BUY", symbol, amountUSD: usdAmount, amountCrypto: cryptoAmount, price: livePrice, createdAt: new Date() }
    );
}

export async function sellCrypto(symbol, cryptoAmount) {

    if (!auth.currentUser) {
        throw new Error(
            "Login required"
        );
    }

    if (!cryptoAmount || cryptoAmount <= 0) {
        throw new Error(
            "Invalid amount"
        );
    }

    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
    const portfolio = userData.portfolio || {};
    const asset = portfolio[symbol];
    const owned = asset?.amount || 0;

    if (cryptoAmount > owned) {
        throw new Error(
            "Not enough crypto"
        );
    }

    const livePrice = getPrice(symbol);

    if (!livePrice) {
        throw new Error(
            "Price not loaded"
        );
    }

    const usdValue = cryptoAmount * livePrice;

    portfolio[symbol] = { amount: owned - cryptoAmount, avgPrice: asset.avgPrice };

    if (
        portfolio[symbol].amount <= 0
    ) {
        delete portfolio[symbol];
    }

    await updateDoc(userRef, {
        balance: (userData.balance || 0) + usdValue, portfolio
    });

    await addDoc(
        collection(db, "users", auth.currentUser.uid, "walletHistory"),
        {
            type: "SELL", symbol, amountUSD: usdValue, amountCrypto: cryptoAmount, price: livePrice, createdAt: new Date()
        }
    );
}