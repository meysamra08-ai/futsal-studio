import { useEffect, useState } from "react";

import Login from "./pages/Login/Login";
import SportSelector from "./pages/SportSelector/SportSelector";
import Workspace from "./pages/Workspace/Workspace";

type AppPage = "login" | "sport" | "workspace";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] =
    useState<AppPage>("login");

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;

      if (path.endsWith("/workspace")) {
        setLoggedIn(true);
        setCurrentPage("workspace");
        return;
      }

      if (path.endsWith("/sport")) {
        setLoggedIn(true);
        setCurrentPage("sport");
        return;
      }

      setLoggedIn(false);
      setCurrentPage("login");
    };

    handlePopState();

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, []);

  const navigateTo = (page: AppPage) => {
    setCurrentPage(page);

    if (page === "login") {
      setLoggedIn(false);
    } else {
      setLoggedIn(true);
    }

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
      <div className="app-page">
        <button
          type="button"
          className="app-back-button"
          onClick={handleBack}
          aria-label="Back"
        >
          ←
        </button>

        <SportSelector
          onSportSelected={() =>
            navigateTo("workspace")
          }
        />
      </div>
    );
  }

 return (
  <div className="app-page">
    <Workspace
      onHome={() => navigateTo("sport")}
    />
  </div>
);
}