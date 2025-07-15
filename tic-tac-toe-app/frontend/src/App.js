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
import { useContext, useEffect, useState } from "react";
import { useSubscription, gql } from "@apollo/client";
import ProtectedRoute from "./pages/ProtectedRoute";

const GAME_REQUEST_SUB = gql`
  subscription OnGameRequest($userId: ID!) {
    gameRequestReceived(userId: $userId) {
      id
    }
  }
`;

function App() {
  const [theme, colorMode] = useMode();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("currentUser"))
  );

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
            <Topbar setToken={setToken} setCurrentUser={setCurrentUser} />
            <Routes>
              <Route path="/" element={<Register setToken={setToken} />} />

              <Route
                path="/players"
                element={
                  <ProtectedRoute token={token}>
                    <PlayersList />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute token={token}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/game/:id"
                element={
                  <ProtectedRoute token={token}>
                    <Game />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute token={token}>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-games"
                element={
                  <ProtectedRoute token={token}>
                    <MyGames />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute token={token}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
