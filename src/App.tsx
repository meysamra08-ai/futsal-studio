import { useEffect, useState } from "react";

import Login from "./pages/Login/Login";
import SportSelector from "./pages/SportSelector/SportSelector";
import Workspace from "./pages/Workspace/Workspace";

type Page = "login" | "sport" | "workspace";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("login");

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;

      if (path === "/sport") {
        setLoggedIn(true);
        setCurrentPage("sport");
      } else if (path === "/workspace") {
        setLoggedIn(true);
        setCurrentPage("workspace");
      } else {
        setLoggedIn(false);
        setCurrentPage("login");
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);

    const path =
      page === "login"
        ? "/"
        : page === "sport"
        ? "/sport"
        : "/workspace";

    window.history.pushState(
      { page },
      "",
      path
    );
  };

  const handleLogin = () => {
    setLoggedIn(true);
    navigateTo("sport");
  };

  const handleBack = () => {
    if (currentPage === "sport") {
      setLoggedIn(false);
      navigateTo("login");
    }
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
        onSportSelected={() =>
          navigateTo("workspace")
        }
        onBack={handleBack}
      />
    );
  }

  return (
    <Workspace
      onHome={() => navigateTo("sport")}
    />
  );
}