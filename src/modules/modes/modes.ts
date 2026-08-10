import type { CoachMode } from "../../core/types/mode";

export const COACH_MODES: CoachMode[] = [
  {
    id: "match-coach",
    title: "Match Coach",
    description: "Coaching and tactical communication during matches.",
    icon: "⚽",
  },
  {
    id: "training-designer",
    title: "Training Designer",
    description: "Design drills, exercises and training sessions.",
    icon: "🏋️",
  },
  {
    id: "session-planner",
    title: "Session Planner",
    description: "Plan the complete training session.",
    icon: "📋",
  },
];