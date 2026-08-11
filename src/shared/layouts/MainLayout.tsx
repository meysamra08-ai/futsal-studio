import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import CourtCanvas from "../../components/Court/CourtCanvas";
import RightPanel from "../../components/RightPanel/RightPanel";

import "./MainLayout.css";

export default function MainLayout() {
  return (
    <div className="main-layout">

      {/* Header */}
      <header className="main-layout__header">
        <Header />
      </header>

      {/* Sidebar */}
      <aside className="main-layout__sidebar">
        <Sidebar />
      </aside>

      {/* Court */}
      <main className="main-layout__court">
        <CourtCanvas />
      </main>

      {/* Right Panel */}
      <aside className="main-layout__right-panel">
        <RightPanel />
      </aside>

    </div>
  );
}