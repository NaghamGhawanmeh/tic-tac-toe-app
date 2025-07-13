import React, { createContext, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";
import { BrowserRouter } from "react-router-dom";

// ✅ هي هون مباشرة
export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [pendingCount, setPendingCount] = useState(0);

  return (
    <NotificationContext.Provider value={{ pendingCount, setPendingCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <NotificationProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NotificationProvider>
    </ApolloProvider>
  </React.StrictMode>
);
