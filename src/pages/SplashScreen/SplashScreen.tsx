import "./SplashScreen.css";

export default function SplashScreen() {
  return (
    <main className="splash-screen">

      <section className="brand-panel">

        <img
          src="/logo/splashlogo.png"
          alt="Coach Studio"
          className="brand-logo"
        />

        <h1 className="brand-title">
          FUTSAL <span>STUDIO</span>
        </h1>

        <p className="brand-subtitle">
          TACTICAL COACHING PLATFORM
        </p>

      </section>

      <div className="loading-bar">
        <span />
      </div>

    </main>
  );
}