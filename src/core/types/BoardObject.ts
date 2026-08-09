export type TeamColor =
  | "blue"
  | "red"
  | "custom";

export type ToolType =
  | null
  | "player"
  | "ball"
  | "goalkeeper"
  | "cone"
  | "pole"
  | "ring"
  | "ladder"
  | "dummy"
  | "miniGoal"
  | "target"
  | "wall"
;

export interface BoardObject {
  id: string;

  type: ToolType;

  x: number;
  y: number;

  rotation: number;

  scale?: number;

  locked?: boolean;

  zIndex?: number;

  selected?: boolean;

  number?: number;

  team?: TeamColor;

  teamColor?: string;

  name?: string;
  
}