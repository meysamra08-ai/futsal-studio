import { useState } from "react";
import { Capacitor } from "@capacitor/core";
import { SPORTS } from "../../modules/sports/sports";
import { useApp } from "../../core/contexts/AppContext";
import type { SportId } from "../../core/types/sport";

import "./SportSelector.css";

type SportSelectorProps = {
  onSportSelected: () => void;
  onBack: () => void;
};

export default function SportSelector({
  onSportSelected,
  onBack,
}: SportSelectorProps) {
  const { currentSport, setCurrentSport } = useApp();

  const [selectingSport, setSelectingSport] =
    useState<SportId | null>(null);

  const isAndroid = Capacitor.getPlatform() === "android";

  const handleSportSelect = (sportId: SportId) => {
    setCurrentSport(sportId);
    setSelectingSport(sportId);

    window.setTimeout(() => {
      onSportSelected();
    }, 220);
  };

  const mainSports = SPORTS.filter((sport) =>
    [
      "football",
      "futsal",
      "basketball",
      "volleyball",
      "handball",
      "tennis",
    ].includes(sport.id)
  );

  return (
    <main
      className={`sport-selector ${
        isAndroid ? "sport-selector--android" : ""
      }`}
    >
      <img
        className="sport-selector__background"
        src="/background/sport-selector-bg.png"
        alt=""
        aria-hidden="true"
      />

      <div className="sport-selector__background-overlay" />

      {/* Back */}
      <button
        type="button"
        className="sport-selector__back"
        onClick={onBack}
        aria-label="Back"
      >
        ←
      </button>

      {/* Header */}
      <header className="sport-selector__header">
        <div className="sport-selector__brand">
          <img
            src="/logo/splashlogo.png"
            alt="Coach Studio"
            className="sport-selector__logo"
          />

          <span>
            Coach <b>Studio</b>
          </span>
        </div>

        <div className="sport-selector__eyebrow">
          TACTICAL COACHING PLATFORM
        </div>

        <h1 className="sport-selector__title">
          Choose Your Sport
        </h1>

        <p className="sport-selector__subtitle">
          Select a sport to open its coaching workspace
        </p>
      </header>

      {/* 8 Cards */}
      <section className="sport-selector__grid">
        {mainSports.map((sport) => {
          const isSelected = currentSport === sport.id;
          const isSelecting = selectingSport === sport.id;

          return (
            <button
              key={sport.id}
              type="button"
              className={`sport-card ${
                isSelected ? "sport-card--selected" : ""
              } ${
                isSelecting ? "sport-card--selecting" : ""
              }`}
              onClick={() => handleSportSelect(sport.id)}
              disabled={selectingSport !== null}
            >
              <img
                className="sport-card__image"
                src={`/sports/${sport.id}.png`}
                alt={sport.name}
                draggable={false}
              />

              <div className="sport-card__overlay" />

              <div className="sport-card__bottom">
                <div className="sport-card__icon">
                  {sport.icon}
                </div>

                <div className="sport-card__content">
                  <span className="sport-card__name">
                    {sport.name}
                  </span>

                  <span className="sport-card__action">
                    OPEN WORKSPACE
                  </span>
                </div>
              </div>

              <span className="sport-card__glow" />
            </button>
          );
        })}

        {/* MORE */}
        <button
          type="button"
          className="sport-card sport-card--more"
        >
          <img
  className="sport-card__image"
  src="/sports/more.png"
  alt="More"
/>

<div className="sport-card__overlay" />

          <div className="sport-card__overlay" />

          <div className="sport-card__bottom">
            <div className="sport-card__icon">•••</div>

            <div className="sport-card__content">
              <span className="sport-card__name">
                More
              </span>

              <span className="sport-card__action">
                EXPLORE MORE SPORTS
              </span>
            </div>
          </div>

          <span className="sport-card__arrow">→</span>
          <span className="sport-card__glow" />
        </button>

        {/* REFEREE */}
        <button
          type="button"
          className="sport-card sport-card--referee"
          onClick={() => handleSportSelect("referee" as SportId)}
        >
          <img
  className="sport-card__image"
  src="/sports/referee.png"
  alt="Referee"
/>

<div className="sport-card__overlay" />

          <div className="sport-card__overlay" />

          <div className="sport-card__bottom">
            <div className="sport-card__icon">🚩</div>

            <div className="sport-card__content">
              <span className="sport-card__name">
                Referee
              </span>

              <span className="sport-card__action">
                REFEREE TOOLS
              </span>
            </div>
          </div>

          <span className="sport-card__arrow">→</span>
          <span className="sport-card__glow" />
        </button>
      </section>
    </main>
  );
}