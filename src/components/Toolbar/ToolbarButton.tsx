import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  onClick?: () => void;
}

export default function ToolbarButton({
  icon,
  title,
  onClick,
}: Props) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        border: "none",
        background: "#2A3948",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      {icon}
    </button>
  );
}