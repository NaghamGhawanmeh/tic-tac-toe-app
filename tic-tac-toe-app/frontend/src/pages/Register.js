import React, { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        userName
        email
        status
        score
      }
    }
  }
`;

const SIGNUP_MUTATION = gql`
  mutation Signup($userName: String!, $email: String!, $password: String!) {
    signup(userName: $userName, email: $email, password: $password) {
      id
      userName
      email
      status
      score
    }
  }
`;

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const RegisterSchema = Yup.object().shape({
  userName: Yup.string().required("Display name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [login] = useMutation(LOGIN_MUTATION);
  const [signup] = useMutation(SIGNUP_MUTATION);
  const navigate = useNavigate();

  const handleModeChange = (_, newMode) => {
    if (newMode) setMode(newMode);
  };

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh", py: 6 }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              fullWidth
              sx={{ mb: 3 }}
            >
              <ToggleButton value="login">Login</ToggleButton>
              <ToggleButton value="register">Register</ToggleButton>
            </ToggleButtonGroup>

            <Typography variant="h5" align="center" gutterBottom>
              {mode === "login"
                ? "Login to Your Account"
                : "Create a New Account"}
            </Typography>

            <Formik
              initialValues={{ userName: "", email: "", password: "" }}
              validationSchema={mode === "login" ? LoginSchema : RegisterSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  if (mode === "login") {
                    const res = await login({
                      variables: {
                        email: values.email,
                        password: values.password,
                      },
                    });
                    const { token, user } = res.data.login;
                    localStorage.setItem("token", token);
                    localStorage.setItem("currentUser", JSON.stringify(user));
                    alert("Logged in successfully!");
                    navigate("/players");
                  } else {
                    const res = await signup({ variables: values });
                    alert("Registered successfully! You can now log in.");
                    setMode("login");
                  }
                } catch (err) {
                  console.error(err);
                  alert(`${mode === "login" ? "Login" : "Register"} failed!`);
                }
                setSubmitting(false);
              }}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  {mode === "register" && (
                    <Field
                      as={TextField}
                      label="User Name"
                      name="userName"
                      fullWidth
                      margin="normal"
                      error={touched.userName && Boolean(errors.userName)}
                      helperText={touched.userName && errors.userName}
                    />
                  )}
                  <Field
                    as={TextField}
                    label="Email"
                    name="email"
                    fullWidth
                    margin="normal"
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                  <Field
                    as={TextField}
                    label="Password"
                    name="password"
                    type="password"
                    fullWidth
                    margin="normal"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      mt: 2,
                      backgroundColor: "#1976d2",
                      ":hover": { backgroundColor: "#1565c0" },
                    }}
                    disabled={isSubmitting}
                  >
                    {mode === "login" ? "Login" : "Register"}
                  </Button>
                </Form>
              )}
            </Formik>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AuthPage;
