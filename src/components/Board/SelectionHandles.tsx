import { Trash2 } from "lucide-react";
import { useBoard } from "../../core/contexts/BoardContext";
import type { BoardObject } from "../../core/types/BoardObject";

interface Props {
  object: BoardObject;
}

export default function SelectionHandles({
 
}: Props) {
  const {
    
    deleteSelected,
   
  } = useBoard();

  const buttonStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "2px solid white",
    background: "#2C2C2C",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    position: "absolute",
    transition: ".15s",
  };

  return (
    <>
      

      {/* Delete */}
      <div
        style={{
          ...buttonStyle,
          right: -34,
          bottom: -10,
          background: "#C62828",
        }}
        onClick={(e) => {
          e.stopPropagation();
          deleteSelected();
        }}
      >
        <Trash2 size={15} />
      </div>
    </>
  );
}