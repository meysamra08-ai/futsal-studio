
import { useUI } from "../../Context/UIContext";
import { useBoard } from "../../Context/BoardContext";
import ModeToolbar from "../Common/ModeToolbar";
import SelectionTools from "../Common/SelectionTools";


const items = [
  { type: "cone", icon: "🔺", name: "Cone" },
  { type: "pole", icon: "🟨", name: "Pole" },
  { type: "ring", icon: "⭕", name: "Ring" },
  { type: "ladder", icon: "🪜", name: "Ladder" },
  { type: "dummy", icon: "🚧", name: "Dummy" },
  { type: "miniGoal", icon: "🥅", name: "Mini Goal" },
  { type: "target", icon: "🎯", name: "Target" },
  { type: "wall", icon: "🧱", name: "Wall" },
  { type: "ball", icon: "⚽", name: "Ball" },
  { type: "discCone", icon: "🟠", name: "Disc Cone" },
  { type: "hurdle", icon: "🚧", name: "Hurdle" },
  { type: "medicineBall", icon: "🏐", name: "Medicine Ball" },
  { type: "dumbbell", icon: "🏋️", name: "Dumbbell" },
  { type: "bib", icon: "🦺", name: "Bib" },
  { type: "marker", icon: "📍", name: "Marker" },
  { type: "flag", icon: "🚩", name: "Flag" },
  { type: "stopwatch", icon: "⏱️", name: "Stopwatch" },
  { type: "whistle", icon: "📯", name: "Whistle" },
];

export default function EquipmentPanel() {
  const {
  activeTool,
  setActiveTool,
} = useUI();

 
const {
  resetEquipment,
} = useBoard();

  return (
    <div
      style={{
        height: "100%",
        padding: 16,
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
  style={{
    display: "flex",
    gap: 8,
    marginBottom: 12,
  }}
>
  
  <ModeToolbar
  onReset={resetEquipment}
/>

</div>
      
      {/* Equipment */}

      <h3 style={{ marginBottom: 10 }}>Equipment</h3>

      <div
        style={{
          background: "#243240",
          borderRadius: 12,
          padding: 10,

          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gridAutoRows: "58px",
          gap: 8,

          height: 430, // حدود 7 ردیف
          overflowY: "auto",

          marginBottom: 20,
        }}
      >
        {items.map((item) => (
          <button
            key={item.type}
           onClick={() =>
           setActiveTool(
    activeTool === item.type
      ? null
      : (item.type as any)
  )
}


            style={{
              borderRadius: 8,

              border:
                activeTool === item.type
                  ? "2px solid #22C55E"
                  : "2px solid transparent",

              background:
                activeTool === item.type
                  ? "#35506A"
                  : "#2A3948",

              color: "white",

              cursor: "pointer",

              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",

              gap: 2,
            }}
          >
            <span style={{ fontSize: 20 }}>
              {item.icon}
            </span>

            <span
              style={{
                fontSize: 10,
              }}
            >
              {item.name}
            </span>
          </button>
        ))}
      </div>


<SelectionTools
showRotate
showScale
showLock
 />

    </div>
  );
}
