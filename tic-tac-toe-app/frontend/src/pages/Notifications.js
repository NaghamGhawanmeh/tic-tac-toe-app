import React from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const GET_PENDING_REQUESTS = gql`
  query GetPendingRequests($userId: ID!) {
    getPendingRequests(userId: $userId) {
      id
      playerX {
        id
        username
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
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const currentUserId = currentUser?.id;

  // ✅ جميع الـ Hooks في الأعلى
  const { data, loading, error } = useQuery(GET_PENDING_REQUESTS, {
    variables: { userId: currentUserId },
    pollInterval: 5000,
    skip: !currentUserId, // ✅ إذا ما في userId ما يعمل query
  });

  const [acceptGameRequest] = useMutation(ACCEPT_REQUEST);
  const [rejectGameRequest] = useMutation(REJECT_REQUEST);

  // ✅ شرط التحقق داخل الـ render وليس قبل hooks
  if (!currentUserId) {
    return (
      <Typography variant="h6" mt={4}>
        Please log in first.
      </Typography>
    );
  }

  if (loading) return <CircularProgress />;
  if (error) return <Typography>Error: {error.message}</Typography>;

  return (
    <Box m={4}>
      <Typography variant="h4" mb={2}>
        Game Requests
      </Typography>
      <List>
        {data?.getPendingRequests?.length === 0 ? (
          <Typography>No requests found.</Typography>
        ) : (
          data?.getPendingRequests?.map((req) => (
            <ListItem key={req.id}>
              <ListItemText
                primary={`Request from: ${req.playerX.username}`}
                secondary={`Status: ${req.status}`}
              />
              <Button
                variant="contained"
                color="success"
                onClick={async () => {
                  await acceptGameRequest({ variables: { gameId: req.id } });
                  alert("Request accepted! Redirecting to game...");
                  navigate(`/game/${req.id}`);
                }}
                sx={{ mr: 1 }}
              >
                Accept
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={async () => {
                  await rejectGameRequest({ variables: { gameId: req.id } });
                  alert("Request rejected!");
                }}
              >
                Reject
              </Button>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default Notifications;
