import { useQuery, gql } from "@apollo/client";
import {
  Box,
  Typography,
  Card,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";

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

const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

const Leaderboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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
        mb={4}
        sx={{
          fontWeight: "bold",
          color: colors.greenAccent[500],
        }}
      >
        Leaderboard
      </Typography>

      <Stack spacing={3}>
        {sortedPlayers.map((player, index) => (
          <Card
            key={player.id}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              backgroundColor: colors.primary[400],
              color: colors.grey[100],
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 24px rgba(0,0,0,0.4)",
              },
            }}
          >
            {/* Medal or Rank */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor:
                  index < 3 ? medalColors[index] : colors.grey[600],
                color: index < 3 ? "#000" : colors.grey[100],
                mr: 2,
                fontWeight: "bold",
              }}
            >
              {index < 3 ? (
                <EmojiEventsIcon sx={{ fontSize: 30 }} />
              ) : (
                <Typography variant="h6">#{index + 1}</Typography>
              )}
            </Box>

            <Box flexGrow={1}>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                {player.userName}
              </Typography>
              <Typography>Score: {player.score}</Typography>
            </Box>

            <Chip
              label={player.status.toUpperCase()}
              sx={{
                backgroundColor:
                  player.status === "online"
                    ? colors.greenAccent[500]
                    : colors.redAccent[500],
                color: "#fff",
                fontWeight: "bold",
              }}
            />
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default Leaderboard;
