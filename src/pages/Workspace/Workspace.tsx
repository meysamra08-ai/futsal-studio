import { useState } from "react";
import MainLayout from "../../shared/layouts/MainLayout";
import "./Workspace.css";

type WorkspaceMode = "match" | "training" | null;

export default function Workspace() {
  const [activeWorkspace, setActiveWorkspace] =
    useState<WorkspaceMode>(null);

  if (activeWorkspace) {
    return <MainLayout />;
  }

  return (
    <main className="workspace-home">

      {/* Ambient background */}
      <div className="workspace-orb workspace-orb--blue" />
      <div className="workspace-orb workspace-orb--green" />

      <div className="workspace-noise" />

      {/* Header */}
      <header className="workspace-header">

        <button
          type="button"
          className="workspace-menu"
          aria-label="Open menu"
        >
          <span />
          <span />
          <span />
        </button>

        <div className="workspace-brand">
          <div className="workspace-brand__mark">
            ⚽
          </div>

          <div>
            <div className="workspace-brand__name">
              Coach <span>Studio</span>
            </div>

            <div className="workspace-brand__tagline">
              PLAN • COACH • WIN
            </div>
          </div>
        </div>

        <button
          type="button"
          className="workspace-pro"
        >
          <span>♛</span>
          نسخه حرفه‌ای
        </button>

      </header>

      {/* Welcome */}
      <section className="workspace-welcome">

        <div className="workspace-welcome__eyebrow">
          COACHING PLATFORM
        </div>

        <h1>
          به <span>Coach Studio</span> خوش آمدید
        </h1>

        <p>
          فعالیت مورد نظر خود را انتخاب کنید
        </p>

      </section>

      {/* Cards */}
      <section className="workspace-actions">

        {/* ================= MATCH ================= */}

        <article className="workspace-card workspace-card--blue">

          <div className="workspace-card__shine" />

          <div className="workspace-card__content">

            <div className="workspace-card__heading">

              <div className="workspace-card__icon">
                ⚽
              </div>

              <div>
                <h2>کوچینگ مسابقه</h2>

                <p>
                  طراحی تاکتیک، ترکیب تیم و
                  <br />
                  ارائه راهکارهای لحظه‌ای در جریان مسابقه
                </p>
              </div>

            </div>

            {/* Tactical visual */}
            <div className="workspace-card__visual workspace-card__visual--match">

              <div className="visual-grid" />

              <div className="field-line field-line--center" />

              <div className="field-circle" />

              <div className="field-box field-box--left" />
              <div className="field-box field-box--right" />

              <span className="player player--1">7</span>
              <span className="player player--2">10</span>
              <span className="player player--3">8</span>
              <span className="player player--4">9</span>

              <span className="player player--5 player--enemy">3</span>
              <span className="player player--6 player--enemy">11</span>

              <div className="tactical-arrow tactical-arrow--one" />
              <div className="tactical-arrow tactical-arrow--two" />

              <span className="visual-ball">●</span>

              <div className="visual-label">
                LIVE TACTICS
              </div>

            </div>

            <button
              type="button"
              className="workspace-card__button workspace-card__button--blue"
              onClick={() => setActiveWorkspace("match")}
            >
              <span>ورود به کوچینگ مسابقه</span>
              <strong>←</strong>
            </button>

          </div>

        </article>

        {/* ================= TRAINING ================= */}

        <article className="workspace-card workspace-card--green">

          <div className="workspace-card__shine" />

          <div className="workspace-card__content">

            <div className="workspace-card__heading">

              <div className="workspace-card__icon">
                ◉
              </div>

              <div>
                <h2>طراحی تمرین</h2>

                <p>
                  طراحی تمرین، استفاده از تجهیزات
                  <br />
                  و برنامه‌ریزی جلسات تمرینی
                </p>
              </div>

            </div>

            {/* Training visual */}
            <div className="workspace-card__visual workspace-card__visual--training">

              <div className="training-grid" />

              <div className="training-field-line training-field-line--1" />
              <div className="training-field-line training-field-line--2" />
              <div className="training-field-circle" />

              {/* Cones */}
              <span className="cone cone--1" />
              <span className="cone cone--2" />
              <span className="cone cone--3" />
              <span className="cone cone--4" />
              <span className="cone cone--5" />
              <span className="cone cone--6" />

              {/* Players */}
              <span className="training-player training-player--1" />
              <span className="training-player training-player--2" />
              <span className="training-player training-player--3" />
              <span className="training-player training-player--4" />

              {/* Equipment */}
              <span className="training-pole training-pole--1" />
              <span className="training-pole training-pole--2" />

              <div className="visual-label">
                TRAINING PLAN
              </div>

            </div>

            <button
              type="button"
              className="workspace-card__button workspace-card__button--green"
              onClick={() => setActiveWorkspace("training")}
            >
              <span>ورود به طراحی تمرین</span>
              <strong>←</strong>
            </button>

          </div>

        </article>

      </section>

      {/* Bottom navigation */}
      <nav className="workspace-bottom-nav">

        <button
          type="button"
          className="workspace-nav-item workspace-nav-item--active"
        >
          <span>⌂</span>
          <small>خانه</small>
        </button>

        <button type="button" className="workspace-nav-item">
          <span>▣</span>
          <small>کتابخانه</small>
        </button>

        <button type="button" className="workspace-nav-item">
          <span>▤</span>
          <small>برنامه تمرینی</small>
        </button>

        <button type="button" className="workspace-nav-item">
          <span>⚙</span>
          <small>تنظیمات</small>
        </button>

      </nav>

    </main>
  );
}