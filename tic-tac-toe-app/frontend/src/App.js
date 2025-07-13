import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import PlayersList from "./pages/PlayersList";
import Notifications from "./pages/Notifications";
import Game from "./pages/Game";
import Topbar from "./pages/Topbar";
import { ColorModeContext, useMode } from "./theme";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline, GlobalStyles } from "@mui/material";
import "./App.css";
import Sidebar from "./pages/Sidebar";
import Leaderboard from "./pages/Leaderboard";
import MyGames from "./pages/MyGames";
import Settings from "./pages/Settings ";
import { NotificationContext } from "./index";
import { useContext, useEffect } from "react";
import { useSubscription, gql } from "@apollo/client";

const GAME_REQUEST_SUB = gql`
  subscription OnGameRequest($userId: ID!) {
    gameRequestReceived(userId: $userId) {
      id
    }
  }
`;

function App() {
  const [theme, colorMode] = useMode();
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const { setPendingCount } = useContext(NotificationContext);

  const { data: subData } = useSubscription(GAME_REQUEST_SUB, {
    variables: { userId: currentUser?.id },
    skip: !currentUser?.id,
  });

  useEffect(() => {
    if (subData && subData.gameRequestReceived) {
      setPendingCount((prev) => prev + 1);
    }
  }, [subData, setPendingCount]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            ".MuiDataGrid-root": {
              "--DataGrid-t-header-background-base": "#7075d1",
            },
          }}
        />
        <div
          className="app"
          style={{
            display: "flex",
            height: "100vh",
          }}
        >
          {token && <Sidebar />}
          <main className="content" style={{ flexGrow: 1 }}>
            <Topbar />
            <Routes>
              <Route path="/" element={<Register />} />
              <Route path="/players" element={<PlayersList />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/game/:id" element={<Game />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/my-games" element={<MyGames />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
