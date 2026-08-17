import { useEffect, useState } from "react";

export default function MousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    const touchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setPos({ x: t.clientX, y: t.clientY });
    };

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("touchstart", touchMove);
    window.addEventListener("touchmove", touchMove);

    return () => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("touchstart", touchMove);
      window.removeEventListener("touchmove", touchMove);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        zIndex: 99999,
        background: "rgba(0,0,0,.85)",
        color: "#00FF88",
        padding: "8px 12px",
        borderRadius: 10,
        fontFamily: "monospace",
        fontSize: 13,
        pointerEvents: "none",
      }}
    >
      X:{pos.x} | Y:{pos.y}
    </div>
  );
}