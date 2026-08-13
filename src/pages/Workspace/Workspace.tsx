import { useState } from "react";
import MainLayout from "../../shared/layouts/MainLayout";
import "./Workspace.css";

type WorkspaceMode = "match" | "training" | null;

interface WorkspaceProps {
  onHome: () => void;
}

export default function Workspace({
  onHome,
}: WorkspaceProps) {
  const [activeWorkspace, setActiveWorkspace] =
    useState<WorkspaceMode>(null);

  if (activeWorkspace) {
    return <MainLayout />;
  }

  return (
    <main className="workspace-home">
      {/* Background decoration */}
      <div className="workspace-home__glow workspace-home__glow--blue" />
      <div className="workspace-home__glow workspace-home__glow--green" />

      {/* Top bar */}
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
            ⚽️
          </div>

          <div>
            <div className="workspace-brand__name">
              Coach <span>Studio</span>
            </div>

            <div className="workspace-brand__tagline">
              Plan. Coach. Win.
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
        <p className="workspace-welcome__eyebrow">
          COACHING PLATFORM
        </p>

        <h1>
          به <span>Coach Studio</span> خوش آمدید
        </h1>

        <p>
          فعالیت مورد نظر خود را انتخاب کنید
        </p>
      </section>

      {/* Main cards */}
      <section className="workspace-actions">
        {/* Match Coaching */}
        <article className="workspace-card workspace-card--blue">
          <div className="workspace-card__top">
            <div>
              <div className="workspace-card__icon">
                ⚽️
              </div>

              <h2>کوچینگ مسابقه</h2>

              <p>
                طراحی تاکتیک، ترکیب تیم و
                <br />
                ارائه راهکارهای لحظه‌ای در جریان مسابقه
              </p>
            </div>
          </div>

          <div className="workspace-card__visual workspace-card__visual--match">
            <div className="tactical-field">
              <span className="player player--1">
                7
              </span>

              <span className="player player--2">
                10
              </span>

              <span className="player player--3">
                8
              </span>

              <span className="player player--4">
                9
              </span>

              <span className="ball">
                ●
              </span>

              <div className="tactical-line tactical-line--one" />
              <div className="tactical-line tactical-line--two" />
            </div>
          </div>

          <button
            type="button"
            className="workspace-card__button"
            onClick={() =>
              setActiveWorkspace("match")
            }
          >
            ورود به کوچینگ مسابقه
            <span>→</span>
          </button>
        </article>

        {/* Training Design */}
        <article className="workspace-card workspace-card--green">
          <div className="workspace-card__top">
            <div>
              <div className="workspace-card__icon">
                🟢
              </div>

              <h2>طراحی تمرین</h2>

              <p>
                طراحی تمرین، استفاده از تجهیزات
                <br />
                و برنامه‌ریزی جلسات تمرینی
              </p>
            </div>
          </div>

          <div className="workspace-card__visual workspace-card__visual--training">
            <div className="training-field">
              <span className="cone cone--1" />
              <span className="cone cone--2" />
              <span className="cone cone--3" />
              <span className="cone cone--4" />
              <span className="cone cone--5" />

              <span className="training-player training-player--1" />
              <span className="training-player training-player--2" />
              <span className="training-player training-player--3" />
            </div>
          </div>

          <button
            type="button"
            className="workspace-card__button"
            onClick={() =>
              setActiveWorkspace("training")
            }
          >
            ورود به طراحی تمرین
            <span>→</span>
          </button>
        </article>
      </section>

      {/* Bottom navigation */}
      <nav className="workspace-bottom-nav">
        {/* Home */}
        <button
          type="button"
          className="workspace-nav-item workspace-nav-item--active"
          onClick={onHome}
          aria-label="خانه"
        >
          <span>⌂</span>
          <small>خانه</small>
        </button>

        {/* Library */}
        <button
          type="button"
          className="workspace-nav-item"
        >
          <span>▣</span>
          <small>کتابخانه</small>
        </button>

        {/* Training Plan */}
        <button
          type="button"
          className="workspace-nav-item"
        >
          <span>▤</span>
          <small>برنامه تمرینی</small>
        </button>

        {/* Settings */}
        <button
          type="button"
          className="workspace-nav-item"
        >
          <span>⚙️</span>
          <small>تنظیمات</small>
        </button>
      </nav>
    </main>
  );
}