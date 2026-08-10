import { Typography } from "../../shared/theme/typography";

type DrawingTool = {
  id: string;
  name: string;
  icon: string;
};

const drawingTools: DrawingTool[] = [
  {
    id: "select",
    name: "Select",
    icon: "↖",
  },
  {
    id: "line",
    name: "Line",
    icon: "╱",
  },
  {
    id: "arrow",
    name: "Arrow",
    icon: "➜",
  },
  {
    id: "circle",
    name: "Circle",
    icon: "○",
  },
  {
    id: "rectangle",
    name: "Rectangle",
    icon: "□",
  },
];

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
        {drawingTools.map((tool: DrawingTool) => (
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