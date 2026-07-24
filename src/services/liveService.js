const sockets = {};
const prices = {};

export function startLiveTrading(pair, refreshCallback) {

    const formattedPair = pair.toUpperCase();

    if (sockets[formattedPair]) {
        return;
    }

    sockets[formattedPair] = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@trade`);
    sockets[formattedPair].onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            prices[formattedPair] = parseFloat(data.p);
            if (refreshCallback) { refreshCallback(); }
        } catch (err) {
            console.error(err);
        }
    };
}

export function stopLiveTrading(pair) {

    if (!pair) {
        return;
    }

    const formattedPair =
        pair.toUpperCase();

    if (sockets[formattedPair]) {
        sockets[formattedPair].close();
        delete sockets[formattedPair];
    }
}

export function getCurrentPrice(pair) {
    return (
        prices[pair.toUpperCase()] || 0
    );
}

export function getPrices() {
    return prices;
}