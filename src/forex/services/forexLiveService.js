const sockets = {};
const prices = {};

export function startForexLive(symbol) {

    if (sockets[symbol]) {
        return;
    }

    const socket = new WebSocket("wss://trading-platform-backend-peyh.onrender.com");

    socket.onopen = () => {
        socket.send(
            JSON.stringify({
                action: "subscribe",
                symbol
            })
        );
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (
            data.type === "price" &&
            data.symbol &&
            data.price !== undefined
        ) {
            prices[data.symbol] = Number(data.price);
        }
    };

    socket.onerror = (error) => {
        console.error("TWELVEDATA SOCKET ERROR", error);
    };

    socket.onclose = () => {
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