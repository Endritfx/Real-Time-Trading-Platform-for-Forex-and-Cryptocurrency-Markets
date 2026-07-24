const sockets = {};
const prices = {};

export function startForexLive(symbol) {

    if (sockets[symbol]) {
        return;
    }

    const socket = new WebSocket("ws://localhost:5000");

    socket.onopen = () => {
        console.log("Connected to Backend");
        socket.send(
            JSON.stringify({
                action: "subscribe",
                symbol
            })
        );
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("TWELVEDATA RESPONSE:", data);

        if (
            data.type === "price" &&
            data.symbol &&
            data.price !== undefined
        ) {
            prices[data.symbol] = Number(data.price);
            console.log("PRICE UPDATED:", data.symbol, prices[data.symbol]);
        }
    };

    socket.onerror = (error) => {
        console.error("TWELVEDATA SOCKET ERROR", error);
    };

    socket.onclose = () => {
        console.log("SOCKET CLOSED", symbol);
        delete sockets[symbol];
    };

    sockets[symbol] = socket;
}

export function stopForexLive(symbol) {
    if (!symbol)
        return;

    if (sockets[symbol]) {

        sockets[symbol].close();
        delete sockets[symbol];
    }
}

export function getForexPrice(symbol) {
    return prices[symbol] || null;
}