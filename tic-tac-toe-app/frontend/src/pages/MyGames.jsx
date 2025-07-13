import { useQuery, gql } from "@apollo/client";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Stack,
} from "@mui/material";

const GET_MY_GAMES = gql`
  query GetMyGames($userId: ID!) {
    getMyGames(userId: $userId) {
      id
      status
      playerX {
        userName
      }
      playerO {
        userName
      }
      winner {
        userName
      }
    }
  }
`;

const MyGames = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userId = currentUser?.id;

  const { data, loading, error } = useQuery(GET_MY_GAMES, {
    variables: { userId },
    skip: !userId,
  });

  if (loading) return <CircularProgress />;
  if (error) return <Typography>Error loading your games.</Typography>;

  return (
    <Box m={4}>
      <Typography
        variant="h3"
        mb={3}
        sx={{
          fontWeight: "bold",
          background: "linear-gradient(90deg, #4cceac, #6870fa)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        My Games
      </Typography>
      {data.getMyGames.length === 0 ? (
        <Typography>No games found.</Typography>
      ) : (
        data.getMyGames.map((game) => (
          <Card
            key={game.id}
            sx={{
              mb: 3,
              background: "linear-gradient(135deg, #1f2a40, #3a3f58)",
              color: "#fff",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0 16px 32px rgba(0,0,0,0.5)",
              },
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Game ID: {game.id}
              </Typography>

              <Stack direction="row" spacing={2} mt={1} mb={1}>
                <Chip
                  label={`Player X: ${game.playerX.userName}`}
                  sx={{
                    backgroundColor: "#6870fa",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                />
                <Chip
                  label={`Player O: ${game.playerO.userName}`}
                  sx={{
                    backgroundColor: "#db4f4a",
                    color: "#fff",
                    fontWeight: "bold",
                  }}
                />
              </Stack>

              <Chip
                label={game.status.toUpperCase()}
                sx={{
                  mt: 1,
                  backgroundColor:
                    game.status === "in_progress"
                      ? "#f0a500"
                      : game.status === "finished"
                      ? "#4cceac"
                      : "#a3a3a3",
                  color: "#fff",
                  fontWeight: "bold",
                  px: 2,
                  py: 1,
                  fontSize: "0.9rem",
                }}
              />

              {game.status === "finished" && game.winner && (
                <Typography
                  mt={2}
                  variant="h6"
                  sx={{
                    color: "#4cceac",
                    fontWeight: "bold",
                  }}
                >
                  🏆 Winner: {game.winner.userName}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default MyGames;
