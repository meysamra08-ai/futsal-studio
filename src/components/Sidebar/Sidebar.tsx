import { useUI } from "../../Context/UIContext";


const items = [
  { id: "court", icon: "⚽️", label: "Court" },
  { id: "players", icon: "👤", label: "Players" },
  { id: "ball", icon: "⚽️", label: "Ball" },
  { id: "equipment", icon: "🧱", label: "Equipment" },
  { id: "draw", icon: "✏️", label: "Draw" },
  { id: "animation", icon: "🎬", label: "Animation" },
  { id: "GYM", icon: "🎬", label: "GYM" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export default function Sidebar() {
  const { activePanel, setActivePanel } = useUI();

  return (
    <div
      style={{
        width: 72,
        height: "100%",
        background: "#1E2732",
        borderRight: "1px solid #344250",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 16,
        gap: 12,
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          title={item.label}
         onClick={() => setActivePanel(item.id as any)}
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            fontSize: 24,
            transition: ".2s",
            background:
              activePanel === item.id
                ? "#2F80ED"
                : "transparent",
            color: "white",
          }}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}