import {
  createContext,
  useContext,
  useState,
} from "react";

import type {
  ReactNode,

} from "react";

import type {
  BoardObject,
  ToolType,
} from "../types/BoardObject";

import { useTeam } from "./TeamContext";

type BoardContextType = {
  
  objects: BoardObject[];

  selectedObjectId: string | null;

  addObject: (
    type: ToolType,
    x: number,
    y: number
  ) => void;

  moveObject: (
    id: string,
    x: number,
    y: number
  ) => void;

  selectObject: (
    id: string | null
  ) => void;

  rotateSelected: (
    delta: number
  ) => void;

  

  duplicateSelected: () => void;

  deleteSelected: () => void;

  undo: () => void;

  redo: () => void;

  setObjects: React.Dispatch<
  React.SetStateAction<BoardObject[]>
>;

// ===== Tools =====

scaleSelected: (scale: number) => void;

toggleLock: () => void;

resetScale: () => void;

bringForward: () => void;

sendBackward: () => void;

resetPlayers: () => void;

resetEquipment: () => void;

resetBalls: () => void;
  
};

const BoardContext =
  createContext<BoardContextType>({
    objects: [],

    selectedObjectId: null,

    addObject: () => {},

    moveObject: () => {},

    selectObject: () => {},

    rotateSelected: () => {},

    duplicateSelected: () => {},

    deleteSelected: () => {},

    undo: () => {},

    redo: () => {},

    setObjects: () => {},

// ===== Tools =====

scaleSelected: () => {},

toggleLock: () => {},

resetScale: () => {},

bringForward: () => {},

sendBackward: () => {},

resetPlayers: () => {},

resetEquipment: () => {},

resetBalls: () => {},

    
  });

