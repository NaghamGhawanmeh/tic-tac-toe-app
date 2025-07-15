import React, { useContext, useEffect } from "react";
import { useSubscription, useMutation, useQuery, gql } from "@apollo/client";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { tokens } from "../theme";
import { useTheme } from "@mui/material/styles";
import { NotificationContext } from "../index";

const GAME_REQUEST_SUB = gql`
  subscription OnGameRequest($userId: ID!) {
    gameRequestReceived(userId: $userId) {
      id
      playerX {
        id
        userName
      }
      status
    }
  }
`;

const GET_PENDING_REQUESTS = gql`
  query GetPendingRequests($userId: ID!) {
    getPendingRequests(userId: $userId) {
      id
      playerX {
        id
        userName
      }
      status
    }
  }
`;

const ACCEPT_REQUEST = gql`
  mutation AcceptGameRequest($gameId: ID!) {
    acceptGameRequest(gameId: $gameId) {
      id
      status
    }
  }
`;

const REJECT_REQUEST = gql`
  mutation RejectGameRequest($gameId: ID!) {
    rejectGameRequest(gameId: $gameId)
  }
`;

const Notifications = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const currentUserId = currentUser?.id;

  const { setPendingCount } = useContext(NotificationContext);

  const { data: queryData, refetch } = useQuery(GET_PENDING_REQUESTS, {
    variables: { userId: currentUserId },
    skip: !currentUserId,
  });

  const { data: subData } = useSubscription(GAME_REQUEST_SUB, {
    variables: { userId: currentUserId },
    skip: !currentUserId,
  });

  const [acceptGameRequest] = useMutation(ACCEPT_REQUEST);
  const [rejectGameRequest] = useMutation(REJECT_REQUEST);

  useEffect(() => {
    if (subData && subData.gameRequestReceived) {
      refetch();
      setPendingCount(1);
    }
  }, [subData, refetch, setPendingCount]);
  // no need for useEffect
  if (!currentUserId) {
    return (
      <Typography variant="h6" mt={4}>
        Please log in first.
      </Typography>
    );
  }

  const pendingRequests = queryData?.getPendingRequests || [];

  return (
    <Box m={4}>
      <Typography
        variant="h3"
        mb={3}
        sx={{
          background: `linear-gradient(45deg, ${colors.blueAccent[500]}, ${colors.greenAccent[500]})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: "bold",
        }}
      >
        Game Requests
      </Typography>

      {pendingRequests.length === 0 ? (
        <Typography>No requests found.</Typography>
      ) : (
        pendingRequests.map((req) => (
          <Card
            key={req.id}
            variant="outlined"
            sx={{
              background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.primary[600]} 100%)`,
              borderRadius: "20px",
              color: colors.grey[100],
              boxShadow: `0 8px 30px ${colors.primary[600]}`,
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: `0 16px 40px ${colors.primary[600]}`,
              },
              mb: 3,
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color={colors.grey[100]}
                >
                  🎮 Request from: {req.playerX.userName}
                </Typography>
                <Typography variant="body2" color={colors.grey[300]}>
                  Status: {req.status}
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} sx={{ mt: { xs: 2, sm: 0 } }}>
                <Button
                  variant="contained"
                  sx={{
                    background: `linear-gradient(45deg, ${colors.greenAccent[500]}, ${colors.greenAccent[600]})`,
                    color: "#fff",
                    fontWeight: "bold",
                    px: 3,
                    py: 1,
                    borderRadius: "12px",
                    textTransform: "none",
                    boxShadow: `0 4px 12px ${colors.greenAccent[600]}`,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: `0 8px 20px ${colors.greenAccent[600]}`,
                    },
                  }}
                  onClick={async () => {
                    await acceptGameRequest({ variables: { gameId: req.id } });
                    alert("Request accepted! Redirecting to game...");
                    await refetch();
                    setPendingCount(0);
                    navigate(`/game/${req.id}`);
                  }}
                >
                  ✅ Accept
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    border: `2px solid ${colors.redAccent[500]}`,
                    color: colors.redAccent[500],
                    fontWeight: "bold",
                    px: 3,
                    py: 1,
                    borderRadius: "12px",
                    textTransform: "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: colors.redAccent[500],
                      color: "#fff",
                      borderColor: colors.redAccent[500],
                    },
                  }}
                  onClick={async () => {
                    await rejectGameRequest({ variables: { gameId: req.id } });
                    alert("Request rejected!");
                    await refetch();
                    setPendingCount(0);
                  }}
                >
                  ❌ Reject
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default Notifications;
