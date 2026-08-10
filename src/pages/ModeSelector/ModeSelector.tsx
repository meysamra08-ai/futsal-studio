import { COACH_MODES } from "../../modules/modes/modes";
import { useApp } from "../../core/contexts/AppContext";
import "./ModeSelector.css";

interface ModeSelectorProps {
  onModeSelected: () => void;
}

export default function ModeSelector({
  onModeSelected,
}: ModeSelectorProps) {
  const { currentMode, setCurrentMode } = useApp();

  const handleModeClick = (
    modeId: typeof COACH_MODES[number]["id"]
  ) => {
    setCurrentMode(modeId);

    setTimeout(() => {
      onModeSelected();
    }, 180);
  };

  return (
    <main className="sport-selector">
      <p className="mode-selector__subtitle">
        Choose your coaching mode
      </p>

      <section className="mode-selector__grid">
        {COACH_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`mode-card ${
              currentMode === mode.id
                ? "mode-card--selected"
                : ""
            }`}
            onClick={() => handleModeClick(mode.id)}
          >
            <span className="mode-card__icon">
              {mode.icon}
            </span>

            <span className="mode-card__title">
              {mode.title}
            </span>

            <span className="mode-card__description">
              {mode.description}
            </span>
          </button>
        ))}
      </section>
    </main>
  );
}