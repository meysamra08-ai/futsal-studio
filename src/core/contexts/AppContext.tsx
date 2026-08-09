import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { SportId } from "../types/sport";
import type { ModeId } from "../types/mode";
import type { License } from "../types/license";

interface AppContextValue {
  currentSport: SportId | null;
  currentMode: ModeId | null;
  license: License;

  setCurrentSport: (sport: SportId | null) => void;
  setCurrentMode: (mode: ModeId | null) => void;
}

const defaultLicense: License = {
  plan: "ULTIMATE",
  sports: [
    "football",
    "futsal",
    "basketball",
    "volleyball",
    "handball",
    "hockey",
  ],
  features: [
    "match-coach",
    "training-designer",
    "session-planner",
    "animation",
    "pdf",
    "export",
  ],
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentSport, setCurrentSport] = useState<SportId | null>(null);
  const [currentMode, setCurrentMode] = useState<ModeId | null>(null);

  const value = useMemo(
    () => ({
      currentSport,
      currentMode,
      license: defaultLicense,
      setCurrentSport,
      setCurrentMode,
    }),
    [currentSport, currentMode]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return context;
}