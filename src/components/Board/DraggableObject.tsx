import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { BoardObject } from "../../types/BoardObject";
import { useBoard } from "../../Context/BoardContext";
import BoardObjectRenderer from "./BoardObjectRenderer";
import SelectionHandles from "./SelectionHandles";

interface Props {
  object: BoardObject;
}

export default function DraggableObject({
  object,
}: Props) {
  const {
    selectedObjectId,
    selectObject,
  } = useBoard();

  const {
  attributes,
  listeners,
  setNodeRef,
  transform,
  isDragging,
} = useDraggable({
  id: object.id,

  disabled: object.locked,
});

  // اندازه هر آبجکت
  const size =
    object.type === "player" ||
    object.type === "goalkeeper"
      ? 60
      : object.type === "ball"
      ? 42
      : 70;

  const style: React.CSSProperties = {
    position: "absolute",
    left: object.x,
    top: object.y,
    pointerEvents: "auto",
    transform: CSS.Translate.toString(transform),
    cursor: isDragging ? "grabbing" : "grab",
    touchAction: "none",
    zIndex: isDragging ? 1000 : 1,
    transition: "none",
  };

  const isSelected =
    selectedObjectId === object.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        selectObject(object.id);
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",

          borderRadius:
            object.type === "player" ||
            object.type === "goalkeeper"
              ? "50%"
              : 0,

          border: isSelected
            ? "2px solid #F6EA3B"
            : "2px solid transparent",

          boxShadow: isSelected
            ? "0 0 12px rgba(59,130,246,.6)"
            : "none",
        }}
      >
        <BoardObjectRenderer object={object} />

        {isSelected && (
          <SelectionHandles object={object} />
        )}
      </div>
    </div>
  );
}