import {
  Box,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useState, useContext } from "react";
import { tokens, ColorModeContext } from "../theme";
import { useTheme } from "@mui/material/styles";
import { gql, useMutation } from "@apollo/client";

const UPDATE_USER_NAME = gql`
  mutation UpdateUserName($userId: ID!, $newUserName: String!) {
    updateUserName(userId: $userId, newUserName: $newUserName) {
      id
      userName
    }
  }
`;
const Settings = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [userName, setUserName] = useState(currentUser?.userName || "");
  const [notifications, setNotifications] = useState(true);

  const [updateUserName] = useMutation(UPDATE_USER_NAME);

  const handleUpdateName = async () => {
    try {
      const res = await updateUserName({
        variables: {
          userId: currentUser.id,
          newUserName: userName,
        },
      });

      const updatedUser = res.data.updateUserName;
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      alert("Name updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to update name");
    }
  };

  return (
    <Box
      m={4}
      p={4}
      borderRadius="12px"
      sx={{
        background: colors.primary[400],
        color: colors.grey[100],
        boxShadow: `0 8px 24px ${colors.primary[600]}`,
      }}
    >
      <Typography
        variant="h3"
        mb={3}
        fontWeight="bold"
        color={colors.greenAccent[500]}
      >
        Settings
      </Typography>

      {/* Change display name */}
      <Typography variant="h5" mt={2} color={colors.grey[100]}>
        Change Display Name
      </Typography>
      <TextField
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        fullWidth
        sx={{
          mt: 1,
          mb: 2,
          input: { color: colors.grey[100] },
          "& .MuiInputLabel-root": { color: colors.grey[300] },
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: colors.blueAccent[500],
            },
            "&:hover fieldset": {
              borderColor: colors.blueAccent[400],
            },
            "&.Mui-focused fieldset": {
              borderColor: colors.greenAccent[500],
            },
          },
        }}
      />
      <Button
        variant="contained"
        onClick={handleUpdateName}
        sx={{
          background: colors.blueAccent[500],
          ":hover": { background: colors.blueAccent[600] },
        }}
      >
        Update Name
      </Button>

      {/* Notifications */}
      <Typography variant="h5" mt={4} color={colors.grey[100]}>
        Notifications
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
            sx={{
              "& .MuiSwitch-thumb": {
                backgroundColor: colors.greenAccent[500],
              },
              "& .MuiSwitch-track": { backgroundColor: colors.grey[500] },
            }}
          />
        }
        label="Enable Game Notifications"
      />

      {/* Theme */}
      <Typography variant="h5" mt={4} color={colors.grey[100]}>
        Theme
      </Typography>
      <Button
        variant="outlined"
        onClick={colorMode.toggleColorMode}
        sx={{
          color: colors.blueAccent[500],
          borderColor: colors.blueAccent[500],
          ":hover": {
            background: colors.blueAccent[500],
            color: "#fff",
            borderColor: colors.blueAccent[500],
          },
        }}
      >
        Toggle Theme
      </Button>

      {/* Account */}
      <Typography variant="h5" mt={4} color={colors.grey[100]}>
        Account
      </Typography>
      <Button
        variant="contained"
        color="error"
        sx={{
          mt: 1,
          background: colors.redAccent[500],
          ":hover": { background: colors.redAccent[600] },
        }}
      >
        Delete Account
      </Button>
    </Box>
  );
};

export default Settings;
