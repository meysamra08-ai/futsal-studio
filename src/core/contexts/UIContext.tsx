import {
  createContext,
  useContext,
  useState,
} from "react";

export type Panel =
  | "court"
  | "players"
  | "equipment"
  | "draw"
  | "animation"
  | "settings"
  | "ball";

export type DrawingTool =
  | "line"
  | "arrow"
  | "dashedLine"
  | "dashedArrow"
  | "curve"
  | "curveArrow";

export type LineColor =
  | "#FFFFFF"
  | "#FFD21F"
  | "#EF233C"
  | "#22C55E"
  | "#2563EB";

export type LineWidth =
  | 2
  | 4
  | 7;

interface UIContextType {
  activePanel: Panel;

  setActivePanel: React.Dispatch<
    React.SetStateAction<Panel>
  >;

  activeTool: string | null;

  setActiveTool: React.Dispatch<
    React.SetStateAction<string | null>
  >;

  mode: "add" | "select";

  setMode: React.Dispatch<
    React.SetStateAction<"add" | "select">
  >;

  /* ==========================================
     Drawing
     ========================================== */

  drawingTool: DrawingTool;

  setDrawingTool: React.Dispatch<
    React.SetStateAction<DrawingTool>
  >;

  lineColor: LineColor;

  setLineColor: React.Dispatch<
    React.SetStateAction<LineColor>
  >;

  lineWidth: LineWidth;

  setLineWidth: React.Dispatch<
    React.SetStateAction<LineWidth>
  >;

  lineOpacity: number;

  setLineOpacity: React.Dispatch<
    React.SetStateAction<number>
  >;

  drawingLocked: boolean;

  setDrawingLocked: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}

const UIContext =
  createContext<UIContextType | null>(null);

export function UIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [
    activePanel,
    setActivePanel,
  ] = useState<Panel>("court");

  const [
    activeTool,
    setActiveTool,
  ] = useState<string | null>(null);

  const [
    mode,
    setMode,
  ] = useState<"add" | "select">("add");

  /* ==========================================
     Drawing State
     ========================================== */

  const [
    drawingTool,
    setDrawingTool,
  ] = useState<DrawingTool>("line");

  const [
    lineColor,
    setLineColor,
  ] = useState<LineColor>("#FFFFFF");

  const [
    lineWidth,
    setLineWidth,
  ] = useState<LineWidth>(4);

  const [
    lineOpacity,
    setLineOpacity,
  ] = useState<number>(100);

  const [
    drawingLocked,
    setDrawingLocked,
  ] = useState<boolean>(false);

  return (
    <UIContext.Provider
      value={{
        activePanel,
        setActivePanel,

        activeTool,
        setActiveTool,

        mode,
        setMode,

        drawingTool,
        setDrawingTool,

        lineColor,
        setLineColor,

        lineWidth,
        setLineWidth,

        lineOpacity,
        setLineOpacity,

        drawingLocked,
        setDrawingLocked,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);

  if (!ctx) {
    throw new Error(
      "UIContext missing"
    );
  }

  return ctx;
}