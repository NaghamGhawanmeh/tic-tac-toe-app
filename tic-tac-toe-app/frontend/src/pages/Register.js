import { useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";

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

const AuthPage = ({ setToken }) => {
  const [mode, setMode] = useState("login");
  const [login] = useMutation(LOGIN_MUTATION);
  const [signup] = useMutation(SIGNUP_MUTATION);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleModeChange = (_, newMode) => {
    if (newMode) {
      setMode(newMode);
      setServerError("");
      setSuccessMessage("");
    }
  };

  return (
    <Box
      sx={{
        // background: `linear-gradient(135deg, ${colors.primary[700]}, ${colors.blueAccent[800]})`,
        // minHeight: "50vh",
        py: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: 6,
            backgroundColor: theme.palette.background.paper,
            px: 3,
            py: 4,
          }}
        >
          <CardContent>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              fullWidth
              sx={{
                mb: 3,
                "& .MuiToggleButton-root": {
                  border: "none",
                  flex: 1,
                  py: 1.5,
                  color: colors.grey[700],
                  fontWeight: "bold",
                  transition: "all 0.3s ease",
                  "&.Mui-selected": {
                    color: "#fff",
                    backgroundColor: colors.blueAccent[500],
                  },
                  "&:hover": {
                    backgroundColor: colors.blueAccent[400],
                    color: "#fff",
                  },
                },
              }}
            >
              <ToggleButton value="login">Login</ToggleButton>
              <ToggleButton value="register">Register</ToggleButton>
            </ToggleButtonGroup>

            <Typography
              variant="h5"
              align="center"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              {mode === "login"
                ? "Login to Your Account"
                : "Create a New Account"}
            </Typography>

            <Formik
              initialValues={{ userName: "", email: "", password: "" }}
              validationSchema={mode === "login" ? LoginSchema : RegisterSchema}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
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
                    setToken(token);
                    navigate("/players");
                  } else {
                    await signup({ variables: values });
                    setSuccessMessage(
                      "Registered successfully! You can now log in."
                    );
                    setMode("login");
                    resetForm();
                  }
                  setServerError("");
                } catch (err) {
                  console.error(err);
                  let msg = "An error occurred. Please try again.";
                  if (err.graphQLErrors && err.graphQLErrors.length > 0) {
                    msg = err.graphQLErrors[0].message;
                  } else if (err.message) {
                    msg = err.message;
                  }
                  setServerError(msg);
                  setSuccessMessage("");
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

                  {serverError && (
                    <Typography
                      sx={{
                        mt: 2,
                        fontWeight: "bold",
                        color: colors.redAccent[500],
                        textAlign: "center",
                      }}
                    >
                      {serverError}
                    </Typography>
                  )}

                  {successMessage && (
                    <Typography
                      sx={{
                        mt: 2,
                        fontWeight: "bold",
                        color: colors.greenAccent[500],
                        textAlign: "center",
                      }}
                    >
                      {successMessage}
                    </Typography>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      mt: 3,
                      py: 1.5,
                      background: `${colors.blueAccent[600]}`,
                      fontWeight: "bold",
                      color: "#fff",
                      ":hover": {
                        background: `linear-gradient(${colors.greenAccent[400]},${colors.greenAccent[600]}, ${colors.greenAccent[800]})`,
                      },
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} sx={{ color: "#fff" }} />
                    ) : mode === "login" ? (
                      "Login"
                    ) : (
                      "Register"
                    )}
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
