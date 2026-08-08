import { useState } from "react";
import { useBoard } from "../../Context/BoardContext";


interface Props {
  showRotate?: boolean;
  showScale?: boolean;
  showLock?: boolean;
}

export default function SelectionTools({
  showRotate = true,
  showScale = true,
  showLock = true,
}: Props) {
  
  const {
    rotateSelected,
    scaleSelected,
    toggleLock,
  } = useBoard();

  const [scale, setScale] = useState(100);

  return (
    <>
      <h3
  style={{
    marginBottom: 10,
    color: "#fff",
  }}
>
  Tools
</h3>

      <div
        style={{
          background: "#243240",
          borderRadius: 12,
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {/* Rotate */}
{showRotate && (
  <div>
    <div
      style={{
        marginBottom: 8,
        fontSize: 12,
        color: "#BBB",
      }}
    >
      Rotate
    </div>

    <div
      style={{
        display: "flex",
        gap: 8,
      }}
    >
      <button
        style={{
          ...toolButton,
          flex: 1,
        }}
        onClick={() => rotateSelected(-15)}
      >
        ↺
      </button>

      <button
        style={{
          ...toolButton,
          flex: 1,
        }}
        onClick={() => rotateSelected(15)}
      >
        ↻
      </button>
    </div>
  </div>
)}

        {/* Scale */}
{showScale && (
  <div>
    <div
      style={{
        marginBottom: 8,
        fontSize: 12,
        color: "#BBB",
      }}
    >
      Scale
    </div>

    <input
      type="range"
      min={50}
      max={200}
      value={scale}
      style={{
        width: "100%",
      }}
      onChange={(e) => {
        const value = Number(e.target.value);

        setScale(value);

        scaleSelected(value / 100);
      }}
    />
  </div>
)}

        {/* Lock */}

        {showLock && (
  <button
    style={toolButton}
    onClick={toggleLock}
  >
          🔒 Lock / Unlock
  </button>
)}
      </div>
    </>
  );
}

const toolButton: React.CSSProperties = {
  width: "100%",
  height: 42,

  border: "none",
  borderRadius: 8,

  background: "#2A3948",

  color: "white",

  cursor: "pointer",
};