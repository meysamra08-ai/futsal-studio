import "./Header.css";

export default function Header() {
  return (
    <div className="header">
      <div className="header__logo">
        <span className="logo">⚽</span>
        <div>
          <h1>Coach Studio</h1>
          <small>Professional Tactical Board</small>
        </div>
      </div>

      <div className="header__actions">
        <button>📂</button>
        <button>💾</button>
        <button>⬇</button>
        <button>↶</button>
        <button>↷</button>
      </div>
    </div>
  );
}