import { useEffect, useState } from "react";

export default function EconomicCalendarWidget() {

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const container = document.getElementById("tradingview-calendar");

        if (!container) return;

        if (
            container.children.length > 0
        ) {
            return;
        }

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-events.js";
        script.async = true;
        script.onload = () => {
            setLoading(false);
        };
        script.innerHTML = JSON.stringify({
            colorTheme: "dark",
            isTransparent: false,
            width: "100%",
            height: "900",
            locale: "en",
            importanceFilter: "-1,0,1"
        });
        container.appendChild(script);
    }, []);

    return (
        <div className="tradingview-widget-container">
            {
                loading &&
                (
                    <div className="calendar-loading">
                        Loading Economic Calendar...
                    </div>
                )
            }
            <div id="tradingview-calendar" className="tradingview-widget-container__widget" />
        </div>
    );
}