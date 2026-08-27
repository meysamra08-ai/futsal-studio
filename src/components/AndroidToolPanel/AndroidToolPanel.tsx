import { useState } from "react";
import { useUI } from "../../core/contexts/UIContext";

import "./AndroidToolPanel.css";

type MainTab =
  | "players"
  | "equipment"
  | "paths"
  | "text"
  | "clear"
  | "animation";

type PlayerTool =
  | "ball"
  | "team1"
  | "team2"
  | "team3"
  | "goalkeeper";

export default function AndroidToolPanel() {
  const {
    setActivePanel,
    setActiveTool,
    setMode,
  } = useUI();

  const [open, setOpen] = useState(true);

  const [activeTab, setActiveTab] =
    useState<MainTab>("players");

  const [selectedPlayerTool, setSelectedPlayerTool] =
    useState<PlayerTool>("ball");

  const [selectedNumber, setSelectedNumber] =
    useState<number | null>(null);

  const [, setSelectedTeam] =
    useState<
      "team1" |
      "team2" |
      "team3" |
      "goalkeeper" |
      null
    >(null);

  // =====================================================
  // TAB SELECTION
  // =====================================================

  const selectTab = (tab: MainTab) => {
    setActiveTab(tab);

    if (tab === "players") {
      setActivePanel("players");
    }

    if (tab === "equipment") {
      setActivePanel("equipment");
    }

    if (tab === "paths") {
      setActivePanel("draw");
    }

    if (tab === "animation") {
      setActivePanel("animation");
    }

    if (tab === "text") {
      setActivePanel("draw");
      setActiveTool("text");
      setMode("add");
    }

    if (tab === "clear") {
      setActivePanel("draw");
      setActiveTool("clear");
      setMode("select");
    }
  };

  // =====================================================
  // PLAYER TOOL
  // =====================================================

  const selectPlayerTool = (
    tool: PlayerTool
  ) => {
    setSelectedPlayerTool(tool);
    setSelectedNumber(null);

    if (tool === "ball") {
      setSelectedTeam(null);

      setActiveTool("ball");
      setMode("add");

      return;
    }

    if (tool === "goalkeeper") {
      setSelectedTeam("goalkeeper");

      setActiveTool("goalkeeper");
      setMode("add");

      return;
    }

    if (tool === "team1") {
      setSelectedTeam("team1");

      setActiveTool("player");
      setMode("add");

      return;
    }

    if (tool === "team2") {
      setSelectedTeam("team2");

      setActiveTool("player");
      setMode("add");

      return;
    }

    if (tool === "team3") {
      setSelectedTeam("team3");

      setActiveTool("player");
      setMode("add");
    }
  };

  // =====================================================
  // PLAYER NUMBER
  // =====================================================

  const selectNumber = (
    number: number
  ) => {
    setSelectedNumber(number);

    setActiveTool("player");
    setMode("add");
  };

  // =====================================================
  // PLAYERS CONTENT
  // =====================================================

  const renderPlayers = () => {
    return (
      <div className="android-panel-content">

        <div className="android-panel-title">
          بازیکنان
        </div>

        <div className="android-player-tools">

          {/* BALL */}

          <button
            className={
              selectedPlayerTool === "ball"
                ? "android-tool-card active ball"
                : "android-tool-card"
            }
            onClick={() =>
              selectPlayerTool("ball")
            }
          >
            <span className="android-tool-icon">
              ⚽
            </span>

            <span>
              توپ
            </span>
          </button>

          {/* TEAM 1 */}

          <button
            className={
              selectedPlayerTool === "team1"
                ? "android-tool-card active team-blue"
                : "android-tool-card"
            }
            onClick={() =>
              selectPlayerTool("team1")
            }
          >
            <span className="player-icon blue">
              1
            </span>

            <span>
              تیم ۱
            </span>
          </button>

          {/* TEAM 2 */}

          <button
            className={
              selectedPlayerTool === "team2"
                ? "android-tool-card active team-red"
                : "android-tool-card"
            }
            onClick={() =>
              selectPlayerTool("team2")
            }
          >
            <span className="player-icon red">
              2
            </span>

            <span>
              تیم ۲
            </span>
          </button>

          {/* TEAM 3 */}

          <button
            className={
              selectedPlayerTool === "team3"
                ? "android-tool-card active team-green"
                : "android-tool-card"
            }
            onClick={() =>
              selectPlayerTool("team3")
            }
          >
            <span className="player-icon green">
              3
            </span>

            <span>
              تیم ۳
            </span>
          </button>

          {/* GOALKEEPER */}

          <button
            className={
              selectedPlayerTool === "goalkeeper"
                ? "android-tool-card active goalkeeper"
                : "android-tool-card"
            }
            onClick={() =>
              selectPlayerTool("goalkeeper")
            }
          >
            <span className="android-tool-icon">
              🧤
            </span>

            <span>
              دروازه‌بان
            </span>
          </button>

        </div>

        {/* NUMBER */}

        <div className="android-number-title">
          انتخاب شماره
        </div>

        <div className="android-number-grid">

          {Array.from(
            { length: 10 },
            (_, index) => index + 1
          ).map((number) => (
            <button
              key={number}
              className={
                selectedNumber === number
                  ? "android-number active"
                  : "android-number"
              }
              onClick={() =>
                selectNumber(number)
              }
            >
              {number}
            </button>
          ))}

          {/* CAPTAIN */}

          <button
            className="android-number captain"
            onClick={() => {
              setActiveTool("player");
              setMode("add");
            }}
          >
            C
          </button>

          {/* CONE */}

          <button
            className="android-number equipment"
            onClick={() => {
              setActiveTool("cone");
              setMode("add");
            }}
          >
            🔶
          </button>

        </div>

      </div>
    );
  };

  // =====================================================
  // EQUIPMENT
  // =====================================================

  const renderEquipment = () => {
    const equipment = [
      {
        type: "cone",
        icon: "🔶",
        title: "مخروط",
      },
      {
        type: "pole",
        icon: "│",
        title: "میله",
      },
      {
        type: "ring",
        icon: "○",
        title: "حلقه",
      },
      {
        type: "ladder",
        icon: "▤",
        title: "نردبان",
      },
      {
        type: "dummy",
        icon: "🧍",
        title: "مانکن",
      },
      {
        type: "miniGoal",
        icon: "🥅",
        title: "دروازه کوچک",
      },
      {
        type: "target",
        icon: "◎",
        title: "هدف",
      },
      {
        type: "wall",
        icon: "▤",
        title: "دیوار",
      },
    ];

    return (
      <div className="android-panel-content">

        <div className="android-panel-title">
          اشیاء
        </div>

        <div className="android-equipment-grid">

          {equipment.map((item) => (
            <button
              key={item.type}
              className="android-tool-card"
              onClick={() => {
                setActiveTool(item.type);
                setMode("add");
              }}
            >
              <span className="android-tool-icon">
                {item.icon}
              </span>

              <span>
                {item.title}
              </span>
            </button>
          ))}

        </div>

      </div>
    );
  };

  // =====================================================
  // PATHS
  // =====================================================

  const renderPaths = () => {
    const paths = [
      ["خط مستقیم", "↗"],
      ["پیکان", "➜"],
      ["پیکان منحنی", "↗"],
      ["دریبل", "⤴"],
      ["حرکت", "➝"],
      ["پیکان دو سر", "↔"],
      ["خط شکسته", "⌁"],
      ["مسیر منحنی", "⌒"],
      ["پاک کردن مسیر", "⌫"],
    ];

    return (
      <div className="android-panel-content">

        <div className="android-panel-title">
          مسیرها
        </div>

        <div className="android-equipment-grid">

          {paths.map(
            ([title, icon]) => (
              <button
                key={title}
                className="android-tool-card"
                onClick={() => {
                  setActiveTool("path");
                  setMode("add");
                }}
              >
                <span className="android-tool-icon">
                  {icon}
                </span>

                <span>
                  {title}
                </span>
              </button>
            )
          )}

        </div>

      </div>
    );
  };

  // =====================================================
  // TEXT
  // =====================================================

  const renderText = () => {
    return (
      <div className="android-panel-content">

        <div className="android-panel-title">
          متن
        </div>

        <div className="android-text-colors">

          <span className="text-color white" />
          <span className="text-color yellow" />
          <span className="text-color orange" />
          <span className="text-color red" />
          <span className="text-color green" />
          <span className="text-color blue" />
          <span className="text-color purple" />
          <span className="text-color black" />

        </div>

        <div className="android-text-options">

          <button>
            A
          </button>

          <button>
            A
          </button>

          <button className="active">
            A
          </button>

          <button>
            A
          </button>

        </div>

        <button
          className="android-large-action"
          onClick={() => {
            setActiveTool("text");
            setMode("add");
          }}
        >
          + افزودن متن
        </button>

      </div>
    );
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const renderClear = () => {
    return (
      <div className="android-panel-content">

        <div className="android-panel-title">
          پاک‌کردن
        </div>

        <div className="android-clear-grid">

          <button>
            ⛶

            <span>
              پاک کردن انتخاب
            </span>
          </button>

          <button className="danger">
            🗑

            <span>
              پاک کردن همه
            </span>
          </button>

          <button>
            ↶

            <span>
              لغو آخرین عملیات
            </span>
          </button>

        </div>

      </div>
    );
  };

  // =====================================================
  // ANIMATION
  // =====================================================

  const renderAnimation = () => {
    return (
      <div className="android-panel-content">

        <div className="android-panel-title">
          انیمیشن
        </div>

        <div className="android-animation-controls">

          <button>
            ⏮
          </button>

          <button>
            ◀
          </button>

          <button className="play">
            ▶
          </button>

          <button>
            Ⅱ
          </button>

          <button>
            ▶
          </button>

          <button>
            ⏭
          </button>

        </div>

        <div className="android-animation-actions">

          <button>
            ↶ از اول
          </button>

          <button className="record">
            ● ضبط
          </button>

          <button>
            ＋ افزودن فریم
          </button>

          <button>
            🗑 حذف فریم
          </button>

        </div>

        <div className="android-timeline">

          <span>
            01
          </span>

          <input
            type="range"
            min="1"
            max="20"
            defaultValue="8"
          />

          <span>
            20
          </span>

        </div>

        <div className="android-frame-label">
          فریم ۸ از ۲۰
        </div>

      </div>
    );
  };

  // =====================================================
  // ACTIVE CONTENT
  // =====================================================

  const renderContent = () => {
    switch (activeTab) {
      case "players":
        return renderPlayers();

      case "equipment":
        return renderEquipment();

      case "paths":
        return renderPaths();

      case "text":
        return renderText();

      case "clear":
        return renderClear();

      case "animation":
        return renderAnimation();

      default:
        return renderPlayers();
    }
  };

  // =====================================================
  // TAB CLICK
  // =====================================================

  const handleTabClick = (
    tab: MainTab
  ) => {
    setActiveTab(tab);

    setOpen(true);

    selectTab(tab);
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="android-tool-dock">

      {/* ===============================================
          FLOATING SUB PANEL
          فقط محتوای تب
          =============================================== */}

      {open && (
        <div className="android-tool-floating-content">

          <button
            className="android-floating-handle"
            onClick={() =>
              setOpen(false)
            }
            aria-label="بستن پنل"
          >
            <span />
          </button>

          {renderContent()}

        </div>
      )}

      {/* ===============================================
          FIXED BOTTOM TABS
          همیشه پایین صفحه ثابت
          =============================================== */}

      <nav className="android-fixed-tabs">

        {/* PLAYERS */}

        <button
          className={
            activeTab === "players"
              ? "active"
              : ""
          }
          onClick={() =>
            handleTabClick("players")
          }
        >
          <span>
            👤
          </span>

          <small>
            بازیکنان
          </small>
        </button>

        {/* EQUIPMENT */}

        <button
          className={
            activeTab === "equipment"
              ? "active"
              : ""
          }
          onClick={() =>
            handleTabClick("equipment")
          }
        >
          <span>
            ♙
          </span>

          <small>
            اشیاء
          </small>
        </button>

        {/* PATHS */}

        <button
          className={
            activeTab === "paths"
              ? "active"
              : ""
          }
          onClick={() =>
            handleTabClick("paths")
          }
        >
          <span>
            ⌁
          </span>

          <small>
            مسیرها
          </small>
        </button>

        {/* TEXT */}

        <button
          className={
            activeTab === "text"
              ? "active"
              : ""
          }
          onClick={() =>
            handleTabClick("text")
          }
        >
          <span>
            T
          </span>

          <small>
            متن
          </small>
        </button>

        {/* CLEAR */}

        <button
          className={
            activeTab === "clear"
              ? "active"
              : ""
          }
          onClick={() =>
            handleTabClick("clear")
          }
        >
          <span>
            ⌫
          </span>

          <small>
            پاک‌کردن
          </small>
        </button>

        {/* ANIMATION */}

        <button
          className={
            activeTab === "animation"
              ? "active"
              : ""
          }
          onClick={() =>
            handleTabClick("animation")
          }
        >
          <span>
            🎬
          </span>

          <small>
            انیمیشن
          </small>
        </button>

      </nav>

    </div>
  );
}