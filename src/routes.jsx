import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";


import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Leaderboard from "./pages/Leaderboard";
import News from "./pages/News";
import Learning from "./pages/Learning";

import MarketSelect from "./pages/MarketSelect";

import ForexTrading from "./forex/pages/ForexTrading";
import ForexNews from "./forex/pages/ForexNews";
import ForexLearning from "./forex/pages/ForexLearning";
import EconomicCalendar from "./forex/pages/EconomicCalendar";


export default function RoutesComponent() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/news" element={<News />} />
                <Route path="/learning" element={<Learning />} />

                <Route path="/MarketSelect" element={<MarketSelect />} />


                <Route path="/forex/ForexTrading" element={<ForexTrading />} />
                <Route path="/forex/ForexNews" element={<ForexNews />} />
                <Route path="/forex/EconomicCalendar" element={<EconomicCalendar />} />
                <Route path="/forex/ForexLearning" element={<ForexLearning />} />
            </Routes>
        </BrowserRouter>
    );
}