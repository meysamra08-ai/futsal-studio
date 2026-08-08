import "./Header.css";
import Toolbar from "../Toolbar/Toolbar";

export default function Header() {
  return (
    <header className="header">
      <div className="logo">
        ⚽ Coach Studio
      </div>

      <div className="actions">
        <Toolbar />
      </div>
    </header>
  );
}