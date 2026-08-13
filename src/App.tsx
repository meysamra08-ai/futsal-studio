import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";

import Login from "./pages/Login/Login";
import SportSelector from "./pages/SportSelector/SportSelector";
import Workspace from "./pages/Workspace/Workspace";

type Page = "login" | "sport" | "workspace";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("login");

  const isAndroidApp =
    Capacitor.getPlatform() === "android";

  useEffect(() => {
    if (isAndroidApp) {
      document.documentElement.classList.add("android-app");
      document.body.classList.add("android-app");
    } else {
      document.documentElement.classList.remove("android-app");
      document.body.classList.remove("android-app");
    }

    return () => {
      document.documentElement.classList.remove("android-app");
      document.body.classList.remove("android-app");
    };
  }, [isAndroidApp]);

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

  /* =========================
     LOGIN
     ========================= */

  if (!loggedIn || currentPage === "login") {
    return (
      <div
        className={
          isAndroidApp
            ? "app-page android-app"
            : "app-page"
        }
      >
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  /* =========================
     SPORT SELECTOR
     ========================= */

  if (currentPage === "sport") {
    return (
      <div
        className={
          isAndroidApp
            ? "app-page android-app"
            : "app-page"
        }
      >
        <SportSelector
          onBack={handleBack}
          onSportSelected={() =>
            navigateTo("workspace")
          }
        />
      </div>
    );
  }

  /* =========================
     WORKSPACE
     ========================= */

  return (
    <div
      className={
        isAndroidApp
          ? "app-page android-app"
          : "app-page"
      }
    >
      <Workspace
        onHome={() =>
          navigateTo("sport")
        }
      />
    </div>
  );
}