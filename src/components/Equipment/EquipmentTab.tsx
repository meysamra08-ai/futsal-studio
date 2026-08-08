import { useUI } from "../../Context/UIContext";
import Cone from "./Cone";
import { Theme } from "../../theme/theme";



export default function EquipmentTab() {
  const {
  activeTool,
  setActiveTool,
} = useUI();

  function itemStyle(active: boolean): React.CSSProperties {
    return {
      cursor: "pointer",
      padding: "10px 12px",
      borderRadius: 8,
      marginBottom: 8,
      background: active
        ? Theme.colors.primary
        : "transparent",
      color: Theme.colors.text,
      transition: "0.2s",
    };
  }

  return (
    <div>
      <h3
        style={{
          color: Theme.colors.text,
          fontSize: Theme.font.subtitle,
          marginBottom: Theme.spacing.md,
        }}
      >
        Equipment
      </h3>

      <div
        style={itemStyle(activeTool === "cone")}
        onClick={() => setActiveTool("cone")}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Cone />
          <span>Cone</span>
        </div>
      </div>

      <div
        style={itemStyle(activeTool === "ladder")}
        onClick={() => setActiveTool("ladder")}
      >
        🪜 Ladder
      </div>

      <div
        style={itemStyle(activeTool === "goal")}
        onClick={() => setActiveTool("goal")}
      >
        🥅 Goal
      </div>

      <div
        style={itemStyle(activeTool === "dumbbell")}
        onClick={() =>
          setActiveTool("dumbbell")
        }
      >
        🏋 Dumbbell
      </div>
    </div>
    
  );

}
