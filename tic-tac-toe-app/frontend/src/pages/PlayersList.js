import React from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const GET_PLAYERS = gql`
  query {
    getAllPlayers {
      id
      username
      status
      score
    }
  }
`;

const GET_MY_GAMES = gql`
  query GetMyGames($userId: ID!) {
    getMyGames(userId: $userId) {
      id
      status
      playerX {
        id
      }
      playerO {
        id
      }
    }
  }
`;

const SEND_REQUEST = gql`
  mutation SendGameRequest($fromId: ID!, $toId: ID!) {
    sendGameRequest(fromId: $fromId, toId: $toId)
  }
`;

const UPDATE_STATUS = gql`
  mutation UpdateUserStatus($userId: ID!, $status: String!) {
    updateUserStatus(userId: $userId, status: $status) {
      id
      status
    }
  }
`;

const PlayersList = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const { data, loading, error } = useQuery(GET_PLAYERS, {
    pollInterval: 5000,
  });

  const { data: gamesData } = useQuery(GET_MY_GAMES, {
    variables: { userId: currentUser.id },
    pollInterval: 3000,
  });

  const [requestGame] = useMutation(SEND_REQUEST);
  const [updateUserStatus] = useMutation(UPDATE_STATUS);

  // 🔥 هنا نراقب الألعاب
  React.useEffect(() => {
    if (gamesData) {
      const activeGame = gamesData.getMyGames.find(
        (game) => game.status === "in_progress"
      );
      if (activeGame) {
        navigate(`/game/${activeGame.id}`);
      }
    }
  }, [gamesData, navigate]);

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

  if (loading) return <CircularProgress />;
  if (error) return <Typography>Error: {error.message}</Typography>;

  return (
    <Box m={4}>
      <Typography variant="h4" mb={2}>
        Players List
      </Typography>
      <Button
        variant="outlined"
        color="error"
        onClick={handleLogout}
        sx={{ mb: 2 }}
      >
        Logout
      </Button>
      <List>
        {data.getAllPlayers
          .filter((player) => player.id !== currentUser?.id) // نخفي المستخدم الحالي
          .map((player) => (
            <ListItem key={player.id}>
              <ListItemText
                primary={player.username}
                secondary={`Score: ${player.score}`}
              />
              <Chip
                label={player.status}
                color={
                  player.status === "online"
                    ? "success"
                    : player.status === "playing"
                    ? "warning"
                    : "default"
                }
                sx={{ mr: 2 }}
              />
              {player.status === "online" && (
                <Button
                  variant="contained"
                  onClick={async () => {
                    try {
                      const { data } = await requestGame({
                        variables: {
                          fromId: currentUser.id,
                          toId: player.id,
                        },
                      });
                      console.log("Request sent:", data.sendGameRequest);
                      alert("Request sent successfully!");
                    } catch (error) {
                      console.error(error.message);
                    }
                  }}
                >
                  Send Request
                </Button>
              )}
            </ListItem>
          ))}
      </List>
    </Box>
  );
};

export default PlayersList;
