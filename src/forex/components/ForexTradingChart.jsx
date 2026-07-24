import { useEffect } from "react";

export default function ForexTradingChart({ symbol }) {

    useEffect(() => {
        const loadChart = () => {
            const container = document.getElementById("forex-chart");
            if (!container) return;
            container.innerHTML = "";
            new window.TradingView.widget({
                autosize: true,
                symbol: symbol,
                interval: "15",
                timezone: "Europe/Prague",
                theme: "dark",
                style: "1",
                locale: "en",
                toolbar_bg: "#0b0e11",
                enable_publishing: false,
                allow_symbol_change: true,
                hide_top_toolbar: false,
                hide_side_toolbar: false,
                withdateranges: true,
                details: true,
                container_id: "forex-chart"
            });
        };

        if (!window.TradingView) {
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/tv.js";
            script.async = true;
            script.onload = loadChart;
            document.body.appendChild(script);

        } else {
            loadChart();
        }
    }, [symbol]);

    return (
        <div id="forex-chart" style={{ width: "100%", height: "650px" }} />
    );
}