import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";


/* =========================================================
   Animation Types
   ========================================================= */

export type AnimationKeyframe<T = unknown> = {
  id: string;
  time: number;
  objects: T[];
  drawings?: unknown[];
};

export type AnimationMovement = {
  id: string;
  name: string;
  objectIds: string[];
  from: PositionObject[];
  to: PositionObject[];
};

export type AnimationFrame = {
  id: string;
  name: string;
  duration: number;
  movements: AnimationMovement[];
  keyframeId: string;
};

export type SavedAnimation = {
  id: string;
  title: string;
  category: string;
  frames: number;
  duration: string;
  keyframes: AnimationKeyframe<PositionObject>[];
  animationFrames: AnimationFrame[];
  note?: string;
  courtWidth?: number;
  courtHeight?: number;
};


type PositionObject = {
  id?: string;
  x?: number;
  y?: number;
};


interface AnimationContextType {
  isPlaying: boolean;
  playbackEnded: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  loop: boolean;

  keyframes: AnimationKeyframe<PositionObject>[];
  frames: AnimationFrame[];
  activeFrameId: string | null;

  savedAnimations: SavedAnimation[];
  saveAnimation: (title?: string, category?: string) => SavedAnimation | null;
  updateSavedAnimationMetadata: (
    id: string,
    title?: string,
    category?: string,
    note?: string
  ) => SavedAnimation | null;
  deleteSavedAnimation: (id: string) => void;
  copySavedAnimation: (id: string) => SavedAnimation | null;
  loadSavedAnimation: (id: string, edit?: boolean) => SavedAnimation | null;
  editingSavedAnimationId: string | null;
  updateSavedAnimation: (
    id: string,
    title?: string,
    category?: string
  ) => SavedAnimation | null;

  isRecording: boolean;

  startRecording: <T extends PositionObject>(
    initialObjects?: T[]
  ) => void;
  stopRecording: () => void;

  recordSnapshot: <T extends PositionObject>(
    objects: T[]
  ) => void;

  recordSceneSnapshot: <T extends PositionObject>(
    objects: T[],
    drawings: unknown[]
  ) => void;

  getInterpolatedDrawings: <T>(
    drawings: T[]
  ) => T[];

  play: () => void;
  pause: () => void;
  stop: () => void;

  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  toggleLoop: () => void;

  addKeyframe: <T extends PositionObject>(
    objects: T[]
  ) => void;

  stepDuration: number;
  setStepDuration: (duration: number) => void;

  recordMovement: <T extends PositionObject>(
    objects: T[]
  ) => void;

  createFrame: <T extends PositionObject>(
    objects: T[]
  ) => void;
  selectFrame: (id: string) => void;
  deleteFrame: (id: string) => void;

  removeKeyframe: (id: string) => void;
  clearKeyframes: () => void;

  previousKeyframe: () => void;
  nextKeyframe: () => void;

  resetAnimation: () => void;

  getInterpolatedObjects: <
    T extends PositionObject
  >(
    objects: T[]
  ) => T[];
}


const AnimationContext =
  createContext<
    AnimationContextType | null
  >(null);


const cloneObjects = <T,>(
  objects: T[]
): T[] =>
  JSON.parse(
    JSON.stringify(objects)
  );

const cloneValue = <T,>(value: T): T =>
  JSON.parse(JSON.stringify(value));


const clamp = (
  value: number,
  min: number,
  max: number
) =>
  Math.max(
    min,
    Math.min(
      value,
      max
    )
  );


