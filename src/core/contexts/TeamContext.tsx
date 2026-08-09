import {
  createContext,
  useContext,
  useState,
} from "react";
import type { ReactNode } from "react";



export type TeamColor =
  | "blue"
  | "red"
  | "custom";


type TeamContextType = {
  currentTeam: TeamColor;


  setCurrentTeam: (
    team: TeamColor
  ) => void;

  
  toggleTeam: () => void;

  customColor: string;

setCustomColor: (
  color: string
) => void;
  
};


const TeamContext =
  createContext<TeamContextType>({
    currentTeam: "blue",

    setCurrentTeam: () => {},

    customColor: "#22C55E",

    setCustomColor: () => {},

    toggleTeam: () => {},
  });
export function TeamProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentTeam, setCurrentTeam] =
    useState<TeamColor>("blue");

    const [customColor, setCustomColor] =
  useState("#22C55E");

 function toggleTeam() {
  if (currentTeam === "blue") {
    setCurrentTeam("red");
  } else if (currentTeam === "red") {
    setCurrentTeam("custom");
  } else {
    setCurrentTeam("blue");
  }
}

  return (
    <TeamContext.Provider

     value={{
  currentTeam,
  setCurrentTeam,

  customColor,
  setCustomColor,

  toggleTeam,
}}

    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  return useContext(TeamContext);
}