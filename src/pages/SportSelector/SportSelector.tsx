import { SPORTS } from "../../modules/sports/sports";
import type { Sport } from "../../core/types/sport";
import { useApp } from "../../core/contexts/AppContext";
import "./SportSelector.css";

interface SportSelectorProps {
  onSportSelected: () => void;
}

export default function SportSelector({
  onSportSelected,
}: SportSelectorProps) {
  const { currentSport, setCurrentSport } = useApp();

  const handleSportClick = (sportId: Sport["id"]) => {
    setCurrentSport(sportId);

    // اجازه می‌دهیم تیک انتخاب برای لحظه‌ای دیده شود
    setTimeout(() => {
      onSportSelected();
    }, 180);
  };

  return (
    <main
      className="sport-selector"
      style={{
        background: "#020812",
      }}
    >
      {/* Background */}
      <img
        className="sport-selector__background"
        src="/background/coach-background.png"
        alt=""
      />

      {/* Header */}
      <div className="sport-selector__brand">
        ⚽ Coach Studio
      </div>

      <p className="sport-selector__subtitle">
        Choose your sport
      </p>

      {/* Sports */}
      <section className="sport-selector__grid">
        {SPORTS.map((sport) => (
          <button
            key={sport.id}
            type="button"
            className={`sport-card ${
              currentSport === sport.id
                ? "sport-card--selected"
                : ""
            }`}
            onClick={() => handleSportClick(sport.id)}
          >
            {/* Sport image */}
            <img
              className="sport-card__image"
              src={`/sports/${sport.id}.png`}
              alt={sport.name}
            />

            {/* Dark overlay */}
            <div className="sport-card__overlay" />

            {/* Selected check */}
            {currentSport === sport.id && (
              <div className="sport-card__check">
                ✓
              </div>
            )}

            {/* Bottom information */}
            <div className="sport-card__bottom">
              <div className="sport-card__icon">
                {sport.icon}
              </div>

              <div className="sport-card__content">
                <span className="sport-card__name">
                  {sport.name}
                </span>

                <span className="sport-card__action">
                  Open workspace
                </span>
              </div>
            </div>
          </button>
        ))}
      </section>
    </main>
  );
}