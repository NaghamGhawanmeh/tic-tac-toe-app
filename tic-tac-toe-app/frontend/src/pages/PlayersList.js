import React, { useEffect } from "react";
import { useQuery, useSubscription, useMutation, gql } from "@apollo/client";
import {
  Box,
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { tokens } from "../theme";
import { useTheme } from "@mui/material/styles";

const USER_STATUS_SUB = gql`
  subscription OnUserStatusChanged {
    userStatusChanged {
      id
      userName
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
    }
  }
`;

const GET_ACTIVE_GAMES = gql`
  query {
    getActiveGames {
      id
      playerX {
        id
      }
      playerO {
        id
      }
      status
    }
  }
`;

const GET_PLAYERS = gql`
  query {
    getAllPlayers {
      id
      userName
      status
      score
    }
  }
`;

const SEND_REQUEST = gql`
  mutation SendGameRequest($fromId: ID!, $toId: ID!) {
    sendGameRequest(fromId: $fromId, toId: $toId)
  }
`;

const PlayersList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const { data: playersData, loading, error } = useQuery(GET_PLAYERS);
  const { data: statusData } = useSubscription(USER_STATUS_SUB);

  const { data: gamesData } = useQuery(GET_MY_GAMES, {
    variables: { userId: currentUser.id },
    pollInterval: 2000,
  });

  const { data: activeGamesData } = useQuery(GET_ACTIVE_GAMES, {
    pollInterval: 2000,
  });

  const [requestGame] = useMutation(SEND_REQUEST);

  useEffect(() => {
    if (gamesData) {
      const activeGame = gamesData.getMyGames.find(
        (g) => g.status === "in_progress"
      );
      if (activeGame) {
        navigate(`/game/${activeGame.id}`);
      }
    }
  }, [gamesData, navigate]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography>Error: {error.message}</Typography>;

  let players = playersData ? [...playersData.getAllPlayers] : [];

  if (statusData && players.length > 0) {
    const updatedPlayer = statusData.userStatusChanged;
    const index = players.findIndex((p) => p.id === updatedPlayer.id);
    if (index !== -1) {
      players[index] = updatedPlayer;
    }
  }

  return (
    <Box m={4}>
      <Typography
        variant="h3"
        mb={3}
        sx={{ color: colors.greenAccent[500], fontWeight: "bold" }}
      >
        Players List
      </Typography>

      <Stack spacing={3}>
        {players
          .filter((p) => p.id !== currentUser.id)
          .map((player) => (
            <Card
              key={player.id}
              variant="outlined"
              sx={{
                background: colors.primary[400],
                borderRadius: "16px",
                color: colors.grey[100],
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: `0 12px 30px ${colors.primary[600]}`,
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color={colors.grey[100]}
                  >
                    {player.userName}
                  </Typography>
                  <Typography variant="body2" color={colors.grey[300]}>
                    Score: {player.score}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={player.status}
                    sx={{
                      backgroundColor:
                        player.status === "online"
                          ? colors.greenAccent[500]
                          : player.status === "playing"
                          ? colors.redAccent[500]
                          : colors.grey[500],
                      color: "#fff",
                      fontWeight: "bold",
                    }}
                  />

                  {player.status === "online" && (
                    <Button
                      variant="contained"
                      sx={{
                        background: colors.blueAccent[500],
                        color: "#fff",
                        fontWeight: "bold",
                        transition: "transform 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                          background: colors.blueAccent[600],
                        },
                      }}
                      onClick={async () => {
                        try {
                          await requestGame({
                            variables: {
                              fromId: currentUser.id,
                              toId: player.id,
                            },
                          });
                          alert("Request sent successfully!");
                        } catch (error) {
                          console.error(error.message);
                        }
                      }}
                    >
                      Challenge
                    </Button>
                  )}

                  {player.status === "playing" && (
                    <Button
                      variant="outlined"
                      sx={{
                        border: `2px solid ${colors.blueAccent[500]}`,
                        color: colors.blueAccent[500],
                        fontWeight: "bold",
                        transition: "transform 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                          background: colors.blueAccent[500],
                          color: "#fff",
                        },
                      }}
                      onClick={() => {
                        const gameToWatch =
                          activeGamesData?.getActiveGames.find(
                            (g) =>
                              (g.playerX.id === player.id ||
                                g.playerO.id === player.id) &&
                              g.status === "in_progress"
                          );

                        if (gameToWatch) {
                          navigate(`/game/${gameToWatch.id}`);
                        } else {
                          alert("No active game found to watch!");
                        }
                      }}
                    >
                      Watch
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
      </Stack>
    </Box>
  );
};

export default PlayersList;
