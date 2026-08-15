import { useEffect, useState } from "react";

import SplashScreen from "./pages/SplashScreen/SplashScreen";
import Login from "./pages/Login/Login";
import SportSelector from "./pages/SportSelector/SportSelector";
import Workspace from "./pages/Workspace/Workspace";

type Page = "login" | "sport" | "workspace";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("login");

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);


    
    return () => clearTimeout(timer);
  }, []);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const handleLogin = () => {
    setLoggedIn(true);
    navigateTo("sport");
  };

  const handleBack = () => {
    setLoggedIn(false);
    navigateTo("login");
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!loggedIn || currentPage === "login") {
    return <Login onLogin={handleLogin} />;
  }

  if (currentPage === "sport") {
    return (
      <SportSelector
        onBack={handleBack}
        onSportSelected={() => navigateTo("workspace")}
      />
    );
  }

  return <Workspace onHome={() => navigateTo("sport")} />;
}