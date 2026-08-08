import {
  Save,
  FolderOpen,
  Download,
  Undo2,
  Redo2,
} from "lucide-react";

import ToolbarButton from "./ToolbarButton";

export default function Toolbar() {
  return (
    <div
      style={{
      
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
      }}
    >
      <ToolbarButton
        icon={<FolderOpen size={18} />}
        title="Open"
      />

      <ToolbarButton
        icon={<Save size={18} />}
        title="Save"
      />

      <ToolbarButton
        icon={<Download size={18} />}
        title="Export"
      />

      <ToolbarButton
        icon={<Undo2 size={18} />}
        title="Undo"
      />

      <ToolbarButton
        icon={<Redo2 size={18} />}
        title="Redo"
      />
    </div>
  );
}