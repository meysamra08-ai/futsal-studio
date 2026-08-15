import "./ModeSelector.css";

type ModeSelectorProps = {
  onBack: () => void;
  onMatchMode: () => void;
  onTrainingMode: () => void;
};

export default function ModeSelector({
  onBack,
  onMatchMode,
  onTrainingMode,
}: ModeSelectorProps) {
  return (
    <main className="sport-selector">

      {/* دکمه برگشت */}
      <button className="back-btn" onClick={onBack}>
        ←
      </button>

      <header className="sport-selector__header">
        <img
          src="/logo/splashlogo.png"
          alt="Coach Studio"
          className="sport-selector__logo"
        />

        <div className="sport-selector__brand">
          COACHING PLATFORM
        </div>

        <h1 className="sport-selector__title">
          خوش آمدید به <span>Coach Studio</span>
        </h1>

        <p className="sport-selector__subtitle">
          فعالیت مورد نظر خود را انتخاب کنید
        </p>
      </header>

      <section className="mode-selector__grid">

        <article className="mode-card mode-card--match">
          <div className="mode-card__content">
            <div className="mode-card__badge">⚽</div>

            <h2 className="mode-card__title">
              کوچینگ مسابقه
            </h2>

            <p className="mode-card__description">
              طراحی تاکتیک، ترکیب تیم و مدیریت مسابقه
            </p>
          </div>

          <div className="mode-card__preview">
            <img
              src="/modes/match-preview.png"
              alt="Match"
            />
          </div>

          <button
            className="mode-card__button"
            onClick={onMatchMode}
          >
            ورود به کوچینگ مسابقه
          </button>
        </article>

        <article className="mode-card mode-card--training">
          <div className="mode-card__content">
            <div className="mode-card__badge">🟢</div>

            <h2 className="mode-card__title">
              طراحی تمرین
            </h2>

            <p className="mode-card__description">
              برنامه‌ریزی تمرینات و طراحی جلسه تمرینی
            </p>
          </div>

          <div className="mode-card__preview">
            <img
              src="/modes/training-preview.png"
              alt="Training"
            />
          </div>

          <button
            className="mode-card__button"
            onClick={onTrainingMode}
          >
            ورود به طراحی تمرین
          </button>
        </article>

      </section>
    </main>
  );
}