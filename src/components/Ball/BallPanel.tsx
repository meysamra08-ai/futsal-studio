import { useUI } from "../../Context/UIContext";
import ModeToolbar from "../Common/ModeToolbar";
import { useBoard } from "../../Context/BoardContext";
import SelectionTools from "../Common/SelectionTools";


export default function BallPanel() {
  const { activeTool, setActiveTool } = useUI();

  const {
  resetBalls,
} = useBoard();

  return (
    <div
      style={{
        padding: 16,
        color: "white",
      }}
    >
      
     <ModeToolbar
  onReset={resetBalls}
/>

      <h3>Ball</h3>

      <button
        onClick={() =>
          setActiveTool(
            activeTool === "ball" ? null : "ball"
          )
        }
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          background:
            activeTool === "ball"
              ? "#22C55E"
              : "#2A3948",
          color: "white",
          fontSize: 16,
        }}
      >
        ⚽ Ball
      </button>

      <SelectionTools
      showRotate={false}
      showScale
      showLock
       />
      
    </div>


  );
}