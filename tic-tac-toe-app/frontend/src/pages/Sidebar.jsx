import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../theme";
import { useQuery, gql } from "@apollo/client";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import GamesOutlinedIcon from "@mui/icons-material/GamesOutlined";

const GET_USER = gql`
  query GetUserByUsername($userName: String!) {
    getUserByUsername(userName: $userName) {
      id
      userName
      status
      score
    }
  }
`;

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{ color: colors.grey[100] }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userName = currentUser?.userName;

  const { data, loading, error } = useQuery(GET_USER, {
    variables: { userName },
    skip: !userName,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading user info.</div>;

  const user = data?.getUserByUsername;

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{ margin: "10px 0 20px 0", color: colors.grey[100] }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && user && (
            <Box
              mb="25px"
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                  borderRadius: "50%",
                  overflow: "hidden",
                  width: "100px",
                  height: "100px",
                  boxShadow: `0 0 15px ${colors.primary[600]}`,
                  border: `3px solid ${colors.greenAccent[500]}`,
                  mb: 2,
                }}
              >
                <img
                  alt="profile-user"
                  src="https://promoteur.angem.dz/images/service/user.png"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>

              <Typography
                variant="h4"
                color={colors.grey[100]}
                fontWeight="bold"
                textAlign="center"
              >
                {user.userName}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color:
                    user.status === "online"
                      ? colors.greenAccent[500]
                      : colors.redAccent[500],
                  fontWeight: "medium",
                  mt: "5px",
                }}
              >
                {user.status === "online" ? "🟢 Online" : "🔴 Playing"}
              </Typography>

              <Typography
                variant="body2"
                color={colors.blueAccent[500]}
                sx={{ mt: "5px" }}
              >
                Score: <strong>{user.score}</strong>
              </Typography>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            {/* <Item
              title="Home"
              to="/dashboard"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            /> */}
            <Item
              title="Players"
              to="/players"
              icon={<PeopleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="My Games"
              to="/my-games"
              icon={<GamesOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Leaderboard"
              to="/leaderboard"
              icon={<EmojiEventsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Settings"
              to="/settings"
              icon={<SettingsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
