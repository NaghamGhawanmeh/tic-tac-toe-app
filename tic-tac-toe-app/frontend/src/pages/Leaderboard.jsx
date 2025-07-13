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

const GET_PLAYERS = gql`
  query GetAllPlayers {
    getAllPlayers {
      id
      userName
      score
      status
    }
  }
`;

const Leaderboard = () => {
  const { data, loading, error } = useQuery(GET_PLAYERS);

  if (loading) return <CircularProgress />;
  if (error) return <Typography>Error loading leaderboard.</Typography>;

  const sortedPlayers = [...data.getAllPlayers].sort(
    (a, b) => b.score - a.score
  );

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
        Leaderboard
      </Typography>

      {sortedPlayers.map((player, index) => (
        <Card
          key={player.id}
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
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    mb: 1,
                  }}
                >
                  #{index + 1} - {player.userName}
                </Typography>
                <Typography>Score: {player.score}</Typography>
              </Box>

              <Chip
                label={player.status.toUpperCase()}
                sx={{
                  backgroundColor:
                    player.status === "online" ? "#4cceac" : "#db4f4a",
                  color: "#fff",
                  fontWeight: "bold",
                  px: 2,
                  py: 1,
                  fontSize: "0.9rem",
                }}
              />
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default Leaderboard;
