
import ReactDOM from "react-dom/client";

import "./index.css";

import App from "./App";

import { AppProvider } from "./core/contexts/AppContext";
import { BoardProvider } from "./core/contexts/BoardContext";
import { TeamProvider } from "./core/contexts/TeamContext";
import { UIProvider } from "./core/contexts/UIContext";
import { AnimationProvider } from "./core/contexts/AnimationContext";

function playGlobalClickSound() {
  const audio = new Audio("/sounds/click.mp3");
  audio.preload = "auto";
  audio.volume = 1;
  void audio.play().catch(() => {});
}

function GlobalClickSound() {
  const handlePointerDownCapture = (event: React.PointerEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const interactive = target.closest(
      "button, a, input, select, textarea, [role=button], [role=option], [role=menuitem], [tabindex]:not([tabindex='-1'])"
    );

    if (interactive && !interactive.closest('.clock-adjust, .score-adjust button, .foul-control button')) {
      playGlobalClickSound();
    }
  };

  return (
    <div style={{ minHeight: "100vh" }} onPointerDownCapture={handlePointerDownCapture}>
      <App />
    </div>
  );
}

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <AppProvider>
    <UIProvider>
      <TeamProvider>
        <BoardProvider>
          <AnimationProvider>
            <GlobalClickSound />
          </AnimationProvider>
        </BoardProvider>
      </TeamProvider>
    </UIProvider>
  </AppProvider>
);