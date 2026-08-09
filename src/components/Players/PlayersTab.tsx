import { useUI } from "../../core/contexts/UIContext";
import { useTeam } from "../../core/contexts/TeamContext";
import { useBoard } from "../../core/contexts/BoardContext";
import { Theme } from "../../shared/theme/theme";

import ModeToolbar from "../../shared/components/ModeToolbar";
import SelectionTools from "../../shared/components/SelectionTools";

export default function PlayersTab() {
  const { activeTool, setActiveTool } = useUI();

  const {
    currentTeam,
    setCurrentTeam,
    customColor,
    setCustomColor,
  } = useTeam();

  const { resetPlayers } = useBoard();

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

    transition: ".2s",
  });

  return (
    <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 16,
  }}
>
      {/* Mode */}

      <ModeToolbar
        onReset={resetPlayers}
      />

      {/* Teams */}

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <button
          onClick={() =>
            setCurrentTeam("blue")
          }
          style={teamButton(
            currentTeam === "blue",
            "#1E88E5"
          )}
        >
          🔵
        </button>

        <button
          onClick={() =>
            setCurrentTeam("red")
          }
          style={teamButton(
            currentTeam === "red",
            "#E53935"
          )}
        >
          🔴
        </button>

        <button
          onClick={() =>
            setCurrentTeam("custom")
          }
          style={teamButton(
            currentTeam === "custom",
            customColor
          )}
        >
          🟢
        </button>
      </div>

      {/* Team 3 Color */}

      {currentTeam === "custom" && (
        <input
          type="color"
          value={customColor}
          onChange={(e) =>
            setCustomColor(
              e.target.value
            )
          }
          style={{
            width: "100%",
            height: 42,
            marginBottom: 15,
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        />
      )}

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
            activeTool ===
              "goalkeeper"
              ? null
              : "goalkeeper"
          )
        }
      >
        🥅 Goalkeeper
      </div>

      {/* Tools */}

      <SelectionTools
      showRotate={false}
      showScale={false}
      showLock
      
    />


    </div>
  );
}

function teamButton(
  active: boolean,
  color: string
): React.CSSProperties {
  return {
    flex: 1,

    height: 42,

    borderRadius: 8,

    border: active
      ? "2px solid white"
      : "2px solid transparent",

    background: color,

    cursor: "pointer",

    color: "white",

    fontSize: 20,

    transition: ".2s",
  };
}