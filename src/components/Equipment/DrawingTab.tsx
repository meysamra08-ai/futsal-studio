import { drawingTools } from "../../core/data/drawingTools";
import { Typography } from "../../shared/theme/typography";

export default function DrawingTab() {
  return (
    <>
      <h3 style={Typography.title}>Drawing</h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: 20,
        }}
      >
        {drawingTools.map((tool) => (
          <div
            key={tool.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              cursor: "pointer",
              padding: "10px 12px",
              borderRadius: 8,
              transition: "0.2s",
            }}
          >
            <span style={{ fontSize: 22 }}>
              {tool.icon}
            </span>

            <span style={Typography.body}>
              {tool.name}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}