
import CenterCircle from "./CenterCircle";
import PenaltyAreas from "./PenaltyAreas";
import Goals from "./Goals";

export default function Pitch() {
  return (
    <svg
      viewBox="0 0 1000 680"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
    
      <CenterCircle />
      <PenaltyAreas />
      <Goals />
    </svg>
  );
}