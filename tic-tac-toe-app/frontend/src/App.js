import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register";
import PlayersList from "./pages/PlayersList";
import Notifications from "./pages/Notifications";
import Game from "./pages/Game"; // 💥 أضفنا صفحة اللعب

function App() {
  return (
    <Router>
      <div style={{ margin: "20px" }}>
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/" style={{ marginRight: "10px" }}>
            Register
          </Link>
          <Link to="/players" style={{ marginRight: "10px" }}>
            Players List
          </Link>
          <Link to="/notifications" style={{ marginRight: "10px" }}>
            Notifications
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/players" element={<PlayersList />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/game/:id" element={<Game />} /> {/* ✅ Route للعبة */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
