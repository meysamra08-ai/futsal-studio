import { useUI } from "../../core/contexts/UIContext";
import { useTeam } from "../../core/contexts/TeamContext";
import Ball from "./Ball";
import { Theme } from "../../shared/theme/theme";




export default function PlayersTab() {
  const { activeTool, setActiveTool } = useUI();

  const { currentTeam, toggleTeam } = useTeam();

  const itemStyle = (
    active: boolean
  ): React.CSSProperties => ({
    cursor: "pointer",
    padding: "10px 12px",
    borderRadius: 8,
    marginBottom: 8,

    background: active
      ? Theme.colors.primary
      : "transparent",

    color: Theme.colors.text,

    transition: "0.2s",
  });

  

  return (
    <div>

      {/* Team */}

      <button
        onClick={toggleTeam}
        style={{
          width: "100%",
          marginBottom: 15,
          padding: 10,
          border: "none",
          borderRadius: 8,
          cursor: "pointer",

          background:
            currentTeam === "blue"
              ? "#1E88E5"
              : "#E53935",

          color: "white",
          fontWeight: "bold",
        }}
      >
        {currentTeam === "blue"
          ? "🔵 Blue Team"
          : "🔴 Red Team"}
      </button>

      {/* Player */}

      <div
        style={itemStyle(
          activeTool === "player"
        )}
        onClick={() =>
  setActiveTool(
    activeTool === "player"
      ? null
      : "player"
  )
}
      >
        👤 Player
      </div>

      {/* Goalkeeper */}

      <div
        style={itemStyle(
          activeTool ===
            "goalkeeper"
        )}
        onClick={() =>
  setActiveTool(
    activeTool === "goalkeeper"
      ? null
      : "goalkeeper"
  )
}
      >
        🥅 Goalkeeper
      </div>

      {/* Ball */}

      <div
        style={itemStyle(
          activeTool === "ball"
        )}
        onClick={() =>
          setActiveTool("ball")
        }
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Ball />
          <span>Ball</span>
        </div>
      </div>
    </div>
  );
}