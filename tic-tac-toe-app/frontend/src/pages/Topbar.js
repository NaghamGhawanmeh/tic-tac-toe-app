import { Box, IconButton, Menu, MenuItem, useTheme } from "@mui/material";
import { useState, useContext } from "react";
import { ColorModeContext, tokens } from "../../src/theme";
// import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { gql, useMutation } from "@apollo/client";
import { NotificationContext } from "../index"; // أو المسار اللي حطيت فيه الـ context
import Badge from "@mui/material/Badge";

// import { setLogout } from "../../redux/reducers/auth";

const Topbar = () => {
  const { pendingCount } = useContext(NotificationContext);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  //   const dispatch = useDispatch();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  //   const isLoggedIn = useSelector((reducers) => reducers.authReducer.token);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const UPDATE_STATUS = gql`
    mutation UpdateUserStatus($userId: ID!, $status: String!) {
      updateUserStatus(userId: $userId, status: $status) {
        id
        status
      }
    }
  `;
  const [updateUserStatus] = useMutation(UPDATE_STATUS);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const handleLogout = async () => {
    try {
      await updateUserStatus({
        variables: {
          userId: currentUser.id,
          status: "offline",
        },
      });

      localStorage.removeItem("currentUser");
      navigate("/");
    } catch (error) {
      console.error("Error updating status:", error.message);
    }
  };
  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      ></Box>

      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton
          onClick={(e) => {
            navigate("/notifications");
          }}
        >
          <Badge badgeContent={pendingCount} color="error">
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>
        <IconButton>
          <HomeOutlinedIcon
            onClick={(e) => {
              navigate("/players");
            }}
          />
        </IconButton>

        {/* Person icon with dropdown */}
        <IconButton onClick={handleMenuOpen}>
          <PersonOutlinedIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
          <MenuItem
            onClick={() => {
              handleLogout();
              //   dispatch(setLogout());
              handleMenuClose();
              navigate("/");
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;
