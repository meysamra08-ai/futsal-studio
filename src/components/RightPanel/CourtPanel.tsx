export default function CourtPanel() {
  return (
    <div
      style={{
        padding: 20,
        color: "white",
      }}
    >
      <h2>Court Settings</h2>

      <div style={{ marginTop: 20 }}>
        Ground Type
      </div>

      <select
        style={{
          width: "100%",
          padding: 8,
          marginTop: 8,
        }}
      >
        <option>Futsal</option>
        <option>Football</option>
        <option>Basketball</option>
      </select>

      <div style={{ marginTop: 20 }}>
        Court Color
      </div>

      <input
        type="color"
        style={{
          width: "100%",
          height: 40,
          marginTop: 8,
        }}
      />

      <div style={{ marginTop: 20 }}>
        Show Grid
      </div>

      <input type="checkbox" />
    </div>
  );
}