import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

async function createUserIfNotExists(user, usernameInput = null) {

    const userRef = doc(db, "users", user.uid);
    try {
        const snap = await getDoc(userRef);
        console.log("Firestore OK");
        if (!snap.exists()) {
            console.log("Creating user...");
            await setDoc(userRef, {
                username: usernameInput || user.displayName || user.email.split("@")[0],
                email: user.email,
                balance: 10000,
                totalProfit: 0,
                totalTrades: 0,
                wins: 0,
                portfolio: {},
                createdAt: new Date()
            });
        }
    } catch (err) {
        console.error("FIRESTORE ERROR:", err);
        throw err;
    }
}

export async function register(username, email, password) {

    if (!username || !email || !password) {
        throw new Error("Fill all fields");
    }

    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    await createUserIfNotExists(userCred.user, username);

    return userCred;
}

export async function login(email, password) {

    const userCred = await signInWithEmailAndPassword(auth, email, password);

    console.log("UID:", userCred.user.uid);

    await createUserIfNotExists(userCred.user);

    return userCred;
}

export async function googleLogin() {

    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(auth, provider);

    await createUserIfNotExists(result.user);

    return result;
}

