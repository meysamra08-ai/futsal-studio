import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";

import { Capacitor } from "@capacitor/core";

import { useBoard } from "../../core/contexts/BoardContext";
import { useUI } from "../../core/contexts/UIContext";
import { useAnimation } from "../../core/contexts/AnimationContext";

import {
  DndContext,
  type DragEndEvent,
} from "@dnd-kit/core";

import DraggableObject from "../Board/DraggableObject";
import BoardObjectRenderer from "../Board/BoardObjectRenderer";

import "./CourtCanvas.css";
import type { BoardObject } from "../../core/types/BoardObject";

/* =========================================================
   Drawing Point
   ========================================================= */

type DrawingPoint = {
  x: number;
  y: number;
};


/* =========================================================
   Drawing
   ========================================================= */

type Drawing = {
  id: string;

  tool:
    | "line"
    | "arrow"
    | "dashedLine"
    | "dashedArrow"
    | "curve"
    | "curveArrow";

  points: DrawingPoint[];

  color: string;

  width: number;

  opacity: number;
};


function PlaybackObjectsLayer({
  objects,
}: {
  objects: BoardObject[];
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 35,
      }}
    >
      {objects.map((object) => {
        const size =
          object.type === "player" ||
          object.type === "goalkeeper"
            ? 60
            : object.type === "ball"
              ? 42
              : 70;

        return (
          <div
            key={`playback-${object.id}`}
            style={{
              position: "absolute",
              left: object.x ?? 0,
              top: object.y ?? 0,
              width: size,
              height: size,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              touchAction: "none",
            }}
          >
            <BoardObjectRenderer object={object} />
          </div>
        );
      })}
    </div>
  );
}


