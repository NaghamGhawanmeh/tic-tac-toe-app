import React, { useEffect, useState, useRef } from "react";
import { useQuery, useSubscription, useMutation, gql } from "@apollo/client";
import { Box, Typography, Button, Paper } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";
import { useNavigate, useParams } from "react-router-dom";

const GET_GAME = gql`
  query GetGame($id: ID!) {
    getGame(id: $id) {
      id
      board
      currentTurn
      status
      playerX {
        id
        userName
      }
      playerO {
        id
        userName
      }
      winner {
        id
        userName
      }
    }
  }
`;

const GAME_UPDATED_SUB = gql`
  subscription OnGameUpdated($gameId: ID!) {
    gameUpdated(gameId: $gameId) {
      id
      board
      currentTurn
      status
      winner {
        id
        userName
      }
      playerX {
        id
        userName
      }
      playerO {
        id
        userName
      }
    }
  }
`;

const MAKE_MOVE = gql`
  mutation MakeMove($gameId: ID!, $x: Int!, $y: Int!) {
    makeMove(gameId: $gameId, x: $x, y: $y) {
      id
      board
      currentTurn
      status
      winner {
        id
        userName
      }
    }
  }
`;

const Game = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  console.log("🚀 [FRONTEND] Subscribing with gameId:", id);

  const { data, loading, error } = useQuery(GET_GAME, {
    variables: { id },
  });

  const { data: subData } = useSubscription(GAME_UPDATED_SUB, {
    variables: { gameId: id },
    skip: !id, // ✅ لمنع إعادة الاشتراك كل مرة بدون سبب
    onSubscriptionData: ({ subscriptionData }) => {
      console.log(
        "🔥 [FRONTEND] Received subscription data:",
        subscriptionData
      );
    },
  });

  const [makeMove] = useMutation(MAKE_MOVE);

  const [timer, setTimer] = useState(10);
  const intervalRef = useRef();

  const game = subData ? subData.gameUpdated : data?.getGame;

  const isPlayerX = currentUser.id === game?.playerX.id;
  const isPlayerO = currentUser.id === game?.playerO.id;
  const isMyTurn =
    (isPlayerX && game?.currentTurn === "X") ||
    (isPlayerO && game?.currentTurn === "O");
  // eslint-disable-next-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (game && game.status === "in_progress") {
      setTimer(10);

      clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(intervalRef.current);
            if (isMyTurn) {
              makeMove({ variables: { gameId: id, x: -1, y: -1 } });
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [game?.currentTurn]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;
  if (!game) return <Typography>Game not found</Typography>;

  const handleMove = async (x, y) => {
    try {
      await makeMove({ variables: { gameId: id, x, y } });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box m={4} textAlign="center">
      <Typography variant="h4" mb={2} color={colors.greenAccent[500]}>
        Game: {game.playerX.userName} vs {game.playerO.userName}
      </Typography>
      <Typography
        mb={2}
        variant="h6"
        sx={{
          color: isMyTurn ? colors.greenAccent[400] : colors.redAccent[400],
        }}
      >
        {isMyTurn ? "Your turn" : "Opponent's turn"}
      </Typography>
      <Typography mb={2} variant="body1" color={colors.grey[300]}>
        ⏰ Timer: {timer}s
      </Typography>
      <Paper
        elevation={3}
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 100px)",
          gap: 1.5,
          p: 2,
          backgroundColor: colors.primary[400],
          borderRadius: "12px",
          justifyContent: "center",
          width: "fit-content",
          mx: "auto",
        }}
      >
        {game.board.map((row, x) =>
          row.map((cell, y) => (
            <Button
              key={`${x}-${y}`}
              variant="contained"
              onClick={() => handleMove(x, y)}
              disabled={
                !isMyTurn || cell !== "" || game.status !== "in_progress"
              }
              sx={{
                height: "100px",
                fontSize: "32px",
                color: colors.grey[100],
                backgroundColor:
                  cell === "X"
                    ? colors.blueAccent[500]
                    : cell === "O"
                    ? colors.redAccent[500]
                    : colors.primary[500],
                "&:hover": {
                  backgroundColor:
                    cell === "X"
                      ? colors.blueAccent[600]
                      : cell === "O"
                      ? colors.redAccent[600]
                      : colors.primary[600],
                },
              }}
            >
              {cell}
            </Button>
          ))
        )}
      </Paper>
      {(game.status === "finished" || game.status === "draw") && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "16px",
            zIndex: 10,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: colors.greenAccent[500],
              fontWeight: "bold",
              mb: 2,
            }}
          >
            🎉 {game.winner ? `${game.winner.userName} wins!` : "It's a draw!"}
          </Typography>
          <Button
            variant="contained"
            sx={{
              background: colors.blueAccent[500],
              color: "#fff",
              fontWeight: "bold",
              px: 4,
              py: 1,
              borderRadius: "8px",
              "&:hover": {
                background: colors.blueAccent[600],
              },
            }}
            onClick={() => navigate("/players")}
          >
            Back to Players
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Game;