export function BoardProvider({
  children,
}: {
  children: ReactNode;
}) {

 
  const {
  currentTeam,
  customColor,
} = useTeam();

  const [objects, setObjects] =
    useState<BoardObject[]>([]);

  const [
    selectedObjectId,
    setSelectedObjectId,
  ] = useState<string | null>(null);

  const [history, setHistory] =
    useState<BoardObject[][]>([]);

  const [future, setFuture] =
    useState<BoardObject[][]>([]);

  function saveHistory() {
    setHistory((prev) => [
      ...prev,
      structuredClone(objects),
    ]);

    setFuture([]);
  }

  function addObject(
    type: ToolType,
    x: number,
    y: number
  ) {
    if (!type) return;

    const playerCount = objects.filter(
  (o) =>
    o.type === "player" &&
    o.team === currentTeam
).length;

   const newObject: BoardObject = {
  id: crypto.randomUUID(),

  type,

  x,
  y,

  rotation: 0,

  // ===== New =====

  name :
    type === "player" ||
    type === "goalkeeper"
         ? ""
         :undefined,
  scale: 1,

  locked: false,

  zIndex: objects.length + 1,

  // ===============

  selected: false,

  number:
    type === "player"
      ? playerCount + 2
      : type === "goalkeeper"
      ? 1
      : undefined,

  team:
  type === "player" ||
  type === "goalkeeper"
    ? currentTeam
    : undefined,

teamColor:
  type === "player" ||
  type === "goalkeeper"
    ? customColor
    : undefined,
      
};

    saveHistory();

    setObjects((prev) => [
      ...prev,
      newObject,
    ]);
  }

 function moveObject(
  id: string,
  x: number,
  y: number
) {
  saveHistory();

  setObjects((prev) =>
    prev.map((obj) => {
      if (obj.id !== id) return obj;

      if (obj.locked) return obj;

      return {
        ...obj,
        x,
        y,
      };
    })
  );
}

  function selectObject(
    id: string | null
  ) {
    setSelectedObjectId(id);
  }

  function rotateSelected(
    delta: number
  ) {
    if (!selectedObjectId) return;

    saveHistory();

    setObjects((prev) =>
      prev.map((obj) =>
        obj.id === selectedObjectId
          ? {
              ...obj,
              rotation:
                obj.rotation + delta,
            }
          : obj
      )
    );
  }
function duplicateSelected() {
    if (!selectedObjectId) return;

    const obj = objects.find(
      (o) => o.id === selectedObjectId
    );

    if (!obj) return;

    saveHistory();

    setObjects((prev) => [
      ...prev,
      {
        ...obj,
        id: crypto.randomUUID(),
        x: obj.x + 30,
        y: obj.y + 30,
        selected: false,
        scale: obj.scale ?? 1,
        locked: false,
      },
    ]);
  }

  function deleteSelected() {
    if (!selectedObjectId) return;

    saveHistory();

    setObjects((prev) =>
      prev.filter(
        (o) => o.id !== selectedObjectId
      )
    );

    setSelectedObjectId(null);
  }

  function scaleSelected(scale: number) {
  if (!selectedObjectId) return;

  saveHistory();

  setObjects((prev) =>
    prev.map((obj) =>
      obj.id === selectedObjectId
        ? {
            ...obj,
            scale,
          }
        : obj
    )
  );
}

function toggleLock() {
  if (!selectedObjectId) return;

  saveHistory();

  setObjects((prev) =>
    prev.map((obj) =>
      obj.id === selectedObjectId
        ? {
            ...obj,
            locked: !obj.locked,
          }
        : obj
    )
  );
}
function resetScale() {
  if (!selectedObjectId) return;

  saveHistory();

  setObjects((prev) =>
    prev.map((obj) =>
      obj.id === selectedObjectId
        ? {
            ...obj,
            scale: 1,
          }
        : obj
    )
  );
}

function bringForward() {
  if (!selectedObjectId) return;

  saveHistory();

  setObjects((prev) =>
    prev.map((obj) =>
      obj.id === selectedObjectId
        ? {
            ...obj,
            zIndex: (obj.zIndex ?? 0) + 1,
          }
        : obj
    )
  );
}

function sendBackward() {
  if (!selectedObjectId) return;

  saveHistory();

  setObjects((prev) =>
    prev.map((obj) =>
      obj.id === selectedObjectId
        ? {
            ...obj,
            zIndex: Math.max(
              0,
              (obj.zIndex ?? 0) - 1
            ),
          }
        : obj
    )
  );

  
  
}

function resetPlayers() {
  saveHistory();

  setObjects(prev =>
    prev.filter(
      o =>
        o.type !== "player" &&
        o.type !== "goalkeeper"
    )
  );
}

function resetBalls() {
  saveHistory();

  setObjects(prev =>
    prev.filter(
      o => o.type !== "ball"
    )
  );
}

function resetEquipment() {
  saveHistory();

  setObjects(prev =>
    prev.filter(
      o =>
        o.type === "player" ||
        o.type === "goalkeeper" ||
        o.type === "ball"
    )
  );
}

  function undo() {
    if (history.length === 0) return;

    const last =
      history[history.length - 1];

    setFuture((prev) => [
      structuredClone(objects),
      ...prev,
    ]);

    setObjects(last);

    setHistory((prev) =>
      prev.slice(0, -1)
    );
  }

  function redo() {
    if (future.length === 0) return;

    const next = future[0];

    setHistory((prev) => [
      ...prev,
      structuredClone(objects),
    ]);

    setObjects(next);

    setFuture((prev) =>
      prev.slice(1)
    );
  }

  return (
  <BoardContext.Provider
    value={{
      objects,
      selectedObjectId,

      addObject,
      moveObject,
      selectObject,

      rotateSelected,
      duplicateSelected,
      deleteSelected,

      undo,
      redo,

     setObjects,

// ===== Tools =====

      scaleSelected,

      toggleLock,

      resetScale,

      bringForward,

      sendBackward,

      resetPlayers,

resetEquipment,

resetBalls,

    }}
  >
    {children}
  </BoardContext.Provider>
);
}

export function useBoard() {
  return useContext(BoardContext);
}