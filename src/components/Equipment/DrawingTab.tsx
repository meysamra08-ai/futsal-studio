import {
  useUI,
} from "../../core/contexts/UIContext";

import type {
  DrawingTool,
  LineColor,
  LineWidth,
} from "../../core/contexts/UIContext";

const drawingTools: {
  id: DrawingTool;
  title: string;
  icon: string;
}[] = [
  {
    id: "line",
    title: "خط ساده",
    icon: "╱",
  },
  {
    id: "arrow",
    title: "خط جهت‌دار",
    icon: "➜",
  },
  {
    id: "dashedLine",
    title: "خط چین",
    icon: "┄",
  },
  {
    id: "dashedArrow",
    title: "خط چین جهت‌دار",
    icon: "┄➜",
  },
  {
    id: "curve",
    title: "منحنی",
    icon: "〰",
  },
  {
    id: "curveArrow",
    title: "منحنی جهت‌دار",
    icon: "〰➜",
  },
];

const colors: {
  value: LineColor;
  title: string;
}[] = [
  {
    value: "#FFFFFF",
    title: "سفید",
  },
  {
    value: "#FFD21F",
    title: "زرد",
  },
  {
    value: "#EF233C",
    title: "قرمز",
  },
  {
    value: "#22C55E",
    title: "سبز",
  },
  {
    value: "#2563EB",
    title: "آبی",
  },
];

const widths: {
  value: LineWidth;
  title: string;
}[] = [
  {
    value: 2,
    title: "نازک",
  },
  {
    value: 4,
    title: "متوسط",
  },
  {
    value: 7,
    title: "ضخیم",
  },
];

export default function DrawingTab() {
  const {
    drawingTool,
    setDrawingTool,

    lineColor,
    setLineColor,

    lineWidth,
    setLineWidth,

    lineOpacity,
    setLineOpacity,

    drawingLocked,
    setDrawingLocked,
  } = useUI();

  return (
    <div
      style={{
        width: "100%",
        direction: "rtl",
        color: "#FFFFFF",
      }}
    >

      {/* ==========================================
          عنوان
          ========================================== */}

      <h3
        style={{
          margin: "0 0 18px",
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        ابزارها
      </h3>


      {/* ==========================================
          انواع خطوط
          ========================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: 10,
        }}
      >

        {drawingTools.map((tool) => {
          const active =
            drawingTool === tool.id;

          return (
            <button
              key={tool.id}
              type="button"
              onClick={() =>
                setDrawingTool(tool.id)
              }
              style={{
                minHeight: 82,

                borderRadius: 10,

                border: active
                  ? "2px solid #22C55E"
                  : "1px solid #314457",

                background: active
                  ? "#263E50"
                  : "#1E2D3B",

                color: "#FFFFFF",

                cursor: "pointer",

                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",

                gap: 8,

                transition:
                  "all 0.15s ease",
              }}
            >

              <span
                style={{
                  fontSize: 27,
                  lineHeight: 1,
                }}
              >
                {tool.icon}
              </span>

              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {tool.title}
              </span>

            </button>
          );
        })}

      </div>


      {/* ==========================================
          جداکننده
          ========================================== */}

      <div
        style={{
          height: 1,
          background: "#344655",
          margin: "20px 0",
        }}
      />


      {/* ==========================================
          رنگ خط
          ========================================== */}

      <div
        style={{
          marginBottom: 20,
        }}
      >

        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          رنگ خط
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >

          {colors.map((color) => {
            const active =
              lineColor === color.value;

            return (
              <button
                key={color.value}
                type="button"
                title={color.title}
                onClick={() =>
                  setLineColor(
                    color.value
                  )
                }
                style={{
                  width: 30,
                  height: 30,

                  borderRadius: "50%",

                  border: active
                    ? "3px solid #FFFFFF"
                    : "2px solid #526477",

                  background:
                    color.value,

                  cursor: "pointer",

                  boxShadow: active
                    ? "0 0 0 2px #22C55E"
                    : "none",
                }}
              />
            );
          })}

        </div>

      </div>


      {/* ==========================================
          ضخامت خط
          ========================================== */}

      <div
        style={{
          marginBottom: 20,
        }}
      >

        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          ضخامت خط
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: 8,
          }}
        >

          {widths.map((width) => {
            const active =
              lineWidth === width.value;

            return (
              <button
                key={width.value}
                type="button"
                title={width.title}
                onClick={() =>
                  setLineWidth(
                    width.value
                  )
                }
                style={{
                  height: 48,

                  borderRadius: 8,

                  border: active
                    ? "2px solid #22C55E"
                    : "1px solid #314457",

                  background:
                    "#1E2D3B",

                  cursor: "pointer",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >

                <span
                  style={{
                    width: "65%",
                    height:
                      width.value,
                    background:
                      "#FFFFFF",
                    borderRadius: 10,
                  }}
                />

              </button>
            );
          })}

        </div>

      </div>


      {/* ==========================================
          شفافیت
          ========================================== */}

      <div
        style={{
          marginBottom: 20,
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >

          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            شفافیت
          </span>

          <span
            style={{
              fontSize: 12,
              color: "#AFC0CF",
            }}
          >
            {lineOpacity}%
          </span>

        </div>

        <input
          type="range"
          min={10}
          max={100}
          step={5}
          value={lineOpacity}
          onChange={(event) =>
            setLineOpacity(
              Number(event.target.value)
            )
          }
          style={{
            width: "100%",
            cursor: "pointer",
          }}
        />

      </div>


      {/* ==========================================
          ابزارهای مدیریت
          ========================================== */}

      <div
        style={{
          height: 1,
          background: "#344655",
          margin: "20px 0",
        }}
      />

      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        ابزارها
      </div>


      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, 1fr)",
          gap: 8,
        }}
      >

        <button
          type="button"
          style={{
            minHeight: 44,
            border: "1px solid #314457",
            borderRadius: 8,
            background: "#1E2D3B",
            color: "#FFFFFF",
            cursor: "pointer",
          }}
          onClick={() => {
            /*
             * حذف خط انتخاب‌شده
             *
             * در مرحله اتصال به CourtCanvas
             * این قسمت به BoardContext متصل می‌شود.
             */
          }}
        >
          🗑 حذف انتخاب
        </button>


        <button
          type="button"
          style={{
            minHeight: 44,
            border: "1px solid #314457",
            borderRadius: 8,
            background: "#1E2D3B",
            color: "#FFFFFF",
            cursor: "pointer",
          }}
          onClick={() => {
            /*
             * پاک کردن تمام خطوط
             *
             * در مرحله بعد به BoardContext
             * متصل می‌شود.
             */
          }}
        >
          🧹 پاک کردن همه
        </button>

      </div>


      {/* ==========================================
          قفل خطوط
          ========================================== */}

      <button
        type="button"
        onClick={() =>
          setDrawingLocked(
            !drawingLocked
          )
        }
        style={{
          width: "100%",
          minHeight: 46,

          marginTop: 8,

          borderRadius: 8,

          border: drawingLocked
            ? "2px solid #22C55E"
            : "1px solid #314457",

          background:
            drawingLocked
              ? "#263E50"
              : "#1E2D3B",

          color: "#FFFFFF",

          cursor: "pointer",

          fontWeight: 600,
        }}
      >
        {drawingLocked
          ? "🔒 خطوط قفل شده"
          : "🔓 قفل / باز کردن"}
      </button>

    </div>
  );
}