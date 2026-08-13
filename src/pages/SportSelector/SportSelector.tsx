import { useState } from "react";
import { Capacitor } from "@capacitor/core";

import { SPORTS } from "../../modules/sports/sports";
import { useApp } from "../../core/contexts/AppContext";
import type { SportId } from "../../core/types/sport";

import "./SportSelector.css";

type SportSelectorProps = {
  onSportSelected: () => void;
};

export default function SportSelector({
  onSportSelected,
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

  // فقط این 6 ورزش در صفحه اصلی نمایش داده می‌شوند.
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

      {/* BACK BUTTON */}
      <button
        type="button"
        className="sport-selector__back"
        aria-label="Back"
      >
        ←
      </button>

      {/* HEADER */}
      <header className="sport-selector__header">
        <div className="sport-selector__brand">
          <span className="sport-selector__brand-ball">
            ⚽
          </span>

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

      {/* SPORTS */}
      <section className="sport-selector__grid">
        {mainSports.map((sport) => {
          const isSelected = currentSport === sport.id;
          const isSelecting = selectingSport === sport.id;

          const sportImage =
            `/sports/${sport.id}.png`;

          return (
            <button
              key={sport.id}
              type="button"
              className={`sport-card ${
                isSelected ? "sport-card--selected" : ""
              } ${
                isSelecting ? "sport-card--selecting" : ""
              } sport-card--${sport.id}`}
              onClick={() => handleSportSelect(sport.id)}
              disabled={selectingSport !== null}
            >
              <img
                className="sport-card__image"
                src={sportImage}
                alt=""
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
      </section>

      {/* BOTTOM ACTIONS */}
      <div className="sport-selector__footer">
        <button
          type="button"
          className="sport-selector__footer-button sport-selector__footer-button--more"
        >
          <span className="sport-selector__footer-icon">
            •••
          </span>

          <span className="sport-selector__footer-text">
            <strong>More</strong>
            <small>EXPLORE MORE SPORTS</small>
          </span>

          <span className="sport-selector__footer-arrow">
            ›
          </span>
        </button>

        <button
          type="button"
          className="sport-selector__footer-button sport-selector__footer-button--referee"
        >
          <span className="sport-selector__footer-icon">
            ⚑
          </span>

          <span className="sport-selector__footer-text">
            <strong>Referee</strong>
            <small>REFEREE TOOLS</small>
          </span>

          <span className="sport-selector__footer-arrow">
            ›
          </span>
        </button>
      </div>
    </main>
  );
}