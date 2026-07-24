import WebSocket from "ws";

const twelveSockets = new Map();

export function connectToTwelveData(symbol, client) {

    if (twelveSockets.has(symbol)) {
        const data = twelveSockets.get(symbol);
        data.clients.add(client);
        return;
    }

    const clients = new Set();
    clients.add(client);
    const socket = new WebSocket(`wss://ws.twelvedata.com/v1/quotes/price?apikey=${process.env.TWELVEDATA_API_KEY}`);

    socket.on("open", () => {
        console.log("Connected to TwelveData:", symbol);
        socket.send(
            JSON.stringify({
                action: "subscribe",
                params: {
                    symbols: symbol
                }
            })
        );
    });
    socket.on("message", (message) => {
        const data = JSON.parse(message.toString());
        if (
            data.event === "price" && data.symbol && data.price !== undefined
        ) {
            const payload = JSON.stringify({
                type: "price",
                symbol: data.symbol,
                price: Number(data.price)
            });
            clients.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(payload);
                }
            });
        }
    });
    socket.on("close", () => {
        console.log("TwelveData disconnected:", symbol);
        twelveSockets.delete(symbol);
    });
    socket.on("error", err => {
        console.error("TwelveData Error:", err);
    });
    twelveSockets.set(symbol, {
        socket,
        clients
    });
}