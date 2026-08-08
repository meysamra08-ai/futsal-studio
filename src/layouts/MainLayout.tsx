import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar/Sidebar";
import CourtCanvas from "../components/Court/CourtCanvas";
import RightPanel from "../components/RightPanel/RightPanel";

export default function MainLayout() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "60px 1fr 260px",
        gridTemplateRows: "56px 1fr",
        height: "100vh",
        background: "#151C24",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          gridColumn: "1 / 4",
          zIndex: 20,
        }}
      >
        <Header />
      </div>

      {/* Sidebar */}
      <div
        style={{
          background: "#1E2732",
          borderRight: "1px solid #2F3D4D",
        }}
      >
        <Sidebar />
      </div>

      {/* Court */}
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#202A35",
          overflow: "hidden",
        }}
      >
        <CourtCanvas />
      </div>

      {/* Right Panel */}
      <div
        style={{
          background: "#1E2732",
          borderLeft: "1px solid #2F3D4D",
          overflow: "hidden",
        }}
      >
        <RightPanel />
      </div>
    </div>
  );
}