export function AnimationProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [
    isPlaying,
    setIsPlaying,
  ] = useState(false);
  const [
    playbackEnded,
    setPlaybackEnded,
  ] = useState(false);


  const [
    currentTime,
    setCurrentTimeState,
  ] = useState(0);


  const [
    duration,
    setDurationState,
  ] = useState(12);


  const [
    playbackSpeed,
    setPlaybackSpeedState,
  ] = useState(1);


  const [
    loop,
    setLoop,
  ] = useState(false);


  const [
    keyframes,
    setKeyframes,
  ] = useState<
    AnimationKeyframe<PositionObject>[]
  >([]);

  const [frames, setFrames] =
    useState<AnimationFrame[]>([]);

  const [savedAnimations, setSavedAnimations] =
    useState<SavedAnimation[]>([]);

  const [activeFrameId, setActiveFrameId] =
    useState<string | null>(null);

  // During dragging we only keep the latest scene as a draft.
  // A real frame is created ONLY when the user presses «ایجاد فرم».
  const pendingSceneRef =
    useRef<{
      objects: PositionObject[];
      drawings: unknown[];
    } | null>(null);

  // Initial scene for the current recording session.
  // It is never shown as a frame; it is only the starting point
  // used to calculate the first real movement.
  const baselineSceneRef =
    useRef<PositionObject[] | null>(null);
  const creatingFrameRef =
    useRef(false);

  // Synchronous sources of truth. React state updates are asynchronous,
  // so frame creation never reads a stale keyframes/frames/currentTime value.
  const keyframesRef =
    useRef<AnimationKeyframe<PositionObject>[]>([]);
  const framesRef =
    useRef<AnimationFrame[]>([]);
  const currentTimeRef =
    useRef(0);
  const durationRef =
    useRef(12);

  const [
    isRecording,
    setIsRecording,
  ] = useState(false);

  // Persists edit mode independently from the RightPanel mount/unmount cycle.
  const [
    editingSavedAnimationId,
    setEditingSavedAnimationId,
  ] = useState<string | null>(null);

  const [
    stepDuration,
    setStepDurationState,
  ] = useState(1);

  const animationFrameRef =
    useRef<number | null>(null);


  const lastFrameTimeRef =
    useRef<number | null>(null);


  /* =========================================================
     Playback
     ========================================================= */

  const play = () => {
    const committedFrames =
      framesRef.current;

    if (committedFrames.length === 0) {
      return;
    }

    const lastKeyframe =
      keyframesRef.current[
        keyframesRef.current.length - 1
      ];

    const playbackDuration =
      lastKeyframe?.time ?? 0;

    if (playbackDuration <= 0) {
      return;
    }

    // هر بار Play از فریم اول شروع می‌شود.
    // بعد از پایان پخش، تایم روی فریم آخر باقی می‌ماند.
    // بنابراین Play بعدی دوباره کل انیمیشن را از ابتدا اجرا می‌کند.
    if (
      currentTimeRef.current >=
      playbackDuration
    ) {
      currentTimeRef.current = 0;
      setCurrentTimeState(0);
    }

    setPlaybackEnded(false);
    setIsPlaying(true);
  };


  const pause = () => {

    setIsPlaying(false);
  };


  const stop = () => {

    setIsPlaying(false);
    setPlaybackEnded(false);

    currentTimeRef.current = 0;
    setCurrentTimeState(0);

    lastFrameTimeRef.current =
      null;
  };


  /* =========================================================
     Timeline
     ========================================================= */

  const setCurrentTime = (
    time: number
  ) => {
    const next = clamp(
      time,
      0,
      durationRef.current
    );

    currentTimeRef.current = next;
    setCurrentTimeState(next);
  };


  const setDuration = (
    nextDuration: number
  ) => {

    const safeDuration =
      clamp(
        Number(nextDuration) || 1,
        1,
        300
      );


    durationRef.current = safeDuration;

    setDurationState(
      safeDuration
    );

    setCurrentTimeState(
      (previous) => {
        const next = clamp(
          previous,
          0,
          safeDuration
        );
        currentTimeRef.current = next;
        return next;
      }
    );
  };


  /* =========================================================
     Speed / Loop
     ========================================================= */

  const setPlaybackSpeed = (
    speed: number
  ) => {

    setPlaybackSpeedState(
      clamp(
        speed,
        0.25,
        4
      )
    );
  };


  const toggleLoop = () => {

    setLoop(
      (previous) =>
        !previous
    );
  };

  const setStepDuration = (
    value: number
  ) => {
    setStepDurationState(
      clamp(
        Number(value) || 1,
        0.25,
        10
      )
    );
  };


  /* =========================================================
     Keyframes
     ========================================================= */

  const startRecording = <
    T extends PositionObject
  >(
    initialObjects?: T[]
  ) => {
    setEditingSavedAnimationId(null);
    setIsPlaying(false);
    setPlaybackEnded(false);
    currentTimeRef.current = 0;
    setCurrentTimeState(0);

    keyframesRef.current = [];
    framesRef.current = [];
    setKeyframes([]);
    setFrames([]);
    setActiveFrameId(null);

    lastFrameTimeRef.current = null;
    pendingSceneRef.current = null;
    creatingFrameRef.current = false;

    if (initialObjects) {
      const baseline =
        cloneObjects(initialObjects);

      baselineSceneRef.current = baseline;

      // Hidden baseline keyframe at t=0. It is not displayed as a frame.
      const baselineKeyframe: AnimationKeyframe<PositionObject> = {
        id: crypto.randomUUID(),
        time: 0,
        objects: baseline,
        drawings: [],
      };

      keyframesRef.current = [baselineKeyframe];
      setKeyframes([baselineKeyframe]);
    } else {
      baselineSceneRef.current = null;
    }

    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    lastFrameTimeRef.current = null;
  };

  const recordSnapshot = <
    T extends PositionObject
  >(
    objects: T[]
  ) => {
    pendingSceneRef.current = {
      objects: cloneObjects(objects),
      drawings:
        pendingSceneRef.current?.drawings ?? [],
    };
  };

  const recordSceneSnapshot = <
    T extends PositionObject
  >(
    objects: T[],
    drawings: unknown[]
  ) => {
    pendingSceneRef.current = {
      objects: cloneObjects(objects),
      drawings: cloneObjects(drawings),
    };
  };

  const addMovementToFrame = <
    T extends PositionObject
  >(
    objects: T[]
  ) => {
    pendingSceneRef.current = {
      objects: cloneObjects(objects),
      drawings:
        pendingSceneRef.current?.drawings ?? [],
    };
  };

  const recordMovement = addMovementToFrame;



  function getInterpolatedDrawings<T>(
    drawings: T[]
  ): T[] {
    return drawings;
  }

  const addKeyframe = <
    T extends PositionObject
  >(
    objects: T[]
  ) => {
    recordMovement(objects);
  };

  const removeKeyframe = (
    id: string
  ) => {

    setKeyframes(
      (previous) =>
        previous.filter(
          (item) =>
            item.id !== id
        )
    );
  };


  const clearKeyframes = () => {

    setKeyframes([]);
  };


  /* =========================================================
     Previous / Next Keyframe
     ========================================================= */

  const previousKeyframe = () => {

    if (
      keyframes.length === 0
    ) {
      setCurrentTime(0);
      return;
    }


    const previous =
      [...keyframes]
        .reverse()
        .find(
          (item) =>
            item.time <
            currentTime - 0.01
        );


    if (previous) {

      setCurrentTime(
        previous.time
      );

      return;
    }


    setCurrentTime(
      keyframes[0].time
    );
  };


  const nextKeyframe = () => {

    if (
      keyframes.length === 0
    ) {
      setCurrentTime(
        duration
      );

      return;
    }


    const next =
      keyframes.find(
        (item) =>
          item.time >
          currentTime + 0.01
      );


    if (next) {

      setCurrentTime(
        next.time
      );

      return;
    }


    setCurrentTime(
      duration
    );
  };


  const createFrame = <
    T extends PositionObject
  >(
    objects: T[]
  ) => {
    if (creatingFrameRef.current) return;

    const snapshot = cloneObjects(objects) as T[];

    const committedKeyframes =
      keyframesRef.current;

    const previous =
      committedKeyframes.length > 0
        ? (committedKeyframes[
            committedKeyframes.length - 1
          ].objects as T[])
        : (baselineSceneRef.current as T[] | null);

    if (!previous) return;

    const movements = snapshot.reduce<AnimationMovement[]>(
      (result, to) => {
        const from = previous.find(
          (item) => item.id === to.id
        );

        // اگر بازیکن/مانع جدیدی به Board اضافه شده باشد،
        // نبودن آن در فریم قبلی نباید باعث شود فریم ساخته نشود.
        // برای این آبجکت یک movement صفر-طول ثبت می‌کنیم تا
        // keyframe جدید به‌عنوان ادامه همان Timeline ذخیره شود.
        if (!from) {
          result.push({
            id: crypto.randomUUID(),
            name: `افزودن ${to.id ?? "آبجکت"}`,
            objectIds: to.id ? [to.id] : [],
            from: [cloneValue(to)],
            to: [cloneValue(to)],
          });

          return result;
        }

        if (
          JSON.stringify(from) ===
          JSON.stringify(to)
        ) {
          return result;
        }

        result.push({
          id: crypto.randomUUID(),
          name: `حرکت ${to.id ?? "بازیکن"}`,
          objectIds: to.id ? [to.id] : [],
          from: [cloneValue(from)],
          to: [cloneValue(to)],
        });

        return result;
      },
      []
    );

    // اگر آبجکت جدید اضافه شده باشد، movement بالا اجازه می‌دهد
    // فریم حتی بدون جابه‌جایی سایر بازیکن‌ها نیز ساخته شود.
    // در غیر این صورت همچنان از ساخت فریم کاملاً خالی جلوگیری می‌کنیم.
    if (movements.length === 0) {
      pendingSceneRef.current = null;
      return;
    }

    creatingFrameRef.current = true;

    const previousTime =
      currentTimeRef.current;

    const nextTime = Number(
      (
        previousTime +
        stepDuration
      ).toFixed(2)
    );

    // Automatically extend the animation duration when the user creates
    // more frames than the original 12-second canvas.
    const nextDuration =
      Math.max(
        durationRef.current,
        nextTime
      );

    const frameId = crypto.randomUUID();
    const keyframeId = crypto.randomUUID();

    const committedFrames =
      framesRef.current;

    const newFrame: AnimationFrame = {
      id: frameId,
      name: `فریم ${committedFrames.length + 1}`,
      duration: stepDuration,
      movements,
      keyframeId,
    };

    const newKeyframe:
      AnimationKeyframe<PositionObject> = {
      id: keyframeId,
      time: nextTime,
      objects: snapshot,
      drawings: cloneObjects(
        pendingSceneRef.current?.drawings ?? []
      ),
    };

    // Update refs FIRST. This makes consecutive button presses lossless,
    // even before React has rendered the previous state update.
    framesRef.current = [
      ...committedFrames,
      newFrame,
    ];

    keyframesRef.current = [
      ...committedKeyframes,
      newKeyframe,
    ];

    currentTimeRef.current =
      nextTime;

    durationRef.current =
      nextDuration;

    // Then publish the exact same arrays to React state.
    setFrames(framesRef.current);
    setKeyframes(
      keyframesRef.current
    );
    setActiveFrameId(frameId);
    setDurationState(nextDuration);
    setCurrentTimeState(nextTime);

    baselineSceneRef.current =
      cloneObjects(snapshot);

    pendingSceneRef.current = null;
    creatingFrameRef.current = false;
  };

  const selectFrame = (id: string) => {
    setActiveFrameId(id);
  };

  const deleteFrame = (id: string) => {
    const index =
      framesRef.current.findIndex(
        (frame) => frame.id === id
      );

    if (index < 0) return;

    const frame =
      framesRef.current[index];

    framesRef.current =
      framesRef.current.filter(
        (item) => item.id !== id
      );

    keyframesRef.current =
      keyframesRef.current.filter(
        (item) =>
          item.id !== frame.keyframeId
      );

    setFrames(framesRef.current);
    setKeyframes(keyframesRef.current);

    if (activeFrameId === id) {
      const replacement =
        framesRef.current[
          Math.max(
            0,
            index - 1
          )
        ]?.id ?? null;

      setActiveFrameId(
        replacement
      );
    }
  };

  /* =========================================================
     Saved Animations
     ========================================================= */

  const getCurrentCourtSize = () => {
    if (typeof document === "undefined") {
      return { courtWidth: undefined, courtHeight: undefined };
    }

    const image = document.querySelector(
      'img[src="/courts/futsal.png"]'
    ) as HTMLImageElement | null;

    const court = image?.parentElement;
    const rect = court?.getBoundingClientRect();

    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return { courtWidth: undefined, courtHeight: undefined };
    }

    return {
      courtWidth: rect.width,
      courtHeight: rect.height,
    };
  };

  const saveAnimation = (
    title = "تمرین جدید",
    category = "سایر"
  ): SavedAnimation | null => {
    const currentFrames = framesRef.current;

    if (currentFrames.length === 0) {
      return null;
    }

    const saved: SavedAnimation = {
      id: crypto.randomUUID(),
      title: title.trim() || "تمرین جدید",
      category,
      frames: currentFrames.length,
      duration: `${durationRef.current} ثانیه`,
      keyframes: cloneObjects(keyframesRef.current),
      animationFrames: cloneObjects(currentFrames),
      note: "",
      ...getCurrentCourtSize(),
    };

    setSavedAnimations((current) => [...current, saved]);

    return saved;
  };

  const updateSavedAnimationMetadata = (
    id: string,
    title?: string,
    category?: string,
    note?: string
  ): SavedAnimation | null => {
    const existing = savedAnimations.find((item) => item.id === id);
    if (!existing) return null;

    const updated: SavedAnimation = {
      ...existing,
      title: title?.trim() || existing.title || "تمرین جدید",
      category: category || existing.category || "سایر",
      note: note ?? existing.note ?? "",
    };

    setSavedAnimations((current) =>
      current.map((item) => (item.id === id ? updated : item))
    );

    return cloneValue(updated);
  };

  const deleteSavedAnimation = (id: string) => {
    setSavedAnimations((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const copySavedAnimation = (id: string): SavedAnimation | null => {
    const source = savedAnimations.find(
      (item) => item.id === id
    );

    if (!source) {
      return null;
    }

    const copied = cloneValue(source);
    copied.id = crypto.randomUUID();
    copied.title = `${source.title} - کپی`;

    setSavedAnimations((current) => [
      ...current,
      copied,
    ]);

    return copied;
  };


  const loadSavedAnimation = (
    id: string,
    edit = false
  ): SavedAnimation | null => {
    const saved = savedAnimations.find(
      (item) => item.id === id
    );

    if (!saved) {
      return null;
    }

    setIsPlaying(false);
    setPlaybackEnded(false);
    setIsRecording(false);
    setEditingSavedAnimationId(edit ? id : null);

    const loadedKeyframes =
      cloneObjects(saved.keyframes);

    const loadedFrames =
      cloneObjects(saved.animationFrames);

    // The saved animation contains the complete timeline. Keep all
    // committed frames/keyframes in the synchronous refs so a new frame
    // is appended to the existing animation instead of replacing it.

    keyframesRef.current =
      loadedKeyframes;

    framesRef.current =
      loadedFrames;

    setKeyframes(loadedKeyframes);
    setFrames(loadedFrames);

    const firstFrame = loadedFrames[0] ?? null;
    const lastFrame =
      loadedFrames[loadedFrames.length - 1] ?? null;

    const lastKeyframe =
      loadedKeyframes[loadedKeyframes.length - 1] ?? null;

    // Normal load starts from the beginning.
    // Edit load MUST open on the final saved frame so the coach can
    // immediately continue editing from the exact last position.
    setActiveFrameId(
      edit
        ? lastFrame?.id ?? null
        : firstFrame?.id ?? null
    );

    const loadedDuration =
      lastKeyframe?.time ?? 0;

    const safeDuration =
      Math.max(1, loadedDuration);

    durationRef.current =
      safeDuration;

    setDurationState(
      safeDuration
    );

    const initialTime =
      edit
        ? lastKeyframe?.time ?? 0
        : 0;

    currentTimeRef.current =
      initialTime;

    setCurrentTimeState(
      initialTime
    );

    lastFrameTimeRef.current = null;
    pendingSceneRef.current = null;
    creatingFrameRef.current = false;

    // For editing, the baseline for the NEXT new frame must be the
    // last saved keyframe, not the first one. The existing timeline
    // itself remains untouched.

    baselineSceneRef.current =
      lastKeyframe
        ? cloneObjects(
            lastKeyframe.objects
          )
        : null;

    // Edit mode keeps recording enabled only as the "editing session"
    // flag so Create Frame can append to the loaded timeline.
    // Normal load remains playback-only.
    setIsRecording(edit);

    return cloneValue(saved);
  };


  const updateSavedAnimation = (
    id: string,
    title?: string,
    category?: string
  ): SavedAnimation | null => {
    const currentFrames = framesRef.current;

    if (currentFrames.length === 0) {
      return null;
    }

    const existing = savedAnimations.find(
      (item) => item.id === id
    );

    if (!existing) {
      return null;
    }

    const updated: SavedAnimation = {
      ...existing,
      title:
        title?.trim() ||
        existing.title ||
        "تمرین جدید",
      category:
        category ||
        existing.category ||
        "سایر",
      frames: currentFrames.length,
      duration: `${durationRef.current} ثانیه`,
      keyframes: cloneObjects(
        keyframesRef.current
      ),
      animationFrames: cloneObjects(
        currentFrames
      ),
    };

    setSavedAnimations((current) =>
      current.map((item) =>
        item.id === id
          ? updated
          : item
      )
    );

    return cloneValue(updated);
  };


  /* =========================================================
     Reset Animation
     فقط Animation را ریست می‌کند.
     به Board / Players / Lines دست نمی‌زند.
     ========================================================= */

  const resetAnimation = () => {

    setIsPlaying(false);
    setIsRecording(false);
    setEditingSavedAnimationId(null);

    setCurrentTimeState(0);

    setPlaybackSpeedState(1);

    setLoop(false);
    setStepDurationState(1);

    setKeyframes([]);
    setFrames([]);
    keyframesRef.current = [];
    framesRef.current = [];
    currentTimeRef.current = 0;
    durationRef.current = 12;
    setActiveFrameId(null);
    pendingSceneRef.current = null;
    baselineSceneRef.current = null;
    creatingFrameRef.current = false;

    setDurationState(12);

    lastFrameTimeRef.current =
      null;
  };


  /* =========================================================
     Interpolation
     ========================================================= */

  const getInterpolatedObjects = <
    T extends PositionObject
  >(
    objects: T[]
  ): T[] => {
    const renderKeyframes =
      keyframesRef.current;
    const renderTime =
      currentTimeRef.current;

    if (renderKeyframes.length === 0) {
      return objects;
    }

    const first =
      renderKeyframes[0];

    const baseline =
      baselineSceneRef.current;

    /*
     * Before the first committed keyframe:
     * render only objects that existed in the baseline.
     * This prevents objects added later during editing from
     * appearing in earlier playback.
     */
    if (
      renderTime < first.time &&
      baseline
    ) {
      const range = first.time;

      const progress =
        range <= 0
          ? 1
          : clamp(
              renderTime / range,
              0,
              1
            );

      const eased =
        progress *
        progress *
        (3 - 2 * progress);

      return baseline
        .map((base) => {
          const end =
            first.objects.find(
              (item) =>
                item.id === base.id
            );

          if (!end) {
            return {
              ...(base as T),
            } as T;
          }

          const startX =
            typeof base.x === "number"
              ? base.x
              : 0;

          const startY =
            typeof base.y === "number"
              ? base.y
              : 0;

          const endX =
            typeof end.x === "number"
              ? end.x
              : startX;

          const endY =
            typeof end.y === "number"
              ? end.y
              : startY;

          return {
            ...(base as T),
            ...end,
            x:
              startX +
              (endX - startX) * eased,
            y:
              startY +
              (endY - startY) * eased,
          } as T;
        });
    }

    /*
     * Find the two committed keyframes surrounding the
     * current playback time.
     */
    let from =
      renderKeyframes[0];

    let to =
      renderKeyframes[
        renderKeyframes.length - 1
      ];

    for (
      let index = 0;
      index <
      renderKeyframes.length - 1;
      index++
    ) {
      const current =
        renderKeyframes[index];

      const next =
        renderKeyframes[index + 1];

      if (
        renderTime >= current.time &&
        renderTime <= next.time
      ) {
        from = current;
        to = next;
        break;
      }
    }

    /*
     * At/after a committed keyframe, render EXACTLY the
     * objects stored in that keyframe.
     *
     * This is the important fix for newly added players,
     * balls and equipment:
     * - they do not exist in earlier keyframes => invisible
     * - they exist from their creation keyframe onward => visible
     */
    if (renderTime >= to.time) {
      return to.objects.map((item) => {
        const base =
          objects.find(
            (candidate) =>
              candidate.id === item.id
          );

        return {
          ...((base ?? {}) as T),
          ...item,
        } as T;
      }) as T[];
    }

    const range =
      to.time - from.time;

    const progress =
      range <= 0
        ? 1
        : clamp(
            (renderTime - from.time) /
              range,
            0,
            1
          );

    const eased =
      progress *
      progress *
      (3 - 2 * progress);

    /*
     * Use the UNION of the two committed scenes.
     * Existing objects interpolate normally.
     * A newly-added object exists only in `to`, so it is
     * intentionally hidden until the exact `to.time`.
     * An object removed from `to` remains visible until
     * that keyframe is reached, then disappears.
     */
    const objectIds = Array.from(
      new Set([
        ...from.objects
          .map((item) => item.id)
          .filter(
            (id): id is string =>
              Boolean(id)
          ),
        ...to.objects
          .map((item) => item.id)
          .filter(
            (id): id is string =>
              Boolean(id)
          ),
      ])
    );

    return objectIds.flatMap((id): T[] => {
      const start =
        from.objects.find(
          (item) =>
            item.id === id
        );

      const end =
        to.objects.find(
          (item) =>
            item.id === id
        );

      /*
       * New object:
       * it is not rendered before its first committed
       * keyframe. It will appear in the exact-keyframe
       * branch above when renderTime reaches to.time.
       */
      if (!start && end) {
        return [];
      }

      /*
       * Object removed at the next keyframe:
       * keep showing its previous state until that keyframe.
       */
      if (start && !end) {
        const base =
          objects.find(
            (candidate) =>
              candidate.id === id
          );

        return [
          {
            ...(base ?? {}),
            ...start,
          } as T,
        ];
      }

      if (!start || !end) {
        return [];
      }

      const base =
        objects.find(
          (candidate) =>
            candidate.id === id
        );

      const startX =
        typeof start.x === "number"
          ? start.x
          : typeof base?.x === "number"
            ? base.x
            : 0;

      const startY =
        typeof start.y === "number"
          ? start.y
          : typeof base?.y === "number"
            ? base.y
            : 0;

      const endX =
        typeof end.x === "number"
          ? end.x
          : startX;

      const endY =
        typeof end.y === "number"
          ? end.y
          : startY;

      return [
        {
          ...(base ?? {}),
          ...start,
          x:
            startX +
            (endX - startX) * eased,
          y:
            startY +
            (endY - startY) * eased,
        } as T,
      ];
    });
  };

  /* =========================================================
     Recording Clock
     During recording the clock is controlled by «ایجاد فرم».
     Dragging/idle time must never create or shift a frame.
     ========================================================= */

  /* =========================================================
     Animation Clock
     ========================================================= */

  useEffect(() => {

    if (!isPlaying) {

      if (
        animationFrameRef.current !==
        null
      ) {

        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current =
          null;
      }


      lastFrameTimeRef.current =
        null;


      return;
    }


    const tick = (
      timestamp: number
    ) => {

      if (
        lastFrameTimeRef.current ===
        null
      ) {

        lastFrameTimeRef.current =
          timestamp;
      }


      const elapsed =
        (
          timestamp -
          lastFrameTimeRef.current
        ) / 1000;


      lastFrameTimeRef.current =
        timestamp;


      const playbackDuration =
        keyframesRef.current[
          keyframesRef.current.length - 1
        ]?.time ?? 0;

      const next =
        currentTimeRef.current +
        elapsed *
          playbackSpeed;

      if (
        next >= playbackDuration
      ) {
        if (loop) {
          currentTimeRef.current = 0;
          setCurrentTimeState(0);
        } else {
          currentTimeRef.current =
            playbackDuration;
          setCurrentTimeState(
            playbackDuration
          );
          setPlaybackEnded(true);
          setIsPlaying(false);
          return;
        }
      } else {
        currentTimeRef.current = next;
        setCurrentTimeState(next);
      }


      animationFrameRef.current =
        requestAnimationFrame(
          tick
        );
    };


    animationFrameRef.current =
      requestAnimationFrame(
        tick
      );


    return () => {

      if (
        animationFrameRef.current !==
        null
      ) {

        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current =
          null;
      }


      lastFrameTimeRef.current =
        null;
    };

  }, [
    isPlaying,
    playbackSpeed,    
    loop,
  ]);


  return (
    <AnimationContext.Provider
      value={{

        isPlaying,
        playbackEnded,

        currentTime,

        duration,

        playbackSpeed,

        loop,

        keyframes,
        frames,
        activeFrameId,
        createFrame,
        selectFrame,
        deleteFrame,

        isRecording,
        editingSavedAnimationId,
        startRecording,
        stopRecording,
        recordSnapshot,
        recordSceneSnapshot,
        getInterpolatedDrawings,


        play,

        pause,

        stop,


        setCurrentTime,

        setDuration,

        setPlaybackSpeed,

        toggleLoop,


        addKeyframe,
        recordMovement,
        stepDuration,
        setStepDuration,

        removeKeyframe,

        clearKeyframes,


        previousKeyframe,

        nextKeyframe,

        resetAnimation,

        savedAnimations,
        saveAnimation,
        updateSavedAnimationMetadata,
        deleteSavedAnimation,
        copySavedAnimation,
        loadSavedAnimation,
        updateSavedAnimation,

        getInterpolatedObjects,

      }}
    >
      {children}
    </AnimationContext.Provider>
  );
}


export function useAnimation() {

  const context =
    useContext(
      AnimationContext
    );


  if (!context) {

    throw new Error(
      "useAnimation must be used inside AnimationProvider"
    );
  }


  return context;
}
