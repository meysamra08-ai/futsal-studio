import { useState } from "react";

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
  } = useUI();

  const {
    objects,
    addObject,
    moveObject,
  } = useBoard();

  const [courtRatio, setCourtRatio] = useState(16 / 9);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    const obj = objects.find(
      (item) => item.id === active.id
    );

    if (!obj) return;

    moveObject(
      obj.id,
      obj.x + delta.x,
      obj.y + delta.y
    );
  };

  const handleCourtClick = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (mode !== "add") return;

    if (!activeTool) return;

    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      event.clientX - rect.left;

    const y =
      event.clientY - rect.top;

    addObject(
      activeTool as any,
      x,
      y
    );
  };

  return (
    <DndContext
      onDragEnd={handleDragEnd}
    >
      <div
        style={{
          width: "100%",
          height: "100%",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",

          position: "relative",

          overflow: "hidden",

          background: "#202A35",

          padding: 12,
        }}
      >

        {/* =========================
            COURT SURFACE
        ========================= */}

        <div
          onClick={handleCourtClick}
          style={{
            position: "relative",

            width: `min(100%, calc((100dvh - 100px) * ${courtRatio}))`,

            aspectRatio: `${courtRatio}`,

            maxHeight: "100%",

            background: "#00A0E3",

            overflow: "hidden",

            borderRadius: 4,

            boxShadow:
              "0 12px 40px rgba(0, 0, 0, 0.35)",
          }}
        >

          {/* Court image */}

          <img
            src={futsalCourt}
            alt="Futsal Court"
            draggable={false}
            onLoad={(event) => {
              const image =
                event.currentTarget;

              if (
                image.naturalWidth > 0 &&
                image.naturalHeight > 0
              ) {
                setCourtRatio(
                  image.naturalWidth /
                    image.naturalHeight
                );
              }
            }}
            style={{
              position: "absolute",

              inset: 0,

              width: "100%",
              height: "100%",

              objectFit: "fill",

              userSelect: "none",

              pointerEvents: "none",
            }}
          />

          {/* =========================
              BOARD OBJECTS
          ========================= */}

          {objects.map((obj) => (
            <DraggableObject
              key={obj.id}
              object={obj}
            />
          ))}

        </div>
      </div>
    </DndContext>
  );
}