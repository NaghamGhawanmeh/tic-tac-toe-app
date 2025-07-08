import React, { useState } from "react";
import { useMutation, useLazyQuery, gql } from "@apollo/client";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const REGISTER_USER = gql`
  mutation RegisterUser($username: String!) {
    registerUser(username: $username) {
      id
      username
      status
      score
    }
  }
`;

const GET_USER_BY_USERNAME = gql`
  query GetUserByUsername($username: String!) {
    getUserByUsername(username: $username) {
      id
      username
      status
      score
    }
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

const Register = () => {
  const [username, setUsername] = useState("");
  const [registerUser] = useMutation(REGISTER_USER);
  const [getUserByUsername] = useLazyQuery(GET_USER_BY_USERNAME);
  const [updateUserStatus] = useMutation(UPDATE_STATUS);
  const navigate = useNavigate();

  const handleRegisterOrLogin = async () => {
    try {
      // تحقق إذا المستخدم موجود
      const { data } = await getUserByUsername({ variables: { username } });

      if (data.getUserByUsername) {
        // إذا موجود → سجل دخول وحدث حالته
        console.log("User exists, logging in:", data.getUserByUsername);

        await updateUserStatus({
          variables: {
            userId: data.getUserByUsername.id,
            status: "online",
          },
        });

        localStorage.setItem(
          "currentUser",
          JSON.stringify(data.getUserByUsername)
        );
        navigate("/players");
      } else {
        // إذا مش موجود → سجل كمستخدم جديد
        const res = await registerUser({ variables: { username } });
        console.log("Registered User:", res.data.registerUser);

        localStorage.setItem(
          "currentUser",
          JSON.stringify(res.data.registerUser)
        );
        navigate("/players");
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
      <Typography variant="h4" mb={2}>
        Register / Login
      </Typography>
      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleRegisterOrLogin}>
        Continue
      </Button>
    </Box>
  );
};

export default Register;
