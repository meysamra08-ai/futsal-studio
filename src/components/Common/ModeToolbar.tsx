import { useUI } from "../../Context/UIContext";

interface Props {
  onReset: () => void;
}

export default function ModeToolbar({
  onReset,
}: Props) {
  const { mode, setMode } = useUI();

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        marginBottom: 12,
      }}
    >
      <button
        style={button(mode === "select")}
        onClick={() => setMode("select")}
      >
        🖱 Select
      </button>

      <button
        style={button(mode === "add")}
        onClick={() => setMode("add")}
      >
        ➕ Add
      </button>

      <button
        style={button(false)}
        onClick={onReset}
      >
        🗑 Reset
      </button>
    </div>
  );
}

function button(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: 8,
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    background: active ? "#2F80ED" : "#2A3948",
    color: "#fff",
  };
}