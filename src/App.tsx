import { useState } from "react";

import Login from "./pages/Login/Login";
import SportSelector from "./pages/SportSelector/SportSelector";
import Workspace from "./pages/Workspace/Workspace";

type AppPage =
  | "login"
  | "sport"
  | "workspace";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const [currentPage, setCurrentPage] =
    useState<AppPage>("login");

  const handleLogin = () => {
    setLoggedIn(true);
    setCurrentPage("sport");
  };

  if (!loggedIn || currentPage === "login") {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  if (currentPage === "sport") {
    return (
      <SportSelector
        onSportSelected={() => {
          setCurrentPage("workspace");
        }}
      />
    );
  }

  return <Workspace />;
}