import { Routes, Route, useLocation } from "react-router-dom";
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
function App() {
  const [theme, colorMode] = useMode();
  const user = localStorage.getItem("token");
  const location = useLocation();

  const hideTopbarPaths = ["/"];
  const shouldShowTopbar = !hideTopbarPaths.includes(location.pathname);

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
          {user && <Sidebar />}
          <main className="content" style={{ flexGrow: 1 }}>
            {shouldShowTopbar && <Topbar />}
            <Routes>
              <Route path="/" element={<Register />} />
              <Route path="/players" element={<PlayersList />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/game/:id" element={<Game />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
