export type ModeId =
  | "match-coach"
  | "training-designer"
  | "session-planner";

export interface CoachMode {
  id: ModeId;
  title: string;
  description: string;
  icon: string;
}