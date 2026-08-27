import { useState } from "react";

import EquipmentTab from "./EquipmentTab";
import DrawingTab from "./DrawingTab";

import { Theme } from "../../shared/theme/theme";

import SelectionTools from "../../shared/components/SelectionTools";


type TabType =
  | "players"
  | "equipment"
  | "drawing";


export default function EquipmentPanel() {

  const [tab, setTab] =
    useState<TabType>("players");


  /* =====================================================
     استایل تب‌ها
     ===================================================== */

  const buttonStyle = (
    active: boolean
  ): React.CSSProperties => ({
    flex: 1,

    padding: "12px",

    border: "none",

    cursor: "pointer",

    background: active
      ? Theme.colors.primary
      : Theme.colors.panelSecondary,

    color: Theme.colors.text,

    fontWeight: 600,

    transition:
      "all 0.2s ease",
  });


  return (

    <div
      style={{
        display: "flex",

        flexDirection: "column",

        height: "100%",
      }}
    >

      {/* =================================================
          Tabs
          ================================================= */}

      <div
        style={{
          display: "flex",

          borderBottom:
            "1px solid #444",
        }}
      >

        {/* ===============================
            Players
            =============================== */}

        <button
          style={buttonStyle(
            tab === "players"
          )}

          onClick={() =>
            setTab("players")
          }
        >
          👕 Players
        </button>


        {/* ===============================
            Equipment
            =============================== */}

        <button
          style={buttonStyle(
            tab === "equipment"
          )}

          onClick={() =>
            setTab("equipment")
          }
        >
          🛠 Equipment
        </button>


        {/* ===============================
            Selection Tools
            =============================== */}

        <SelectionTools
          showRotate
          showScale
          showLock
        />


        {/* ===============================
            Lines
            =============================== */}

        <button
          style={buttonStyle(
            tab === "drawing"
          )}

          onClick={() =>
            setTab("drawing")
          }
        >
          ✏️ خطوط
        </button>

      </div>


      {/* =================================================
          Content
          ================================================= */}

      <div
        style={{
          flex: 1,

          padding: 15,

          overflowY: "auto",
        }}
      >

        {/* Players */}

        {tab === "players" && (
          <div>
            <h3
              style={{
                color:
                  Theme.colors.text,
              }}
            >
              Players
            </h3>
          </div>
        )}


        {/* Equipment */}

        {tab === "equipment" && (
          <EquipmentTab />
        )}


        {/* Lines */}

        {tab === "drawing" && (
          <DrawingTab />
        )}

      </div>

    </div>
  );
}