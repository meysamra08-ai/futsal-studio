import { useUI } from "../../core/contexts/UIContext";

import EquipmentPanel from "./EquipmentPanel";

import CourtPanel from "./CourtPanel";
import PlayersPanel from "./PlayersPanel";
import BallPanel from "../Ball/BallPanel";

export default function RightPanel() {
  const { activePanel } = useUI();

  return (
    <div
  style={{
    height: "100%",
    overflowY: "auto",
    padding: 16,
  }}
>
      {activePanel === "players" && <PlayersPanel />}
      
      {activePanel === "ball" && <BallPanel />}
      
      {activePanel === "equipment" && (
        <EquipmentPanel />
      )}

      {activePanel === "court" && <CourtPanel />}

      {activePanel === "draw" && (
        <div style={{ padding: 20 }}>
          Draw Tools
        </div>
      )}

      {activePanel === "animation" && (
        <div style={{ padding: 20 }}>
          Animation
        </div>
      )}

      {activePanel === "settings" && (
        <div style={{ padding: 20 }}>
          Settings
        </div>
    
      )}
   
   
    </div>
  );
}