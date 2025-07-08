import React from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Box, Typography, Button } from "@mui/material";

const GET_GAME = gql`
  query GetGame($id: ID!) {
    getGame(id: $id) {
      id
      board
      currentTurn
      status
      playerX {
        id
        username
      }
      playerO {
        id
        username
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
    }
  }
`;

const Game = () => {
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const { data, loading, error } = useQuery(GET_GAME, {
    variables: { id },
    pollInterval: 2000, // كل 2 ثانية يحدث اللعبة
  });

  const [makeMove] = useMutation(MAKE_MOVE);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography>Error: {error.message}</Typography>;

  const game = data.getGame;

  const isPlayerX = currentUser.id === game.playerX.id;
  const isPlayerO = currentUser.id === game.playerO.id;
  const isMyTurn =
    (isPlayerX && game.currentTurn === "X") ||
    (isPlayerO && game.currentTurn === "O");

  const handleMove = async (x, y) => {
    try {
      await makeMove({ variables: { gameId: id, x, y } });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box m={4}>
      <Typography variant="h5" mb={2}>
        Game with {game.playerX.username} vs {game.playerO.username}
      </Typography>
      <Typography mb={2}>
        {isMyTurn ? "Your turn" : "Opponent's turn"}
      </Typography>
      <Box display="grid" gridTemplateColumns="repeat(3, 80px)" gap={1}>
        {game.board.map((row, x) =>
          row.map((cell, y) => (
            <Button
              key={`${x}-${y}`}
              variant="outlined"
              onClick={() => handleMove(x, y)}
              disabled={!isMyTurn || cell !== ""}
              sx={{ height: "80px", fontSize: "24px" }}
            >
              {cell}
            </Button>
          ))
        )}
      </Box>
    </Box>
  );
};

export default Game;
