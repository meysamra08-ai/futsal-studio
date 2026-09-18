import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useUI } from "../../core/contexts/UIContext";
import { useAnimation } from "../../core/contexts/AnimationContext";
import { useBoard } from "../../core/contexts/BoardContext";

import EquipmentPanel from "./EquipmentPanel";
import CourtPanel from "./CourtPanel";
import PlayersPanel from "./PlayersPanel";
import BallPanel from "../Ball/BallPanel";
import DrawingTab from "../Equipment/DrawingTab";
import AnimationTab from "../Animation/AnimationTab";

type RightPanelProps = {
  isAnimationManagementOpen?: boolean;
  onOpenAnimationManagement?: () => void;
  onCloseAnimationManagement?: () => void;
};


function TacticPreview({
  objects,
  drawings,
  courtWidth,
  courtHeight,
}: {
  objects: Array<{
    id?: string;
    x?: number;
    y?: number;
    type?: string;
    team?: string;
    teamColor?: string;
    number?: number;
    rotation?: number;
  }>;
  drawings: unknown[];
  courtWidth?: number;
  courtHeight?: number;
}) {
  courtWidth = courtWidth || 800;
  courtHeight = courtHeight || 450;
  const safeObjects = objects.filter(
    (item) => typeof item.x === "number" && typeof item.y === "number"
  );

  const renderDrawing = (drawing: any, index: number) => {
    const points = Array.isArray(drawing?.points)
      ? drawing.points.filter(
          (point: any) =>
            typeof point?.x === "number" && typeof point?.y === "number"
        )
      : [];
    if (points.length < 2) return null;

    const d = points
      .map((point: any, pointIndex: number) =>
        `${pointIndex === 0 ? "M" : "L"}${point.x} ${point.y}`
      )
      .join(" ");

    return (
      <path
        key={`drawing-${index}`}
        d={d}
        fill="none"
        stroke={drawing?.color || "#FFFFFF"}
        strokeWidth={Math.max(2, Number(drawing?.width) || 3)}
        strokeOpacity={Math.max(0.25, Math.min(1, Number(drawing?.opacity) || 1))}
        strokeDasharray={
          drawing?.tool === "dashedLine" || drawing?.tool === "dashedArrow"
            ? "8 7"
            : undefined
        }
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#2E6B2A",
      }}
    >
      <img
        src="/courts/futsal.png"
        alt="پیش‌نمایش تاکتیک"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "fill",
          display: "block",
        }}
      />
      <svg
        viewBox={`0 0 ${courtWidth} ${courtHeight}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <g>{(drawings as any[]).map(renderDrawing)}</g>
        <g>
          {safeObjects.map((item, index) => {
            const x = Math.max(0, Math.min(courtWidth, item.x ?? 0));
            const viewBoxHeight = courtHeight;
            const y = Math.max(0, Math.min(viewBoxHeight, item.y ?? 0));
            const type = item.type || "player";
            const isBall = type === "ball";
            const isGoalkeeper = type === "goalkeeper";
            const isPlayer = type === "player" || isGoalkeeper;
            const isCone = type === "cone";
            const color =
              item.teamColor ||
              (item.team === "B" || item.team === "away" ? "#E53935" : "#1976D2");

            if (isBall) {
              return (
                <g key={`object-${item.id ?? index}`}>
                  <circle cx={x} cy={y} r="10" fill="#FFFFFF" stroke="#16212B" strokeWidth="2" />
                  <path d={`M${x - 5} ${y - 2} L${x} ${y - 6} L${x + 5} ${y - 2} L${x + 3} ${y + 4} L${x - 3} ${y + 4} Z`} fill="#202A33" />
                </g>
              );
            }

            if (isCone) {
              return (
                <path
                  key={`object-${item.id ?? index}`}
                  d={`M${x - 10} ${y + 10} L${x} ${y - 10} L${x + 10} ${y + 10} Z`}
                  fill="#FF8A24"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              );
            }

            if (isPlayer) {
              return (
                <g key={`object-${item.id ?? index}`}>
                  <circle cx={x} cy={y} r="18" fill={color} stroke="#FFFFFF" strokeWidth="3" />
                  <circle cx={x} cy={y} r="13" fill="rgba(0,0,0,0.08)" />
                  <text
                    x={x}
                    y={y + 5}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="12"
                    fontWeight="900"
                  >
                    {item.number ?? (isGoalkeeper ? "1" : index + 1)}
                  </text>
                </g>
              );
            }

            return (
              <g key={`object-${item.id ?? index}`}>
                <circle cx={x} cy={y} r="14" fill="#7B8794" stroke="#FFFFFF" strokeWidth="2" />
              </g>
            );
          })}
        </g>
      </svg>
      {safeObjects.length === 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.7)",
            fontSize: 11,
            fontWeight: 800,
            textShadow: "0 2px 8px rgba(0,0,0,0.45)",
          }}
        >
          پیش‌نمایش تاکتیک
        </div>
      )}
    </div>
  );
}


function ExercisePreviewPlayer({
  exercise,
  onClose,
}: {
  exercise: {
    id: string;
    title: string;
    category: string;
    courtWidth?: number;
    courtHeight?: number;
    keyframes: Array<{
      id?: string;
      time?: number;
      objects?: any[];
      drawings?: unknown[];
    }>;
  };
  onClose: () => void;
}) {
  const keyframes = [...(Array.isArray(exercise.keyframes) ? exercise.keyframes : [])]
    .filter((frame) => frame && Array.isArray(frame.objects))
    .sort((a, b) => Number(a.time || 0) - Number(b.time || 0));

  const duration = Math.max(0.1, ...(keyframes.map((frame) => Number(frame.time || 0))));
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerShellRef = useRef<HTMLDivElement | null>(null);
  const courtWidth =
    typeof (exercise as any).courtWidth === "number" && (exercise as any).courtWidth > 0
      ? (exercise as any).courtWidth
      : 800;
  const courtHeight =
    typeof (exercise as any).courtHeight === "number" && (exercise as any).courtHeight > 0
      ? (exercise as any).courtHeight
      : courtWidth * (9 / 16);
  const courtRatio = courtWidth / courtHeight;

  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    setIsLooping(false);
    setPlaybackSpeed(1);
    setIsFullscreen(false);
  }, [exercise.id]);

  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    let startedAt = performance.now() - currentTime * 1000;

    const tick = (now: number) => {
      const elapsed = ((now - startedAt) / 1000) * playbackSpeed;

      if (elapsed >= duration) {
        if (isLooping) {
          startedAt = now;
          setCurrentTime(0);
          raf = window.requestAnimationFrame(tick);
          return;
        }
        setCurrentTime(duration);
        setIsPlaying(false);
        return;
      }

      setCurrentTime(elapsed);
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [isPlaying, duration, isLooping, playbackSpeed]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.code === "Space") {
        event.preventDefault();
        setIsPlaying((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const getObjectsAtTime = (time: number): any[] => {
    if (keyframes.length === 0) return [];
    if (keyframes.length === 1) return keyframes[0].objects || [];

    let previous = keyframes[0];
    let next = keyframes[keyframes.length - 1];

    if (time <= Number(keyframes[0].time || 0)) {
      return keyframes[0].objects || [];
    }

    for (let i = 0; i < keyframes.length - 1; i += 1) {
      const a = keyframes[i];
      const b = keyframes[i + 1];
      if (time >= Number(a.time || 0) && time <= Number(b.time || 0)) {
        previous = a;
        next = b;
        break;
      }
    }

    const previousTime = Number(previous.time || 0);
    const nextTime = Number(next.time || previousTime);
    const span = nextTime - previousTime;
    const ratio = span > 0
      ? Math.max(0, Math.min(1, (time - previousTime) / span))
      : 0;

    const previousMap = new Map<string, any>();
    const nextMap = new Map<string, any>();
    (previous.objects || []).forEach((item: any) => {
      if (item?.id) previousMap.set(item.id, item);
    });
    (next.objects || []).forEach((item: any) => {
      if (item?.id) nextMap.set(item.id, item);
    });

    const ids = new Set<string>([
      ...Array.from(previousMap.keys()),
      ...Array.from(nextMap.keys()),
    ]);

    return Array.from(ids)
      .map((id) => {
        const a = previousMap.get(id);
        const b = nextMap.get(id);
        if (!a && b) return time >= nextTime ? b : null;
        if (a && !b) return time < nextTime ? a : null;
        if (!a || !b) return null;
        return {
          ...a,
          ...b,
          x: typeof a.x === "number" && typeof b.x === "number"
            ? a.x + (b.x - a.x) * ratio
            : a.x,
          y: typeof a.y === "number" && typeof b.y === "number"
            ? a.y + (b.y - a.y) * ratio
            : a.y,
        };
      })
      .filter(Boolean);
  };

  const getDrawingsAtTime = (time: number): any[] => {
    let selected = keyframes[0];
    for (const frame of keyframes) {
      if (Number(frame.time || 0) <= time) selected = frame;
      else break;
    }
    return Array.isArray(selected?.drawings) ? (selected.drawings as any[]) : [];
  };

  const togglePlay = () => {
    if (currentTime >= duration) {
      setCurrentTime(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((value) => !value);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === playerShellRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await playerShellRef.current?.requestFullscreen();
      }
    } catch {
      // Fullscreen can be unavailable in some embedded/browser contexts.
    }
  };

  const formatTime = (value: number) => {
    const safe = Math.max(0, value);
    const minutes = Math.floor(safe / 60);
    const seconds = Math.floor(safe % 60);
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`پخش تمرین ${exercise.title}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(2,8,14,0.84)",
        backdropFilter: "blur(9px)",
        direction: "rtl",
      }}
    >
      <div
        ref={playerShellRef}
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          width: "min(1040px, 96vw)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 22,
          border: "1px solid rgba(105,175,230,0.30)",
          backgroundImage: "linear-gradient(180deg, rgba(2,9,18,0.62), rgba(3,12,24,0.88)), url('/background/sport-selector-bg.png')",
          backgroundPosition: "center",
          backgroundSize: "cover",
          boxShadow: "0 30px 100px rgba(0,0,0,0.65)",
          overflow: "hidden",
          ...(isFullscreen ? { width: "100vw", height: "100vh", maxHeight: "100vh", borderRadius: 0 } : {}),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#FFFFFF", fontSize: 18, fontWeight: 950, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{exercise.title}</div>
            <div style={{ marginTop: 4, color: "#7FA7C4", fontSize: 10, fontWeight: 800 }}>{exercise.category || "سایر"} · حالت پخش</div>
          </div>
          <button type="button" onClick={onClose} aria-label="بستن" title="بستن" style={{ width: 42, height: 42, borderRadius: 11, border: "1px solid #3A5265", background: "#111C26", color: "#FFFFFF", cursor: "pointer", fontSize: 20, fontWeight: 800 }}>×</button>
        </div>

        <div style={{ flex: 1, minHeight: 0, padding: isFullscreen ? 28 : 18, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(2,8,13,0.52)" }}>
          <div
            style={{
              width: isFullscreen
                ? `min(calc(100vw - 56px), calc((100vh - 250px) * ${courtRatio}))`
                : `min(920px, 100%, calc(68vh * ${courtRatio}))`,
              maxWidth: "100%",
              maxHeight: isFullscreen ? "calc(100vh - 250px)" : "none",
              aspectRatio: `${courtRatio}`,
              borderRadius: isFullscreen ? 12 : 16,
              overflow: "hidden",
              border: "1px solid rgba(105,206,255,0.30)",
              boxShadow: "0 16px 45px rgba(0,0,0,0.45)",
              flexShrink: 0,
            }}
          >
            <TacticPreview objects={getObjectsAtTime(currentTime)} drawings={getDrawingsAtTime(currentTime)} courtWidth={courtWidth} courtHeight={courtHeight} />
          </div>
        </div>

        <div style={{ padding: "12px 18px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(7,14,21,0.78)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, direction: "ltr" }}>
            <span style={{ minWidth: 42, color: "#AFC0CD", fontSize: 11, fontWeight: 800, textAlign: "center" }}>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.01}
              value={Math.min(currentTime, duration)}
              onChange={(event) => {
                setCurrentTime(Number(event.target.value));
                setIsPlaying(false);
              }}
              aria-label="موقعیت پخش"
              style={{ flex: 1, accentColor: "#4BB7FF", cursor: "pointer" }}
            />
            <span style={{ minWidth: 42, color: "#AFC0CD", fontSize: 11, fontWeight: 800, textAlign: "center" }}>{formatTime(duration)}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 10 }}>
            <button type="button" onClick={() => { setCurrentTime(Math.max(0, currentTime - 5)); setIsPlaying(false); }} title="۵ ثانیه عقب" style={{ width: 42, height: 38, borderRadius: 9, border: "1px solid #34434D", background: "#11191F", color: "#FFFFFF", cursor: "pointer", fontSize: 12, fontWeight: 900 }}>↶ 5</button>
            <button type="button" onClick={togglePlay} title={isPlaying ? "مکث" : "پخش"} style={{ width: 54, height: 42, borderRadius: 11, border: "1px solid #4B9CFF", background: "linear-gradient(135deg, #2588E8, #1768C8)", color: "#FFFFFF", cursor: "pointer", fontSize: 18, fontWeight: 950 }}>{isPlaying ? "Ⅱ" : "▶"}</button>
            <button type="button" onClick={() => { setCurrentTime(Math.min(duration, currentTime + 5)); setIsPlaying(false); }} title="۵ ثانیه جلو" style={{ width: 42, height: 38, borderRadius: 9, border: "1px solid #34434D", background: "#11191F", color: "#FFFFFF", cursor: "pointer", fontSize: 12, fontWeight: 900 }}>5 ↷</button>
            <button type="button" onClick={() => { setCurrentTime(0); setIsPlaying(false); }} title="شروع مجدد" style={{ width: 42, height: 38, borderRadius: 9, border: "1px solid #34434D", background: "#11191F", color: "#FFFFFF", cursor: "pointer", fontSize: 16, fontWeight: 900 }}>↻</button>
            <button
              type="button"
              onClick={() => setIsLooping((value) => !value)}
              title={isLooping ? "تکرار روشن" : "تکرار خاموش"}
              aria-label="تکرار نمایش"
              style={{
                width: 78,
                height: 38,
                borderRadius: 9,
                border: isLooping ? "1px solid #4BB7FF" : "1px solid #34434D",
                background: isLooping ? "rgba(75,183,255,0.16)" : "#11191F",
                color: isLooping ? "#4BB7FF" : "#AFC0CD",
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              🔁 تکرار
            </button>
            <select
              value={playbackSpeed}
              onChange={(event) => setPlaybackSpeed(Number(event.target.value))}
              title="سرعت پخش"
              aria-label="سرعت پخش"
              style={{ width: 68, height: 38, borderRadius: 9, border: "1px solid #34434D", background: "#11191F", color: "#AFC0CD", cursor: "pointer", fontSize: 11, fontWeight: 900, textAlign: "center", direction: "ltr" }}
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "خروج از تمام‌صفحه" : "تمام‌صفحه"}
              aria-label={isFullscreen ? "خروج از تمام‌صفحه" : "تمام‌صفحه"}
              style={{ width: 42, height: 38, borderRadius: 9, border: "1px solid #34434D", background: "#11191F", color: "#AFC0CD", cursor: "pointer", fontSize: 16, fontWeight: 900 }}
            >
              {isFullscreen ? "⤢" : "⛶"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimationManagementView({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  onClose,
  onNewExercise,
  onLoadExercise,
  onPreviewExercise,
  trainingDayMode = false,
  selectedExerciseIds = [],
  onToggleTrainingExercise,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  onClose?: () => void;
  onNewExercise?: () => void;
  onLoadExercise?: (
    exerciseId: string,
    edit: boolean
  ) => void;
  onPreviewExercise?: (exerciseId: string) => void;
  trainingDayMode?: boolean;
  selectedExerciseIds?: string[];
  onToggleTrainingExercise?: (exerciseId: string) => void;
}) {
  const {
    savedAnimations,
    deleteSavedAnimation,
    copySavedAnimation,
    loadSavedAnimation,
    play,
    updateSavedAnimationMetadata,
  } = useAnimation();

  const { objects, setObjects } = useBoard();

  const [renameExerciseId, setRenameExerciseId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [noteExerciseId, setNoteExerciseId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [openMenuExerciseId, setOpenMenuExerciseId] = useState<string | null>(null);
  const [deleteExerciseId, setDeleteExerciseId] = useState<string | null>(null);
  const [] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "title">("newest");
  const [libraryPage, setLibraryPage] = useState(1);
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const pageSize = 8;

  const managementExercises = savedAnimations.map((animation) => ({
    id: animation.id,
    title: animation.title,
    category: animation.category,
    frames: animation.frames,
    duration: animation.duration,
    note: animation.note ?? "",
    previewObjects: animation.keyframes[0]?.objects ?? [],
    previewDrawings: animation.keyframes[0]?.drawings ?? [],
  }));

  const sourceManagementExercises = trainingDayMode
    ? managementExercises.filter((exercise) => selectedExerciseIds.includes(exercise.id))
    : managementExercises;

  const filteredManagementExercises = sourceManagementExercises.filter((exercise) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 ||
      exercise.title.toLowerCase().includes(normalizedSearch);
    const matchesCategory =
      category === "همه" || exercise.category === category;
    return matchesSearch && matchesCategory;
  });

  const sortedManagementExercises = [...filteredManagementExercises].sort((a, b) => {
    if (sortOrder === "title") {
      return a.title.localeCompare(b.title, "fa");
    }
    const aIndex = savedAnimations.findIndex((item) => item.id === a.id);
    const bIndex = savedAnimations.findIndex((item) => item.id === b.id);
    return sortOrder === "newest" ? bIndex - aIndex : aIndex - bIndex;
  });

  const totalLibraryPages = Math.max(
    1,
    Math.ceil(sortedManagementExercises.length / pageSize)
  );

  const safeLibraryPage = Math.min(libraryPage, totalLibraryPages);
  const pagedManagementExercises = sortedManagementExercises.slice(
    (safeLibraryPage - 1) * pageSize,
    safeLibraryPage * pageSize
  );

  const handleCopyExercise = (exerciseId: string) => {
    copySavedAnimation(exerciseId);
  };

  const handleDeleteExercise = (exerciseId: string) => {
    const exercise = managementExercises.find((item) => item.id === exerciseId);
    if (!exercise) return;
    setOpenMenuExerciseId(null);
    setDeleteExerciseId(exerciseId);
  };

  const handleConfirmDeleteExercise = () => {
    if (!deleteExerciseId) return;
    deleteSavedAnimation(deleteExerciseId);
    setDeleteExerciseId(null);
  };

  const handleSaveExerciseExport = async (exerciseId: string) => {
    if (isExportingVideo) return;

    const exercise = savedAnimations.find((item) => item.id === exerciseId);
    if (!exercise) return;

    const keyframes = Array.isArray(exercise.keyframes)
      ? [...exercise.keyframes]
          .filter((frame) => frame && Array.isArray(frame.objects))
          .sort((a, b) => Number(a.time || 0) - Number(b.time || 0))
      : [];

    if (keyframes.length === 0) {
      window.alert("این تمرین فریم قابل خروجی ندارد.");
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      window.alert("مرورگر شما امکان ساخت خروجی ویدئویی را ندارد.");
      return;
    }

    const supportedTypes = [
      "video/mp4;codecs=h264,aac",
      "video/mp4",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ];
    const candidateTypes = supportedTypes.filter((type) =>
      typeof MediaRecorder.isTypeSupported === "function"
        ? MediaRecorder.isTypeSupported(type)
        : type === "video/webm"
    );

    if (candidateTypes.length === 0) {
      window.alert("فرمت ویدئویی مناسب در این مرورگر پیدا نشد.");
      return;
    }

    setIsExportingVideo(true);

    try {
      const canvas = document.createElement("canvas");
      const width = 1280;
      const height = 720;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");

      const fieldImage = new Image();
      fieldImage.crossOrigin = "anonymous";
      fieldImage.src = "/icons/futsal.png";
      await new Promise<void>((resolve, reject) => {
        fieldImage.onload = () => resolve();
        fieldImage.onerror = () => reject(new Error("Field image failed to load"));
      });

      const sourceRatio = fieldImage.width / fieldImage.height;
      const targetRatio = width / height;
      let sx = 0;
      let sy = 0;
      let sw = fieldImage.width;
      let sh = fieldImage.height;

      if (sourceRatio > targetRatio) {
        sw = fieldImage.height * targetRatio;
        sx = (fieldImage.width - sw) / 2;
      } else {
        sh = fieldImage.width / targetRatio;
        sy = (fieldImage.height - sh) / 2;
      }

      const maxKeyframeTime = Math.max(
        0,
        ...keyframes.map((frame) => Number(frame.time || 0))
      );
      const duration = Math.max(1, maxKeyframeTime);
      const fps = 30;
      const frameInterval = 1000 / fps;

      const firstObjects = Array.isArray(keyframes[0]?.objects)
        ? (keyframes[0].objects as any[])
        : [];

      const metadataById = new Map<string, any>();
      keyframes.forEach((frame) => {
        (Array.isArray(frame.objects) ? (frame.objects as any[]) : []).forEach(
          (item) => {
            if (item?.id) {
              metadataById.set(item.id, {
                ...(metadataById.get(item.id) || {}),
                ...item,
              });
            }
          }
        );
      });

      const getObjectsAtTime = (time: number): any[] => {
        if (keyframes.length === 1) {
          return firstObjects.map((item) => ({
            ...(metadataById.get(item?.id) || {}),
            ...item,
          }));
        }

        let previous = keyframes[0];
        let next = keyframes[keyframes.length - 1];

        for (let i = 0; i < keyframes.length - 1; i += 1) {
          const a = keyframes[i];
          const b = keyframes[i + 1];
          if (time >= Number(a.time || 0) && time <= Number(b.time || 0)) {
            previous = a;
            next = b;
            break;
          }
          if (time < Number(keyframes[0].time || 0)) {
            previous = keyframes[0];
            next = keyframes[0];
            break;
          }
        }

        const previousTime = Number(previous.time || 0);
        const nextTime = Number(next.time || previousTime);
        const span = nextTime - previousTime;
        const ratio = span > 0
          ? Math.max(0, Math.min(1, (time - previousTime) / span))
          : 0;

        const previousMap = new Map<string, any>();
        const nextMap = new Map<string, any>();

        (Array.isArray(previous.objects) ? (previous.objects as any[]) : []).forEach(
          (item) => {
            if (item?.id) previousMap.set(item.id, item);
          }
        );
        (Array.isArray(next.objects) ? (next.objects as any[]) : []).forEach(
          (item) => {
            if (item?.id) nextMap.set(item.id, item);
          }
        );

        const ids = new Set<string>([
          ...Array.from(previousMap.keys()),
          ...Array.from(nextMap.keys()),
        ]);

        return Array.from(ids).map((id) => {
          const a = previousMap.get(id);
          const b = nextMap.get(id);
          const base = metadataById.get(id) || a || b || {};

          if (!a && b) {
            return time >= nextTime ? { ...base, ...b } : null;
          }
          if (a && !b) {
            return time < nextTime ? { ...base, ...a } : null;
          }
          if (!a || !b) return null;

          return {
            ...base,
            ...a,
            x:
              typeof a.x === "number" && typeof b.x === "number"
                ? a.x + (b.x - a.x) * ratio
                : a.x,
            y:
              typeof a.y === "number" && typeof b.y === "number"
                ? a.y + (b.y - a.y) * ratio
                : a.y,
          };
        }).filter(Boolean);
      };

      const getDrawingsAtTime = (time: number): any[] => {
        let selected = keyframes[0];
        for (const frame of keyframes) {
          if (Number(frame.time || 0) <= time) selected = frame;
          else break;
        }
        return Array.isArray(selected?.drawings)
          ? (selected.drawings as any[])
          : [];
      };

      const drawScene = (time: number) => {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(fieldImage, sx, sy, sw, sh, 0, 0, width, height);

        const scaleX = width / 800;
        const scaleY = height / 450;

        ctx.save();
        ctx.scale(scaleX, scaleY);

        const drawings = getDrawingsAtTime(time);
        for (const drawing of drawings) {
          const points = Array.isArray(drawing?.points)
            ? drawing.points.filter(
                (point: any) =>
                  typeof point?.x === "number" && typeof point?.y === "number"
              )
            : [];
          if (points.length < 2) continue;

          ctx.beginPath();
          points.forEach((point: any, index: number) => {
            if (index === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.strokeStyle = drawing?.color || "#FFFFFF";
          ctx.lineWidth = Math.max(2, Number(drawing?.width) || 3);
          ctx.globalAlpha = Math.max(
            0.25,
            Math.min(1, Number(drawing?.opacity) || 1)
          );
          ctx.setLineDash(
            drawing?.tool === "dashedLine" || drawing?.tool === "dashedArrow"
              ? [8, 7]
              : []
          );
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();
        }

        ctx.restore();

        ctx.save();
        ctx.scale(scaleX, scaleY);

        const objectsToDraw = getObjectsAtTime(time);
        objectsToDraw.forEach((item: any, index: number) => {
          if (typeof item?.x !== "number" || typeof item?.y !== "number") return;

          const x = Math.max(10, Math.min(790, item.x));
          const y = Math.max(10, Math.min(440, item.y));
          const type = item.type || "player";
          const isBall = type === "ball";
          const isGoalkeeper = type === "goalkeeper";
          const isPlayer = type === "player" || isGoalkeeper;
          const isCone = type === "cone";
          const color =
            item.teamColor ||
            (item.team === "B" || item.team === "away" ? "#E53935" : "#1976D2");

          if (isBall) {
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fillStyle = "#FFFFFF";
            ctx.fill();
            ctx.strokeStyle = "#16212B";
            ctx.lineWidth = 2;
            ctx.stroke();
            return;
          }

          if (isCone) {
            ctx.beginPath();
            ctx.moveTo(x - 10, y + 10);
            ctx.lineTo(x, y - 10);
            ctx.lineTo(x + 10, y + 10);
            ctx.closePath();
            ctx.fillStyle = "#FF8A24";
            ctx.fill();
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 2;
            ctx.stroke();
            return;
          }

          if (isPlayer) {
            ctx.beginPath();
            ctx.arc(x, y, 18, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = "#FFFFFF";
            ctx.font = "900 12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
              String(item.number ?? (isGoalkeeper ? "1" : index + 1)),
              x,
              y + 1
            );
            return;
          }

          ctx.beginPath();
          ctx.arc(x, y, 14, 0, Math.PI * 2);
          ctx.fillStyle = "#7B8794";
          ctx.fill();
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        ctx.restore();

        ctx.save();
        ctx.fillStyle = "rgba(5, 12, 20, 0.78)";
        ctx.fillRect(18, 18, 170, 42);
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 18px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(
          `${Math.max(0, time).toFixed(1)}s`,
          32,
          39
        );
        ctx.restore();
      };

      if (typeof canvas.captureStream !== "function") {
        throw new Error("Canvas captureStream is not supported");
      }

      const stream = canvas.captureStream(fps);
      let recorder: MediaRecorder | null = null;
      let mimeType = "";

      for (const candidate of candidateTypes) {
        try {
          recorder = new MediaRecorder(stream, {
            mimeType: candidate,
            videoBitsPerSecond: 6_000_000,
          });
          mimeType = candidate;
          break;
        } catch (candidateError) {
          console.warn("Video MIME type failed:", candidate, candidateError);
        }
      }

      if (!recorder || !mimeType) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error("No usable MediaRecorder MIME type");
      }

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunks.push(event.data);
      };

      const stopped = new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
      });

      drawScene(0);
      recorder.start(250);

      const startedAt = performance.now();
      let lastDraw = -1;

      await new Promise<void>((resolve) => {
        const render = (now: number) => {
          const elapsed = Math.min(duration, (now - startedAt) / 1000);
          const quantized = Math.floor(elapsed * fps) / fps;
          if (quantized !== lastDraw) {
            lastDraw = quantized;
            drawScene(quantized);
          }

          if (elapsed >= duration) {
            drawScene(duration);
            window.setTimeout(() => {
              recorder.stop();
              resolve();
            }, Math.max(100, frameInterval * 2));
            return;
          }

          window.requestAnimationFrame(render);
        };

        window.requestAnimationFrame(render);
      });

      await stopped;
      stream.getTracks().forEach((track) => track.stop());

      const extension = mimeType.includes("mp4") ? "mp4" : "webm";
      const blob = new Blob(chunks, { type: mimeType });
      if (!blob.size) throw new Error("Video generation failed");

      const safeTitle = (exercise.title || "exercise")
        .replace(/[\\/:*?"<>|]/g, "-")
        .trim() || "exercise";

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${safeTitle}.${extension}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Failed to export exercise video", error);
      window.alert("خروجی ویدئو ساخته نشد. اگر مرورگر MP4 را پشتیبانی نکند، خروجی WebM ساخته می‌شود.");
    } finally {
      setIsExportingVideo(false);
    }
  };

  const handleLoadExercise = (
    exerciseId: string,
    edit = false
  ) => {
    const saved = loadSavedAnimation(
      exerciseId,
      edit
    );

    if (!saved) {
      window.alert("تمرین ذخیره‌شده پیدا نشد.");
      return;
    }

    const targetKeyframe =
      edit
        ? saved.keyframes[
            saved.keyframes.length - 1
          ]
        : saved.keyframes[0];

    if (!targetKeyframe) {
      window.alert("این تمرین هنوز فریم قابل بارگذاری ندارد.");
      return;
    }

    // Keyframes intentionally store only position data.
    // Keep the real BoardObject shape from the current board
    // and replace only the saved positions.
    const savedPositions = new Map(
      targetKeyframe.objects.map((item) => [
        item.id,
        { x: item.x, y: item.y },
      ])
    );

    setObjects(
      objects.map((object) => {
        const position = savedPositions.get(object.id);

        if (!position) {
          return {
            ...object,
            selected: false,
          };
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

    onLoadExercise?.(
      exerciseId,
      edit
    );

    if (!edit) {
      window.setTimeout(() => play(), 0);
    }
  };

  const handleEditExercise = (exerciseId: string) => {
    handleLoadExercise(exerciseId, true);
  };


  const handleOpenRenameExercise = (exerciseId: string) => {
    const exercise = managementExercises.find((item) => item.id === exerciseId);
    if (!exercise) return;

    setRenameExerciseId(exerciseId);
    setRenameTitle(exercise.title);
  };

  const handleCloseRenameExercise = () => {
    setRenameExerciseId(null);
    setRenameTitle("");
  };

  const handleSaveRenameExercise = () => {
    if (!renameExerciseId) return;

    const exercise = managementExercises.find(
      (item) => item.id === renameExerciseId
    );
    if (!exercise) return;

    const trimmedTitle = renameTitle.trim();

    if (!trimmedTitle) {
      window.alert("نام تمرین نمی‌تواند خالی باشد.");
      return;
    }

    const updated = updateSavedAnimationMetadata(
      renameExerciseId,
      trimmedTitle,
      exercise.category,
      exercise.note
    );

    if (!updated) {
      window.alert("تغییر نام تمرین انجام نشد.");
      return;
    }

    handleCloseRenameExercise();
  };

  const handleOpenNote = (exerciseId: string) => {
    const exercise = managementExercises.find(
      (item) => item.id === exerciseId
    );
    if (!exercise) return;
    setNoteExerciseId(exerciseId);
    setNoteText(exercise.note);
    setOpenMenuExerciseId(null);
  };

  const handleCloseNote = () => {
    setNoteExerciseId(null);
    setNoteText("");
  };

  const handleSaveNote = () => {
    if (!noteExerciseId) return;
    const exercise = managementExercises.find(
      (item) => item.id === noteExerciseId
    );
    if (!exercise) return;

    const updated = updateSavedAnimationMetadata(
      noteExerciseId,
      exercise.title,
      exercise.category,
      noteText
    );

    if (!updated) {
      window.alert("ذخیره یادداشت انجام نشد.");
      return;
    }

    handleCloseNote();
  };

  return (

    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        direction: "rtl",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        gap: 9,
        minHeight: 0,
        overflow: "hidden",
        backgroundImage:
          "linear-gradient(135deg, rgba(2,9,18,0.78), rgba(3,12,24,0.91)), url('/background/sport-selector-bg.png')",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
      }}
    >
      {/* نوار اصلی کتابخانه: عنوان راست، جستجو و دسته‌بندی وسط، عملیات چپ */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          minWidth: 0,
          padding: "0 34px 7px 40px",
          boxSizing: "border-box",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          style={{
            flex: "0 0 225px",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <strong style={{ fontSize: 15, fontWeight: 850, whiteSpace: "nowrap" }}>
            {trainingDayMode ? "📋 تمرین روز" : "📚 کتابخانه تمرین‌ها"}
          </strong>
          <span style={{ color: "#6FAEFF", fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" }}>
            {trainingDayMode ? `${selectedExerciseIds.length} تمرین انتخاب شده` : "Coach Studio"}
          </span>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
          }}
        >
          <div style={{ position: "relative", width: 330, flex: "0 0 330px" }}>
            <span
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#7F95A8",
                fontSize: 13,
                pointerEvents: "none",
              }}
            >
              ⌕
            </span>
            <input
              type="text"
              value={search}
              onChange={(event) => {
                onSearchChange(event.target.value);
                setLibraryPage(1);
              }}
              placeholder="جستجوی سریع تمرین..."
              aria-label="جستجوی سریع تمرین"
              style={{
                width: "100%",
                height: 38,
                boxSizing: "border-box",
                borderRadius: 10,
                border: "1px solid #2C3D50",
                background: "#101C28",
                color: "#FFFFFF",
                padding: "0 32px 0 10px",
                outline: "none",
                textAlign: "right",
                fontSize: 11,
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 4,
              minWidth: 0,
              overflow: "hidden",
              flex: "1 1 auto",
            }}
          >
            {["همه", "حمله", "دفاع", "اوت", "کرنر", "ضربات ایستگاهی", "سایر"].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  onCategoryChange(filter);
                  setLibraryPage(1);
                }}
                style={{
                  height: 48,
                  padding: "0 18px",
                  borderRadius: 11,
                  border: category === filter ? "1px solid #4B9CFF" : "1px solid #2C3D50",
                  background: category === filter ? "#2588E8" : "#162433",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  flex: "0 0 auto",
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            gap: 9,
            marginLeft: 18,
          }}
        >
          <button
            type="button"
            onClick={() => {
              onClose?.();
              onNewExercise?.();
            }}
            style={{
              minWidth: 116,
              height: 38,
              padding: "0 15px",
              borderRadius: 10,
              border: "1px solid #2588E8",
              color: "#FFFFFF",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 900,
              background: "linear-gradient(135deg, #2C9BFF 0%, #1768C8 100%)",
              whiteSpace: "nowrap",
              boxShadow: "0 7px 18px rgba(37,136,232,0.24)",
            }}
          >
            ＋ تمرین جدید
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              minWidth: 108,
              height: 38,
              padding: "0 14px",
              border: "1px solid rgba(105,175,230,0.42)",
              background: "linear-gradient(135deg, #203A50 0%, #102333 100%)",
              color: "#EAF7FF",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
              whiteSpace: "nowrap",
              boxShadow: "0 7px 18px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.10)",
              letterSpacing: "0.1px",
            }}
            aria-label="بازگشت"
            title="بازگشت"
          >
            ← بازگشت
          </button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          padding: "5px 9px 5px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gridTemplateRows: "repeat(2, minmax(0, 1fr))",
            gap: 11,
            height:
              sortedManagementExercises.length > pageSize
                ? "calc(100% - 50px)"
                : "100%",
            minHeight: 0,
          }}
        >
          {pagedManagementExercises.map((exercise, exerciseIndex) => {
            const preview = exercise.previewObjects as Array<{
              id?: string;
              x?: number;
              y?: number;
              type?: string;
              team?: string;
              teamColor?: string;
              number?: number;
              rotation?: number;
            }>;
            const previewDrawings = exercise.previewDrawings as unknown[];

            return (
              <article
                key={exercise.id}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: 0,
                  borderRadius: 18,
                  border: "1px solid rgba(123,167,196,0.42)",
                  background: "linear-gradient(150deg, rgba(24,45,61,0.96), rgba(9,20,30,0.98))",
                  boxShadow: "0 14px 34px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08)",
                  transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                  cursor: "default",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.borderColor = "rgba(105,206,255,0.72)";
                  event.currentTarget.style.boxShadow = "0 18px 38px rgba(0,0,0,0.42), 0 0 0 1px rgba(105,206,255,0.16), 0 0 24px rgba(45,139,232,0.18), inset 0 1px 0 rgba(255,255,255,0.12)";
                  event.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = "translateY(0)";
                  event.currentTarget.style.borderColor = "rgba(123,167,196,0.42)";
                  event.currentTarget.style.boxShadow = "0 14px 34px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08)";
                }}
              >
                {(() => {
                  const accentThemes = [
                    { main: "#B7E33A", glow: "rgba(183,227,58,0.22)", dark: "rgba(70,92,14,0.42)" },
                    { main: "#FF8A18", glow: "rgba(255,138,24,0.22)", dark: "rgba(101,48,10,0.42)" },
                    { main: "#FF3348", glow: "rgba(255,51,72,0.20)", dark: "rgba(105,18,27,0.42)" },
                    { main: "#4BB7FF", glow: "rgba(75,183,255,0.20)", dark: "rgba(17,65,95,0.42)" },
                  ][exerciseIndex % 4];

                  return (
                    <>
                      {/* سربرگ مینیمال کارت */}
                      <div
                        style={{
                          flex: "0 0 47px",
                          padding: "7px 11px 5px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          boxSizing: "border-box",
                          background: "linear-gradient(145deg, rgba(255,255,255,0.035), rgba(5,12,19,0.46))",
                          borderBottom: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <div style={{ minWidth: 0, textAlign: "right" }}>
                          <strong style={{ display: "block", marginTop: 1, fontSize: 18, lineHeight: 1.18, fontWeight: 950, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#F7FAFC" }}>
                            {exercise.title}
                          </strong>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flex: "0 0 auto" }}>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onToggleTrainingExercise?.(exercise.id);
                            }}
                            aria-label={selectedExerciseIds.includes(exercise.id) ? "حذف از تمرین روز" : "افزودن به تمرین روز"}
                            title={selectedExerciseIds.includes(exercise.id) ? "حذف از تمرین روز" : "افزودن به تمرین روز"}
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 9,
                              border: selectedExerciseIds.includes(exercise.id) ? `1px solid ${accentThemes.main}` : "1px solid #34434D",
                              background: selectedExerciseIds.includes(exercise.id) ? accentThemes.dark : "#11191F",
                              color: selectedExerciseIds.includes(exercise.id) ? accentThemes.main : "#9EADB7",
                              cursor: "pointer",
                              fontSize: 17,
                              fontWeight: 900,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {selectedExerciseIds.includes(exercise.id) ? "✓" : "＋"}
                          </button>
                          <div style={{ textAlign: "left", flex: "0 0 auto" }}>
                            <div style={{ color: accentThemes.main, fontSize: 15, fontWeight: 950, letterSpacing: 0.2 }}>Coach Studio</div>
                          </div>
                        </div>
                      </div>

                      {/* نوار عملیات: در «تمرین روز» فقط پخش نمایش داده می‌شود؛ مدیریت کامل فقط در کتابخانه است. */}
                      <div
                        style={{
                          position: "relative",
                          zIndex: 20,
                          flex: "0 0 49px",
                          padding: "5px 8px",
                          display: "grid",
                          gridTemplateColumns: trainingDayMode ? "1fr" : "1.25fr 1fr 1fr 1fr",
                          gap: 6,
                          boxSizing: "border-box",
                          background: "linear-gradient(180deg, rgba(8,14,20,0.92), rgba(20,27,31,0.86))",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {!trainingDayMode && (
                          <button type="button" onClick={() => handleEditExercise(exercise.id)} title="ویرایش تمرین" style={{ border: "1px solid rgba(255,255,255,0.13)", borderRadius: 9, background: "linear-gradient(180deg, rgba(35,43,43,0.98), rgba(13,18,21,0.98))", color: "#F5F7F8", cursor: "pointer", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)" }}>✏️ ویرایش</button>
                        )}
                        <button type="button" onClick={() => onPreviewExercise?.(exercise.id)} title="پخش تمرین" aria-label="پخش تمرین" style={{ border: "1px solid rgba(255,255,255,0.13)", borderRadius: 9, background: "linear-gradient(180deg, rgba(37,44,45,0.98), rgba(13,18,21,0.98))", color: "#F0F3F5", cursor: "pointer", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)" }}>▶</button>
                        {!trainingDayMode && (
                          <>
                            <button type="button" onClick={() => handleSaveExerciseExport(exercise.id)} disabled={isExportingVideo} aria-label="ساخت ویدئو" title="ساخت ویدئو" style={{ border: "1px solid rgba(255,255,255,0.13)", borderRadius: 9, background: "linear-gradient(180deg, rgba(37,44,45,0.98), rgba(13,18,21,0.98))", color: "#F0F3F5", cursor: "pointer", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)" }}>🎬 ویدئو</button>
                            <button type="button" onClick={() => handleDeleteExercise(exercise.id)} aria-label="حذف تمرین" title="حذف تمرین" style={{ border: "1px solid rgba(255,255,255,0.13)", borderRadius: 9, background: "linear-gradient(180deg, rgba(37,44,45,0.98), rgba(13,18,21,0.98))", color: "#FF7A7A", cursor: "pointer", fontSize: 15, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)" }}>🗑</button>
                          </>
                        )}
                      </div>

                      {/* مینی‌برد تاکتیکی؛ نسبت تصویر طبیعی و داخل قاب */}
                      <div
                        style={{
                          position: "relative",
                          flex: "1 1 auto",
                          minHeight: 0,
                          padding: "8px 12px 7px",
                          boxSizing: "border-box",
                          display: "flex",
                          alignItems: "stretch",
                          justifyContent: "center",
                          background: "linear-gradient(180deg, rgba(3,8,12,0.96), rgba(9,15,18,0.96))",
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            height: "100%",
                            minHeight: 0,
                            overflow: "hidden",
                            borderRadius: 12,
                            border: `2px solid ${accentThemes.main}66`,
                            background: "#0A1013",
                            boxShadow: `0 8px 22px rgba(0,0,0,0.38), 0 0 0 1px rgba(255,255,255,0.035), 0 0 18px ${accentThemes.glow}`,
                          }}
                        >
                          <TacticPreview objects={preview} drawings={previewDrawings} />
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              pointerEvents: "none",
                              background: `linear-gradient(135deg, rgba(255,255,255,0.035), transparent 32%, transparent 72%, ${accentThemes.glow})`,
                            }}
                          />
                          <span
                            style={{
                              position: "absolute",
                              top: 7,
                              right: 8,
                              padding: "3px 7px",
                              borderRadius: 6,
                              background: "rgba(5,10,13,0.72)",
                              border: "1px solid rgba(255,255,255,0.10)",
                              color: "#D9E2E7",
                              fontSize: 8,
                              fontWeight: 800,
                              backdropFilter: "blur(5px)",
                            }}
                          >
                            تاکتیک
                          </span>
                        </div>
                      </div>

                      {/* فوتر کارت شبیه نمونه مرجع */}
                      <div
                        style={{
                          flex: "0 0 58px",
                          padding: "6px 9px 8px",
                          boxSizing: "border-box",
                          display: "grid",
                          gridTemplateColumns: trainingDayMode ? "1fr 34px" : "82px 1fr 34px",
                          alignItems: "center",
                          gap: 8,
                          background: "linear-gradient(180deg, rgba(10,17,22,0.94), rgba(5,10,14,0.98))",
                          borderTop: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {!trainingDayMode && (
                          <div style={{ display: "flex", gap: 5 }}>
                            <button type="button" onClick={() => setOpenMenuExerciseId((current) => current === exercise.id ? null : exercise.id)} aria-label="گزینه‌های تمرین" title="گزینه‌ها" style={{ width: 38, height: 38, borderRadius: 9, border: "1px solid #34434D", background: "#11191F", color: "#C9D2D8", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>⋮</button>
                          </div>
                        )}

                        <button type="button" onClick={() => handleOpenNote(exercise.id)} title={exercise.note || "افزودن یادداشت مربی"} style={{ minWidth: 0, height: 38, borderRadius: 9, border: exercise.note ? `1px solid ${accentThemes.main}55` : "1px solid #303E48", background: exercise.note ? `${accentThemes.dark}` : "rgba(16,24,29,0.85)", color: exercise.note ? "#DCECB7" : "#8E9EA8", cursor: "pointer", fontSize: 11, fontWeight: 800, textAlign: "right", padding: "0 11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {exercise.note ? `👁 ${exercise.note}` : "＋ افزودن یادداشت مربی"}
                        </button>

                        <div
                          style={{
                            minWidth: 34,
                            textAlign: "left",
                            color: accentThemes.main,
                            paddingLeft: 3,
                          }}
                        >
                          <strong
                            style={{
                              display: "block",
                              fontSize: 13,
                              lineHeight: 1,
                              fontWeight: 950,
                              letterSpacing: "0.3px",
                              textTransform: "uppercase",
                            }}
                          >
                            {String(exerciseIndex + 1).padStart(2, "0")}
                          </strong>
                        </div>
                      </div>

                      {!trainingDayMode && openMenuExerciseId === exercise.id && (
                        <div style={{ position: "absolute", bottom: 54, right: 9, zIndex: 80, width: 160, padding: 7, borderRadius: 11, border: "1px solid #3A5265", background: "rgba(16,23,29,0.98)", boxShadow: "0 18px 45px rgba(0,0,0,0.50)", backdropFilter: "blur(10px)" }}>
                          {[
                            { label: "✏️ تغییر نام", action: () => { setOpenMenuExerciseId(null); handleOpenRenameExercise(exercise.id); } },
                            { label: "📋 کپی تمرین", action: () => { setOpenMenuExerciseId(null); handleCopyExercise(exercise.id); } },
                          ].map((item) => (
                            <button key={item.label} type="button" onClick={item.action} style={{ width: "100%", height: 36, border: 0, borderRadius: 8, background: "transparent", color: "#FFFFFF", cursor: "pointer", textAlign: "right", padding: "0 10px", fontSize: 11 }}>{item.label}</button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </article>
            );
          })}
        </div>

        {sortedManagementExercises.length === 0 && (
          <div
            style={{
              marginTop: 8,
              padding: 20,
              borderRadius: 14,
              border: "1px dashed #314557",
              background: "#172532",
              color: "#AAB9C7",
              textAlign: "center",
              fontSize: 13,
            }}
          >
            تمرینی با این مشخصات پیدا نشد
          </div>
        )}

        {sortedManagementExercises.length > pageSize && (
          <div
            style={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 7,
              marginTop: 8,
              direction: "ltr",
              minHeight: 38,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                gap: 7,
                direction: "rtl",
              }}
            >
              <div style={{ color: "#8FA2B2", fontSize: 10, whiteSpace: "nowrap" }}>
                نمایش {sortedManagementExercises.length === 0 ? 0 : (safeLibraryPage - 1) * pageSize + 1} تا {Math.min(safeLibraryPage * pageSize, sortedManagementExercises.length)} از {sortedManagementExercises.length} تمرین
              </div>
              <select
                value={sortOrder}
                onChange={(event) => {
                  setSortOrder(event.target.value as "newest" | "oldest" | "title");
                  setLibraryPage(1);
                }}
                aria-label="مرتب‌سازی تمرین‌ها"
                style={{
                  width: 92,
                  height: 30,
                  borderRadius: 8,
                  border: "1px solid #314557",
                  background: "rgba(23,37,50,0.92)",
                  color: "#C8D4DE",
                  padding: "0 6px",
                  outline: "none",
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
                <option value="newest">↕ جدیدترین</option>
                <option value="oldest">↕ قدیمی‌ترین</option>
                <option value="title">↕ نام تمرین</option>
              </select>
            </div>
            <button
              type="button"
              disabled={safeLibraryPage <= 1}
              onClick={() => setLibraryPage((page) => Math.max(1, page - 1))}
              style={{
                width: 42,
                height: 38,
                borderRadius: 9,
                border: "1px solid #314557",
                background: safeLibraryPage <= 1 ? "#121D27" : "#172532",
                color: safeLibraryPage <= 1 ? "#566674" : "#FFFFFF",
                cursor: safeLibraryPage <= 1 ? "default" : "pointer",
              }}
            >
              ‹
            </button>
            {Array.from({ length: totalLibraryPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setLibraryPage(page)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 9,
                  border: page === safeLibraryPage ? "1px solid #2588E8" : "1px solid #314557",
                  background: page === safeLibraryPage ? "#2588E8" : "#172532",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              disabled={safeLibraryPage >= totalLibraryPages}
              onClick={() => setLibraryPage((page) => Math.min(totalLibraryPages, page + 1))}
              style={{
                width: 42,
                height: 38,
                borderRadius: 9,
                border: "1px solid #314557",
                background: safeLibraryPage >= totalLibraryPages ? "#121D27" : "#172532",
                color: safeLibraryPage >= totalLibraryPages ? "#566674" : "#FFFFFF",
                cursor: safeLibraryPage >= totalLibraryPages ? "default" : "pointer",
              }}
            >
              ›
            </button>
          </div>
        )}
      </div>

      {deleteExerciseId && (() => {
        const exercise = managementExercises.find((item) => item.id === deleteExerciseId);
        if (!exercise) return null;

        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-exercise-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setDeleteExerciseId(null);
            }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              background: "rgba(3, 10, 17, 0.78)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div
              onMouseDown={(event) => event.stopPropagation()}
              style={{
                width: "min(430px, 100%)",
                direction: "rtl",
                borderRadius: 18,
                border: "1px solid rgba(255, 91, 104, 0.30)",
                background: "linear-gradient(180deg, #1C2B39 0%, #101A25 100%)",
                boxShadow: "0 28px 90px rgba(0,0,0,0.58)",
                padding: 22,
                color: "#FFFFFF",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(218, 54, 69, 0.16)",
                  border: "1px solid rgba(255, 91, 104, 0.26)",
                  fontSize: 21,
                  marginBottom: 14,
                }}
              >
                ⚠️
              </div>
              <div id="delete-exercise-title" style={{ fontSize: 17, fontWeight: 900, marginBottom: 7 }}>
                حذف تمرین؟
              </div>
              <div style={{ color: "#AAB9C7", fontSize: 12, lineHeight: 1.9 }}>
                مطمئنی می‌خواهی تمرین «{exercise.title}» را حذف کنی؟ این عملیات قابل بازگشت نیست.
              </div>
              <div style={{ display: "flex", justifyContent: "flex-start", gap: 8, marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => setDeleteExerciseId(null)}
                  style={{
                    height: 40,
                    padding: "0 18px",
                    borderRadius: 9,
                    border: "1px solid #314557",
                    background: "#172532",
                    color: "#C8D4DE",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteExercise}
                  style={{
                    height: 40,
                    padding: "0 20px",
                    borderRadius: 9,
                    border: "1px solid #D94352",
                    background: "linear-gradient(135deg, #E34A58 0%, #B92838 100%)",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 900,
                    boxShadow: "0 7px 18px rgba(201, 48, 64, 0.24)",
                  }}
                >
                  حذف تمرین
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {noteExerciseId && (
        <div
          role="dialog"
          aria-modal="true"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseNote();
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "rgba(3, 10, 17, 0.72)",
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              width: "min(520px, 100%)",
              direction: "rtl",
              borderRadius: 16,
              border: "1px solid #35536A",
              background: "linear-gradient(180deg, #1A2B3A 0%, #101C28 100%)",
              boxShadow: "0 22px 70px rgba(0,0,0,0.45)",
              padding: 20,
              color: "#FFFFFF",
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 6 }}>📝 یادداشت مربی</div>
            <div style={{ color: "#9FB0BF", fontSize: 11, marginBottom: 14 }}>نکات، توضیحات یا تأکیدهای مهم این تمرین را اینجا ثبت کن.</div>
            <textarea
              autoFocus
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              onKeyDown={(event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                  event.preventDefault();
                  handleSaveNote();
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  handleCloseNote();
                }
              }}
              placeholder="مثلاً: بازیکن ۷ بعد از پاس دوم سریع به فضای پشت مدافع حرکت کند..."
              style={{
                width: "100%",
                minHeight: 150,
                resize: "vertical",
                boxSizing: "border-box",
                borderRadius: 11,
                border: "1px solid #3D617B",
                background: "#0B1620",
                color: "#FFFFFF",
                padding: 13,
                outline: "none",
                textAlign: "right",
                fontSize: 12,
                lineHeight: 1.9,
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-start", gap: 8, marginTop: 16 }}>
              <button type="button" onClick={handleCloseNote} style={{ height: 40, padding: "0 18px", borderRadius: 9, border: "1px solid #314557", background: "#172532", color: "#C8D4DE", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>انصراف</button>
              <button type="button" onClick={handleSaveNote} style={{ height: 40, padding: "0 20px", borderRadius: 9, border: "1px solid #2588E8", background: "#2588E8", color: "#FFFFFF", cursor: "pointer", fontSize: 11, fontWeight: 800 }}>ذخیره یادداشت</button>
            </div>
          </div>
        </div>
      )}

      {renameExerciseId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-exercise-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseRenameExercise();
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "rgba(3, 10, 17, 0.72)",
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              width: "min(420px, 100%)",
              direction: "rtl",
              borderRadius: 16,
              border: "1px solid #35536A",
              background:
                "linear-gradient(180deg, #1A2B3A 0%, #101C28 100%)",
              boxShadow: "0 22px 70px rgba(0, 0, 0, 0.45)",
              padding: 20,
              color: "#FFFFFF",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div>
                <div
                  id="rename-exercise-title"
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    marginBottom: 5,
                  }}
                >
                  ✏️ تغییر نام تمرین
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#9FB0BF",
                  }}
                >
                  فقط نام کارت تغییر می‌کند و محتوای تمرین دست‌نخورده می‌ماند.
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseRenameExercise}
                aria-label="بستن"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  border: "1px solid #314557",
                  background: "#101C28",
                  color: "#AAB9C7",
                  cursor: "pointer",
                  fontSize: 17,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <label
              htmlFor="rename-exercise-input"
              style={{
                display: "block",
                fontSize: 11,
                fontWeight: 700,
                color: "#C8D4DE",
                marginBottom: 7,
              }}
            >
              نام تمرین
            </label>

            <input
              id="rename-exercise-input"
              autoFocus
              value={renameTitle}
              onChange={(event) => setRenameTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSaveRenameExercise();
                }
                if (event.key === "Escape") {
                  event.preventDefault();
                  handleCloseRenameExercise();
                }
              }}
              style={{
                width: "100%",
                height: 46,
                boxSizing: "border-box",
                borderRadius: 10,
                border: "1px solid #3D617B",
                background: "#0B1620",
                color: "#FFFFFF",
                padding: "0 13px",
                outline: "none",
                textAlign: "right",
                fontSize: 13,
                fontWeight: 600,
              }}
              placeholder="مثلاً: حمله از کناره چپ"
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                gap: 8,
                marginTop: 8,
              }}
            >
              <button
                type="button"
                onClick={handleCloseRenameExercise}
                style={{
                  height: 40,
                  minWidth: 92,
                  padding: "0 15px",
                  borderRadius: 9,
                  border: "1px solid #314557",
                  background: "#172532",
                  color: "#C8D4DE",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={handleSaveRenameExercise}
                style={{
                  height: 40,
                  minWidth: 118,
                  padding: "0 18px",
                  borderRadius: 9,
                  border: "1px solid #2588E8",
                  background: "#2588E8",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 800,
                  boxShadow: "0 6px 18px rgba(37, 136, 232, 0.22)",
                }}
              >
                ذخیره تغییر نام
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RightPanel({
  isAnimationManagementOpen = false,
  onOpenAnimationManagement,
  onCloseAnimationManagement,
}: RightPanelProps) {
  const { activePanel } = useUI();

  const { resetAnimation, savedAnimations } = useAnimation();

  // منوی Animation فقط دو مرحله دارد:
  // ۱) منوی ورود
  // ۲) صفحه اصلی ساخت انیمیشن
  const [animationStep, setAnimationStep] = useState<1 | 2>(1);
  const [editingAnimationId, setEditingAnimationId] =
    useState<string | null>(null);
  const [animationSearch, setAnimationSearch] = useState("");
  const [animationCategory, setAnimationCategory] = useState("همه");
  const [isTrainingDayOpen, setIsTrainingDayOpen] = useState(false);
  const [previewExerciseId, setPreviewExerciseId] = useState<string | null>(null);
  const [trainingDayExerciseIds, setTrainingDayExerciseIds] = useState<string[]>(() => {
    try {
      const stored = window.localStorage.getItem("coach-studio-training-day");
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch { return []; }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("coach-studio-training-day", JSON.stringify(trainingDayExerciseIds));
    } catch { /* selection remains in memory */ }
  }, [trainingDayExerciseIds]);

  const toggleTrainingDayExercise = (exerciseId: string) => {
    setTrainingDayExerciseIds((current) => current.includes(exerciseId) ? current.filter((id) => id !== exerciseId) : [...current, exerciseId]);
  };

  const buttonStyle = {
    width: "100%",
    height: 42,
    borderRadius: 9,
    border: "1px solid #314557",
    color: "#FFFFFF",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
  } as const;

  const renderAnimationManagement = () => (
    <AnimationManagementView
      search={animationSearch}
      onSearchChange={setAnimationSearch}
      category={animationCategory}
      onCategoryChange={setAnimationCategory}
      onClose={onCloseAnimationManagement}
      onNewExercise={() => {
        setEditingAnimationId(null);
        resetAnimation();
        setAnimationStep(2);
      }}
      onLoadExercise={(
        exerciseId,
        edit
      ) => {
        setEditingAnimationId(
          edit ? exerciseId : null
        );
        onCloseAnimationManagement?.();
        setAnimationStep(2);
      }}
      onPreviewExercise={setPreviewExerciseId}
      trainingDayMode={false}
      selectedExerciseIds={trainingDayExerciseIds}
      onToggleTrainingExercise={toggleTrainingDayExercise}
    />
  );

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        overflow: "hidden",
        padding: 12,
        boxSizing: "border-box",
      }}
    >
      {activePanel === "players" && <PlayersPanel />}

      {activePanel === "ball" && <BallPanel />}

      {activePanel === "equipment" && <EquipmentPanel />}

      {activePanel === "court" && <CourtPanel />}

      {activePanel === "draw" && <DrawingTab />}

      {activePanel === "animation" && (
        <>
          {isTrainingDayOpen ? (
            createPortal(
              <AnimationManagementView
                search={animationSearch}
                onSearchChange={setAnimationSearch}
                category={animationCategory}
                onCategoryChange={setAnimationCategory}
                onClose={() => setIsTrainingDayOpen(false)}
                onNewExercise={() => {
                  setIsTrainingDayOpen(false);
                  setEditingAnimationId(null);
                  resetAnimation();
                  setAnimationStep(2);
                }}
                onLoadExercise={(exerciseId, edit) => {
                  setEditingAnimationId(edit ? exerciseId : null);
                  setIsTrainingDayOpen(false);
                  onCloseAnimationManagement?.();
                  setAnimationStep(2);
                }}
                onPreviewExercise={setPreviewExerciseId}
                trainingDayMode
                selectedExerciseIds={trainingDayExerciseIds}
                onToggleTrainingExercise={toggleTrainingDayExercise}
              />,
              document.body
            )
          ) : isAnimationManagementOpen ? (
            renderAnimationManagement()
          ) : (
            <>
              {/* مرحله ۱: فقط ورود به ساخت انیمیشن */}
              {animationStep === 1 && (
                <div
                  style={{
                    width: "100%",
                    direction: "rtl",
                    color: "#FFFFFF",
                  }}
                >
                  <div
                    style={{
                      padding: 13,
                      borderRadius: 11,
                      border: "1px solid #314557",
                      background: "#172532",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        marginBottom: 10,
                        textAlign: "right",
                      }}
                    >
                      🎬 ساخت انیمیشن
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingAnimationId(null);
                        resetAnimation();
                        setAnimationStep(2);
                      }}
                      style={{
                        ...buttonStyle,
                        background: "#2588E8",
                      }}
                    >
                      ایجاد انیمیشن
                    </button>

                    <button
                      type="button"
                      onClick={onOpenAnimationManagement}
                      style={{
                        ...buttonStyle,
                        marginTop: 8,
                        background: "#1E2D3B",
                      }}
                    >
                      📚 کتابخانه تمرین‌ها
                    </button>

                    <button type="button" onClick={() => { setAnimationSearch(""); setAnimationCategory("همه"); setIsTrainingDayOpen(true); }} style={{ ...buttonStyle, marginTop: 8, background: trainingDayExerciseIds.length > 0 ? "linear-gradient(135deg, #27445A 0%, #1A2E3D 100%)" : "#1A2733", border: trainingDayExerciseIds.length > 0 ? "1px solid #4BB7FF" : "1px solid #314557" }}>
                      📋 تمرین روز{trainingDayExerciseIds.length > 0 ? `  (${trainingDayExerciseIds.length})` : ""}
                    </button>
                  </div>
                </div>
              )}

              {/* مرحله ۲: صفحه اصلی ساخت انیمیشن */}
              {animationStep === 2 && (
                  <AnimationTab
                  editingAnimationId={editingAnimationId}
                  onBack={() => {
                    setEditingAnimationId(null);
                    setAnimationStep(1);
                  }}
                  onSave={() => {
                    setEditingAnimationId(null);
                    setAnimationStep(1);
                    onOpenAnimationManagement?.();
                  }}
                />
              )}
            </>
          )}
        </>
      )}

      {activePanel === "settings" && (
        <div style={{ padding: 20 }}>
          Settings
        </div>
      )}

      {previewExerciseId && (() => {
        const previewExercise = savedAnimations.find((item) => item.id === previewExerciseId);
        if (!previewExercise) return null;
        return createPortal(
          <ExercisePreviewPlayer
            exercise={previewExercise}
            onClose={() => setPreviewExerciseId(null)}
          />,
          document.body
        );
      })()}
    </div>
  );
}
