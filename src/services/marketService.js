export async function getMarketStats(symbol) {
    try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
        const data = await response.json();
        return {
            high: Number(data.highPrice),
            low: Number(data.lowPrice),
            volume: Number(data.volume),
            changePercent: Number(data.priceChangePercent),
        };

    } catch (err) {
        return null;
    }
}