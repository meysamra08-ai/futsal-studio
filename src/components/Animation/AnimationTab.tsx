import { useEffect, useState } from "react";
import { useAnimation } from "../../core/contexts/AnimationContext";
import { useBoard } from "../../core/contexts/BoardContext";

interface AnimationTabProps {
  onBack?: () => void;
  onSave?: () => void;
  editingAnimationId?: string | null;
}

export default function AnimationTab({
  onBack,
  onSave,
  editingAnimationId = null,
}: AnimationTabProps) {
  const {
    isPlaying,
    currentTime,
    playbackEnded,
    isRecording,
    editingSavedAnimationId: loadedEditingAnimationId,
    stepDuration,
    frames,
    keyframes,

    startRecording,
    stopRecording,
    createFrame,

    activeFrameId,
    selectFrame,
    deleteFrame,

    play,
    pause,
    stop,
    setCurrentTime,
    resetAnimation,

    setStepDuration,
    saveAnimation,
    updateSavedAnimation,
    loop,
    toggleLoop,
  } = useAnimation();

  const { objects, setObjects } = useBoard();

  // Context is the durable source of truth for edit mode.
  // The prop is kept for compatibility with RightPanel.
  const effectiveEditingAnimationId =
    editingAnimationId ?? loadedEditingAnimationId;

  // In edit mode, when playback naturally reaches the end,
  // commit the final keyframe to the real Board.
  // This is what makes the last frame editable immediately.
  useEffect(() => {
    if (!effectiveEditingAnimationId || !playbackEnded || isPlaying) {
      return;
    }

    const lastKeyframe =
      keyframes[keyframes.length - 1];

    if (!lastKeyframe) {
      return;
    }

    setCurrentTime(lastKeyframe.time);

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
  }, [
    effectiveEditingAnimationId,
    playbackEnded,
    isPlaying,
    keyframes,
    setCurrentTime,
    setObjects,
  ]);
  const [saveDialogOpen, setSaveDialogOpen] =
    useState(false);
  const [saveTitle, setSaveTitle] =
    useState("");
  const [saveCategory, setSaveCategory] =
    useState("سایر");
  const [noFrameWarningOpen, setNoFrameWarningOpen] =
    useState(false);

  const categories = [
    "همه",
    "حمله",
    "دفاع",
    "اوت",
    "کرنر",
    "ضربات ایستگاهی",
    "سایر",
  ];

  const createAnimationFrame = () => {
    // در حالت ویرایش، فریم‌های Loadشده حفظ می‌شوند
    // و فریم جدید به ادامه همان انیمیشن اضافه می‌شود.
    if (effectiveEditingAnimationId) {
      createFrame(objects);
      return;
    }

    createFrame(objects);
  };

  const buttonStyle = (
    active = false
  ): React.CSSProperties => ({
    height: 42,
    borderRadius: 9,
    border: active
      ? "1px solid #FFFFFF"
      : "1px solid #314557",
    background: active
      ? "#C92A3A"
      : "#1E2D3B",
    color: "#FFFFFF",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  });

  return (
    <div
      style={{
        width: "100%",
        direction: "rtl",
        color: "#FFFFFF",
      }}
    >
      {/* کنترل‌های بالای صفحه: فقط بازگشت و ذخیره */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 7,
          marginBottom: 10,
        }}
      >
        <button
          type="button"
          onClick={onBack}
          style={{
            width: "100%",
            height: 38,
            borderRadius: 9,
            border: "1px solid #314557",
            background: "#1E2D3B",
            color: "#FFFFFF",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          ↩ بازگشت
        </button>

        <button
          type="button"
          onClick={() => {
            if (frames.length === 0) {
              setNoFrameWarningOpen(true);
              return;
            }

            if (effectiveEditingAnimationId) {
              const saved =
                updateSavedAnimation(
                  effectiveEditingAnimationId
                );

              if (!saved) {
                window.alert(
                  "ذخیره تغییرات انجام نشد."
                );
                return;
              }

              onSave?.();
              return;
            }

            setSaveTitle("");
            setSaveCategory("سایر");
            setSaveDialogOpen(true);
          }}
          style={{
            width: "100%",
            height: 38,
            borderRadius: 9,
            border: "1px solid #314557",
            background: "#2588E8",
            color: "#FFFFFF",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          💾 ذخیره
        </button>
      </div>

      {/* ساخت انیمیشن */}
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
          }}
        >
          🎬 ساخت انیمیشن
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 7,
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (isRecording) {
                stopRecording();
                return;
              }

              if (effectiveEditingAnimationId) {
                window.alert(
                  "در حالت ویرایش، فریم‌های قبلی حفظ شده‌اند. بازیکنان را جابه‌جا کنید و «ایجاد فریم» را بزنید."
                );
                return;
              }

              startRecording(objects);
            }}
            style={{
              ...buttonStyle(isRecording),
              background: isRecording
                ? "#C92A3A"
                : "#2588E8",
            }}
          >
            {isRecording
              ? "⏹ پایان ساخت"
              : "🔴 شروع ساخت"}
          </button>

          <button
            type="button"
            onClick={createAnimationFrame}
            disabled={!isRecording && !effectiveEditingAnimationId}
            style={{
              ...buttonStyle(),
              opacity:
                isRecording || effectiveEditingAnimationId
                  ? 1
                  : 0.45,
              cursor:
                isRecording || effectiveEditingAnimationId
                  ? "pointer"
                  : "not-allowed",
              background: "#2588E8",
            }}
          >
            ➕ ایجاد فریم
          </button>
        </div>
      </div>

      {/* پخش */}
      <div
        style={{
          marginTop: 10,
          padding: 12,
          borderRadius: 10,
          border: "1px solid #314557",
          background: "#172532",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          پخش
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 7,
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (isPlaying) {
                pause();
                return;
              }

              const lastKeyframe =
                keyframes[keyframes.length - 1];

              if (
                lastKeyframe &&
                currentTime >= lastKeyframe.time
              ) {
                setCurrentTime(0);
              }

              play();
            }}
            style={{
              ...buttonStyle(isPlaying),
              background: isPlaying
                ? "#C92A3A"
                : "#2588E8",
            }}
          >
            {isPlaying ? "⏸ مکث" : "▶ پخش"}
          </button>

          <button
            type="button"
            onClick={stop}
            style={buttonStyle()}
          >
            ⏹ توقف
          </button>
        </div>

        <button
          type="button"
          onClick={toggleLoop}
          style={{
            ...buttonStyle(loop),
            width: "100%",
            marginTop: 7,
          }}
        >
          {loop
            ? "✓ یک بار اجرا شود"
            : "یک بار اجرا شود"}
        </button>
      </div>

      {/* پاک کردن انیمیشن */}
      <button
        type="button"
        onClick={resetAnimation}
        style={{
          ...buttonStyle(),
          width: "100%",
          marginTop: 10,
        }}
      >
        ↺ پاک کردن انیمیشن
      </button>

      {/* مدت حرکت */}
      <div
        style={{
          marginTop: 10,
          padding: 12,
          borderRadius: 10,
          border: "1px solid #314557",
          background: "#172532",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          ⏱ مدت حرکت
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(5, 1fr)",
            gap: 5,
          }}
        >
          {[1, 1.5, 2, 3, 5].map(
            (value) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setStepDuration(value)
                }
                style={{
                  ...buttonStyle(
                    stepDuration === value
                  ),
                  height: 34,
                  fontSize: 10,
                }}
              >
                {value}s
              </button>
            )
          )}
        </div>
      </div>

      {/* فریم‌های ایجاد شده */}
      <div
        style={{
          marginTop: 10,
          padding: 12,
          borderRadius: 10,
          border: "1px solid #314557",
          background: "#172532",
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
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            📋 فریم‌های ایجاد شده
          </span>

          <span
            style={{
              fontSize: 10,
              color: "#9FB1C0",
            }}
          >
            {frames.length} فریم
          </span>
        </div>

        {frames.length === 0 ? (
          <div
            style={{
              padding: 12,
              borderRadius: 8,
              border: "1px dashed #314557",
              color: "#8FA2B2",
              textAlign: "center",
              fontSize: 11,
            }}
          >
            هنوز فریمی ایجاد نشده
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: 6,
              maxHeight: 240,
              overflowY: "auto",
            }}
          >
            {frames.map((frame) => (
              <div
                key={frame.id}
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: 6,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    selectFrame(frame.id);

                    const frameKeyframe =
                      keyframes.find(
                        (keyframe) =>
                          keyframe.id ===
                          frame.keyframeId
                      );

                    if (frameKeyframe) {
                      setCurrentTime(frameKeyframe.time);

                      const positions = new Map(
                        frameKeyframe.objects.map((item) => [
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
                    }
                  }}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    borderRadius: 8,
                    border:
                      activeFrameId ===
                      frame.id
                        ? "1px solid #2588E8"
                        : "1px solid #314557",
                    background:
                      activeFrameId ===
                      frame.id
                        ? "#203E57"
                        : "#1E2D3B",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    textAlign: "right",
                    padding:
                      "7px 10px",
                  }}
                >
                  {frame.name}
                  <span
                    style={{
                      display: "block",
                      color: "#9FB1C0",
                      fontSize: 9,
                      marginTop: 2,
                    }}
                  >
                    {frame.movements.length} حرکت ·{" "}
                    {frame.duration}s
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    deleteFrame(
                      frame.id
                    )
                  }
                  title="حذف فریم"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    border:
                      "1px solid #5A3440",
                    background:
                      "#2B1D23",
                    color: "#EF233C",
                    cursor: "pointer",
                    fontSize: 15,
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {noFrameWarningOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="no-frame-warning-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setNoFrameWarningOpen(false);
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
            background: "rgba(3, 10, 17, 0.74)",
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              width: "min(430px, 100%)",
              direction: "rtl",
              borderRadius: 18,
              border: "1px solid #3B5366",
              background:
                "linear-gradient(180deg, #1A2B3A 0%, #101C28 100%)",
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.5)",
              overflow: "hidden",
              color: "#FFFFFF",
            }}
          >
            <div
              style={{
                padding: "20px 20px 16px",
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <div
                style={{
                  flex: "0 0 auto",
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#3A2B16",
                  border: "1px solid #73541F",
                  fontSize: 23,
                }}
              >
                ⚠️
              </div>

              <div style={{ minWidth: 0 }}>
                <div
                  id="no-frame-warning-title"
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    marginBottom: 7,
                  }}
                >
                  هنوز فریمی ایجاد نشده
                </div>

                <div
                  style={{
                    fontSize: 11,
                    lineHeight: 1.9,
                    color: "#AAB9C7",
                  }}
                >
                  برای ذخیره یک انیمیشن، حداقل یک فریم لازم است.
                  ابتدا حرکت بازیکنان را تنظیم کنید و «ایجاد فریم» را بزنید.
                </div>
              </div>
            </div>

            <div
              style={{
                margin: "0 20px",
                height: 1,
                background: "#263A4A",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-start",
                gap: 8,
                padding: "16px 20px 20px",
              }}
            >
              <button
                type="button"
                autoFocus
                onClick={() => setNoFrameWarningOpen(false)}
                style={{
                  height: 40,
                  minWidth: 104,
                  padding: "0 18px",
                  borderRadius: 9,
                  border: "1px solid #2588E8",
                  background: "#2588E8",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 800,
                  boxShadow: "0 7px 20px rgba(37, 136, 232, 0.2)",
                }}
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      )}

      {saveDialogOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: 320,
              maxWidth: "90%",
              padding: 18,
              borderRadius: 12,
              border: "1px solid #314557",
              background: "#172532",
              direction: "rtl",
              color: "#FFFFFF",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                marginBottom: 12,
              }}
            >
              {effectiveEditingAnimationId
                ? "✏️ ویرایش انیمیشن"
                : "💾 ذخیره انیمیشن"}
            </div>

            <input
              type="text"
              value={saveTitle}
              onChange={(event) =>
                setSaveTitle(event.target.value)
              }
              placeholder="نام تمرین"
              autoFocus
              style={{
                width: "100%",
                height: 40,
                boxSizing: "border-box",
                borderRadius: 8,
                border: "1px solid #314557",
                background: "#101C28",
                color: "#FFFFFF",
                padding: "0 10px",
                outline: "none",
                textAlign: "right",
                marginBottom: 10,
              }}
            />

            <select
              value={saveCategory}
              onChange={(event) =>
                setSaveCategory(event.target.value)
              }
              style={{
                width: "100%",
                height: 40,
                borderRadius: 8,
                border: "1px solid #314557",
                background: "#101C28",
                color: "#FFFFFF",
                padding: "0 10px",
                outline: "none",
                marginBottom: 12,
              }}
            >
              {categories
                .filter((item) => item !== "همه")
                .map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
            </select>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 7,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  const title =
                    saveTitle.trim();

                  if (!title) {
                    window.alert(
                      "لطفاً نام تمرین را وارد کنید."
                    );
                    return;
                  }

                  const saved =
                    effectiveEditingAnimationId
                      ? updateSavedAnimation(
                          effectiveEditingAnimationId,
                          title,
                          saveCategory
                        )
                      : saveAnimation(
                          title,
                          saveCategory
                        );

                  if (!saved) {
                    window.alert(
                      "ذخیره انیمیشن انجام نشد."
                    );
                    return;
                  }

                  setSaveDialogOpen(false);
                  onSave?.();
                }}
                style={{
                  height: 38,
                  borderRadius: 8,
                  border: "1px solid #2588E8",
                  background: "#2588E8",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {effectiveEditingAnimationId
                  ? "ذخیره تغییرات"
                  : "ذخیره"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setSaveDialogOpen(false)
                }
                style={{
                  height: 38,
                  borderRadius: 8,
                  border: "1px solid #314557",
                  background: "#1E2D3B",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