export default function CourtCanvas() {

  const {
    activeTool,
    mode,

    activePanel,

    drawingTool,
    lineColor,
    lineWidth,
    lineOpacity,
    drawingLocked,
  } = useUI();


  const {
    objects,
    addObject,
    moveObject,
    setObjects,
  } = useBoard();

  const {
    isPlaying,
    
    playbackEnded,
    
    keyframes,
    getInterpolatedObjects,
    editingSavedAnimationId,
  } = useAnimation();

  // Playback layer is shown only while the animation is playing.
  // This keeps the real Board visible and draggable in edit mode.
  const showPlayback =
    keyframes.length > 0 &&
    isPlaying;

  const playbackObjects =
    showPlayback
      ? getInterpolatedObjects(objects)
      : [];

  // وقتی پخش طبیعی به انتهای انیمیشن می‌رسد، آخرین keyframe را
  // روی Board واقعی اعمال می‌کنیم تا بلافاصله قابل ویرایش و Drag باشد.
  // این effect فقط با playbackEnded اجرا می‌شود؛ بنابراین Pause وسط انیمیشن
  // باعث پرش Board به فریم آخر نمی‌شود.
  useEffect(() => {
    if (isPlaying || !playbackEnded || keyframes.length === 0) {
      return;
    }

    const lastKeyframe =
      keyframes[keyframes.length - 1];

    if (!lastKeyframe) {
      return;
    }

    const positions = new Map(
      lastKeyframe.objects.map((item) => [
        item.id,
        { x: item.x, y: item.y },
      ])
    );

    setObjects((previousObjects) =>
      previousObjects.map((object) => {
        const position = positions.get(object.id);

        if (!position) {
          return { ...object, selected: false };
        }

        return {
          ...object,
          x:
            typeof position.x === "number"
              ? position.x
              : object.x,
          y:
            typeof position.y === "number"
              ? position.y
              : object.y,
          selected: false,
        };
      })
    );
  }, [
    isPlaying,
    playbackEnded,
    keyframes,
    setObjects,
  ]);


  /* =========================================================
     Android Detection
     ========================================================= */

  const isAndroid =
    Capacitor.getPlatform() === "android";


  /* =========================================================
     Court Ratio
     ========================================================= */

  const [
    courtRatio,
    setCourtRatio,
  ] = useState(16 / 9);


  /* =========================================================
     Drawing State
     فقط Web / Windows
     ========================================================= */

  const [
    drawings,
    setDrawings,
  ] = useState<Drawing[]>([]);


  const [
    drawingInProgress,
    setDrawingInProgress,
  ] = useState<Drawing | null>(null);


  const drawingPointerDown =
    useRef(false);


  /* =========================================================
     Drag Object
     ========================================================= */

  const handleDragEnd = (
    event: DragEndEvent
  ) => {

    const {
      active,
      delta,
    } = event;


    const obj =
      objects.find(
        (item) =>
          item.id === active.id
      );


    if (!obj) return;


    moveObject(
      obj.id,
      obj.x + delta.x,
      obj.y + delta.y
    );
  };


  /* =========================================================
     Court Click
     ========================================================= */

  const handleCourtClick = (
    event: MouseEvent<HTMLDivElement>
  ) => {

    /*
     * وقتی پنل خطوط فعال است،
     * کلیک روی زمین نباید بازیکن
     * یا تجهیزات جدید اضافه کند.
     */

    if (activePanel === "draw") {
      return;
    }


    // در حالت ویرایش تمرین، ابزارهای بازیکن/تجهیزات/توپ
    // باید بدون نیاز به تغییر Mode بتوانند آبجکت جدید بسازند.
    // هنگام Playback هم اجازه افزودن نمی‌دهیم تا لایه پخش دست‌نخورده بماند.
    const canAddDuringEdit =
      Boolean(editingSavedAnimationId) && !isPlaying;

    if (mode !== "add" && !canAddDuringEdit) return;

    if (!activeTool) return;


    const rect =
      event.currentTarget.getBoundingClientRect();


    const x =
      event.clientX -
      rect.left;


    const y =
      event.clientY -
      rect.top;


    addObject(
      activeTool as any,
      x,
      y
    );
  };


  /* =========================================================
     Drawing Mode
     ========================================================= */

  const isDrawingMode =
    !isAndroid &&
    activePanel === "draw" &&
    !drawingLocked;


  /* =========================================================
     Pointer → Court Coordinates
     ========================================================= */

  const getDrawingPoint = (
    event: PointerEvent<SVGSVGElement>
  ): DrawingPoint | null => {

    const svg =
      event.currentTarget;


    const rect =
      svg.getBoundingClientRect();


    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return null;
    }


    return {
      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top,
    };
  };


  /* =========================================================
     Start Drawing
     ========================================================= */

  const handleDrawingPointerDown = (
    event: PointerEvent<SVGSVGElement>
  ) => {

    if (!isDrawingMode) {
      return;
    }


    event.preventDefault();

    event.stopPropagation();


    const point =
      getDrawingPoint(event);


    if (!point) return;


    drawingPointerDown.current =
      true;


    const newDrawing: Drawing = {

      id:
        crypto.randomUUID(),

      tool:
        drawingTool,

      points:
        [point],

      color:
        lineColor,

      width:
        lineWidth,

      opacity:
        lineOpacity / 100,
    };


    setDrawingInProgress(
      newDrawing
    );


    event.currentTarget.setPointerCapture(
      event.pointerId
    );
  };


  /* =========================================================
     Drawing Move
     ========================================================= */

  const handleDrawingPointerMove = (
    event: PointerEvent<SVGSVGElement>
  ) => {

    if (
      !drawingPointerDown.current
    ) {
      return;
    }


    if (!drawingInProgress) {
      return;
    }


    event.preventDefault();

    event.stopPropagation();


    const point =
      getDrawingPoint(event);


    if (!point) return;


    const isCurve =
      drawingInProgress.tool ===
        "curve" ||
      drawingInProgress.tool ===
        "curveArrow";


    if (isCurve) {

      setDrawingInProgress(
        (previous) => {

          if (!previous) {
            return null;
          }


          return {
            ...previous,

            points: [
              ...previous.points,
              point,
            ],
          };
        }
      );


      return;
    }


    setDrawingInProgress(
      (previous) => {

        if (!previous) {
          return null;
        }


        return {
          ...previous,

          points: [
            previous.points[0],
            point,
          ],
        };
      }
    );
  };


  /* =========================================================
     Finish Drawing
     ========================================================= */

  const finishDrawing = (
    event?: PointerEvent<SVGSVGElement>
  ) => {

    if (
      !drawingPointerDown.current
    ) {
      return;
    }


    drawingPointerDown.current =
      false;


    if (event) {

      event.preventDefault();

      event.stopPropagation();


      try {

        event.currentTarget.releasePointerCapture(
          event.pointerId
        );

      } catch {
        /*
         * PointerCapture ممکن است
         * قبلاً آزاد شده باشد.
         */
      }
    }


    setDrawingInProgress(
      (current) => {

        if (!current) {
          return null;
        }


        if (
          current.points.length < 2
        ) {
          return null;
        }


        setDrawings(
          (previous) => [
            ...previous,
            current,
          ]
        );


        return null;
      }
    );
  };


  /* =========================================================
     Clear Drawings
     ========================================================= */


  /* =========================================================
     Dash Style
     ========================================================= */

  const getDashArray = (
    tool: Drawing["tool"]
  ) => {

    if (
      tool === "dashedLine" ||
      tool === "dashedArrow"
    ) {
      return "12 10";
    }


    return undefined;
  };


  /* =========================================================
     Arrow Marker
     ========================================================= */

  const ArrowMarker = ({
    id,
    color,
  }: {
    id: string;
    color: string;
  }) => {

    return (
      <marker
        id={id}
        markerWidth="12"
        markerHeight="12"
        refX="9"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >

        <path
          d="M 0 0 L 10 5 L 0 10 z"
          fill={color}
        />

      </marker>
    );
  };


  /* =========================================================
     Curve Path
     ========================================================= */

  const buildCurvePath = (
    points: DrawingPoint[]
  ) => {

    if (points.length === 0) {
      return "";
    }


    if (points.length === 1) {

      return `
        M
        ${points[0].x}
        ${points[0].y}
      `;
    }


    let path =
      `M ${points[0].x} ${points[0].y}`;


    for (
      let index = 1;
      index < points.length;
      index++
    ) {

      const previous =
        points[index - 1];

      const current =
        points[index];


      const controlX =
        previous.x;

      const controlY =
        previous.y;


      const endX =
        (previous.x +
          current.x) /
        2;


      const endY =
        (previous.y +
          current.y) /
        2;


      path +=
        ` Q ${controlX} ${controlY} ${endX} ${endY}`;
    }


    const last =
      points[points.length - 1];


    path +=
      ` L ${last.x} ${last.y}`;


    return path;
  };


  /* =========================================================
     Render Drawing
     ========================================================= */

  const renderDrawing = (
    drawing: Drawing,
    preview = false
  ) => {

    const {
      id,
      tool,
      points,
      color,
      width,
      opacity,
    } = drawing;


    if (
      points.length < 2
    ) {
      return null;
    }


    const first =
      points[0];


    const last =
      points[
        points.length - 1
      ];


    const isArrow =
      tool === "arrow" ||
      tool === "dashedArrow" ||
      tool === "curveArrow";


    const isCurve =
      tool === "curve" ||
      tool === "curveArrow";


    const dashArray =
      getDashArray(tool);


    /* =====================================================
       Curve
       ===================================================== */

    if (isCurve) {

      return (
        <path
          key={
            preview
              ? "preview-curve"
              : id
          }

          d={
            buildCurvePath(
              points
            )
          }

          fill="none"

          stroke={color}

          strokeWidth={width}

          strokeLinecap="round"

          strokeLinejoin="round"

          strokeDasharray={
            dashArray
          }

          opacity={opacity}

          markerEnd={
            isArrow
              ? `url(#arrow-${id})`
              : undefined
          }
        />
      );
    }


    /* =====================================================
       Straight Line
       ===================================================== */

    return (
      <line
        key={
          preview
            ? "preview-line"
            : id
        }

        x1={first.x}

        y1={first.y}

        x2={last.x}

        y2={last.y}

        stroke={color}

        strokeWidth={width}

        strokeLinecap="round"

        strokeDasharray={
          dashArray
        }

        opacity={opacity}

        markerEnd={
          isArrow
            ? `url(#arrow-${id})`
            : undefined
        }
      />
    );
  };


  /* =========================================================
     Drawing Layer
     فقط Web / Windows
     ========================================================= */

  const DrawingLayer = () => {

    if (isAndroid) {
      return null;
    }


    return (
      <svg
        width="100%"
        height="100%"

        style={{
          position: "absolute",

          inset: 0,

          zIndex: 20,

          pointerEvents:
            isDrawingMode
              ? "auto"
              : "none",

          touchAction:
            "none",

          userSelect:
            "none",
        }}

        onPointerDown={
          handleDrawingPointerDown
        }

        onPointerMove={
          handleDrawingPointerMove
        }

        onPointerUp={
          finishDrawing
        }

        onPointerCancel={
          finishDrawing
        }
      >

        {/* =========================================
            Arrow Markers
            ========================================= */}

        <defs>

          {drawings.map(
            (drawing) => {

              const isArrow =
                drawing.tool ===
                  "arrow" ||
                drawing.tool ===
                  "dashedArrow" ||
                drawing.tool ===
                  "curveArrow";


              if (!isArrow) {
                return null;
              }


              return (
                <ArrowMarker
                  key={
                    `marker-${drawing.id}`
                  }

                  id={
                    `arrow-${drawing.id}`
                  }

                  color={
                    drawing.color
                  }
                />
              );
            }
          )}


          {drawingInProgress &&
            (
              drawingInProgress.tool ===
                "arrow" ||
              drawingInProgress.tool ===
                "dashedArrow" ||
              drawingInProgress.tool ===
                "curveArrow"
            ) && (

              <ArrowMarker
                id="arrow-preview"
                color={
                  drawingInProgress.color
                }
              />

            )}

        </defs>


        {/* =========================================
            Final Drawings
            ========================================= */}

        {drawings.map(
          (drawing) =>
            renderDrawing(
              drawing
            )
        )}


        {/* =========================================
            Drawing Preview
            ========================================= */}

        {drawingInProgress &&
          renderDrawing(
            drawingInProgress,
            true
          )}

      </svg>
    );
  };


  /* =========================================================
     ANDROID
     ========================================================= */

  if (isAndroid) {

    return (
      <DndContext
        onDragEnd={
          handleDragEnd
        }
      >

        <div
          className=
            "android-court-stage"
        >

          <div
            className=
              "android-court-frame"

            onClick={
              handleCourtClick
            }
          >

            {/* =========================================
                Android Court
                ========================================= */}

            <img
              className=
                "android-court-image"

              src="/courts/futsal.png"

              alt="Futsal Court"

              draggable={false}

              onLoad={(event) => {

                const image =
                  event.currentTarget;


                if (
                  image.naturalWidth >
                    0 &&
                  image.naturalHeight >
                    0
                ) {

                  setCourtRatio(
                    image.naturalWidth /
                      image.naturalHeight
                  );
                }

              }}
            />


            {/* =========================================
                Board Objects
                ========================================= */}

            <div
              className=
                "android-court-objects"
            >

              {!showPlayback &&
                objects.map(
                  (obj) => (

                    <DraggableObject
                      key={obj.id}
                      object={obj}
                    />

                  )
                )}

              {showPlayback && (
                <PlaybackObjectsLayer
                  objects={playbackObjects}
                />
              )}


            </div>

          </div>

        </div>

      </DndContext>
    );
  }


  /* =========================================================
     WEB / WINDOWS
     ========================================================= */

  return (
    <DndContext
      onDragEnd={
        handleDragEnd
      }
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

        <div
          onClick={
            handleCourtClick
          }

          style={{
            position: "relative",

            width: `min(
              100%,
              calc(
                (100dvh - 100px)
                * ${courtRatio}
              )
            )`,

            aspectRatio:
              `${courtRatio}`,

            maxHeight: "100%",

            background: "#00A0E3",

            overflow: "hidden",

            borderRadius: 4,

            boxShadow:
              "0 12px 40px rgba(0, 0, 0, 0.35)",
          }}
        >

          {/* =========================================
              Court Image
              مسیر صحیح:
              public/courts/futsal.png
              ========================================= */}

          <img
            src="/courts/futsal.png"

            alt="Futsal Court"

            draggable={false}

            onLoad={(event) => {

              const image =
                event.currentTarget;


              if (
                image.naturalWidth >
                  0 &&
                image.naturalHeight >
                  0
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


          {/* =========================================
              Drawing Layer
              ========================================= */}

          <DrawingLayer />


          {/* =========================================
              Board Objects
              ========================================= */}

          <div
            style={{
              position:
                "absolute",

              inset: 0,

              zIndex: 30,

              pointerEvents:
                "none",
            }}
          >

            {!showPlayback &&
              objects.map(
                (obj) => (

                  <div
                    key={obj.id}

                    style={{
                      pointerEvents:
                        "auto",
                    }}
                  >

                    <DraggableObject
                      object={obj}
                    />

                  </div>

                )
              )}

            {showPlayback && (
              <PlaybackObjectsLayer
                objects={playbackObjects}
              />
            )}


          </div>

        </div>

      </div>

    </DndContext>
  );
}