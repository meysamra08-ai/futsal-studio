import { createContext, useContext, useState } from "react";

export type Panel =
  | "court"
  | "players"
  | "equipment"
  | "draw"
  | "animation"
  | "settings"
  | "ball";

interface UIContextType {
  activePanel: Panel;
  setActivePanel: React.Dispatch<React.SetStateAction<Panel>>;

  
  activeTool: string | null;
  setActiveTool: React.Dispatch<
    React.SetStateAction<string | null>
  >;

  mode: "add" | "select";
setMode: React.Dispatch<
  React.SetStateAction<"add" | "select">
>;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activePanel, setActivePanel] =
    useState<Panel>("court");

  const [activeTool, setActiveTool] =
    useState<string | null>(null);
const [mode, setMode] =
  useState<"add" | "select">("add");

  return (
    <UIContext.Provider
      value={{
        activePanel,
        setActivePanel,

        activeTool,
        setActiveTool,

       mode,
        setMode,

      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);

  if (!ctx)
    throw new Error("UIContext missing");

  return ctx;
}