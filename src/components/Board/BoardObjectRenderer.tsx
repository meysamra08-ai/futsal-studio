import type { BoardObject } from "../../types/BoardObject";
import { objectConfig } from "../../config/objectConfig";

import Player from "./Player";
import Goalkeeper from "./Goalkeeper";

import cone from "../../assest/equipment/cone.svg";
import ball from "../../assest/equipment/ball.svg";
import dummy from "../../assest/equipment/dummy.svg";
import pole from "../../assest/equipment/pole.svg";
import ring from "../../assest/equipment/ring.svg";
import ladder from "../../assest/equipment/ladder.svg";
import goal from "../../assest/equipment/goal.svg";

const icons: Record<string, string> = {
  cone,
  ball,
  dummy,
  pole,
  ring,
  ladder,
  goal,
};

interface Props {
  object: BoardObject;
}

export default function BoardObjectRenderer({
  object,
}: Props) {
  // -------------------------
  // Player
  // -------------------------

  console.log({
  team: object.team,
  teamColor: object.teamColor,
});

  if (object.type === "player") {
    return (
    <Player
  color={
    object.team === "red"
      ? "#E53935"
      : object.team === "custom"
      ? object.teamColor ?? "#22C55E"
      : "#1E88E5"
  }
  number={object.number}

/>
    );
  }

  // -------------------------
  // Goalkeeper
  // -------------------------
  if (object.type === "goalkeeper") {
    return (
      <Goalkeeper
  color={
    object.team === "red"
      ? "#FDD835"
      : object.team === "custom"
      ? object.teamColor ?? "#22C55E"
      : "#43A047"
  }
  number={object.number}
 
/>
    );
  }

  // -------------------------
  // Equipment
  // -------------------------
  const config =
    object.type &&
    object.type in objectConfig
      ? objectConfig[
          object.type as keyof typeof objectConfig
        ]
      : undefined;

  const size = config?.size ?? 40;

  const icon =
    icons[object.type ?? ""] ?? "";

console.log(object.id, object.scale, object.locked);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transform: 
        `rotate(${object.rotation}deg)
        scale(${object.scale ?? 1})`
,
        userSelect: "none",
        pointerEvents: "none",
      }}
    >
      {icon && (
        <img
          src={icon}
          alt={object.type ?? ""}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      )}
    </div>
  );
}