import { useBoard } from "../../core/contexts/BoardContext";
import { useUI } from "../../core/contexts/UIContext";
import futsalCourt from "../../assest/courts/futsal.png";

import {
  DndContext,
  type DragEndEvent,
} from "@dnd-kit/core";

import DraggableObject from "../Board/DraggableObject";


export default function CourtCanvas() {

  
const {
  activeTool,
  
  mode,

} = useUI();;

 console.log("activeTool:", activeTool);
 
  const {
    objects,
    addObject,
    moveObject,
  } = useBoard();

<div
  style={{
    position: "absolute",
    top: 12,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 2000,

    display: "flex",
    gap: 8,

    background: "#243240",
    padding: "8px 12px",
    borderRadius: 12,
  }}
>
  
</div>


  return (
    <DndContext
      onDragEnd={(event: DragEndEvent) => {
        const { active, delta } = event;

        const obj = objects.find(
          (o) => o.id === active.id
        );

        if (!obj) return;

        moveObject(
          obj.id,
          obj.x + delta.x,
          obj.y + delta.y
        );
      }}
    >
      <div
       style={{
  width: "100%",
  height: "100%",
  position: "relative",
  overflow: "hidden",
  background: "#00A0E3",
  
}}
        
        onClick={(e) => {
          if (mode !== "add") return;

if (!activeTool) return;

          
          const rect =
            e.currentTarget.getBoundingClientRect();

          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
         
         addObject(activeTool as any, x, y);
        }}
      >
        <div
  style={{
    position: "absolute",
    top: 10,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: 8,
    zIndex: 1000,
  }}
>
  

</div>
        <img
  src={futsalCourt}
          alt="Futsal Court"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            userSelect: "none",
            pointerEvents: "none",

          }}
        />

        {objects.map((obj) => (
          <DraggableObject
            key={obj.id}
            object={obj}
          />
        ))}
      </div>

      
    </DndContext>
  );
}