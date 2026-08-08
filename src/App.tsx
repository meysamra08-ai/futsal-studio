import { useEffect } from "react";
import MainLayout from "./layouts/MainLayout";
import { useBoard } from "./Context/BoardContext";

function AppContent() {
  const {
    deleteSelected,
    duplicateSelected,
    undo,
    redo,
  } = useBoard();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Delete
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
      }

      // Ctrl + D
      if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
      }

      // Ctrl + Z
      if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      }

      // Ctrl + Shift + Z
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [deleteSelected, duplicateSelected, undo, redo]);

  return <MainLayout />;
}

export default function App() {
  return <AppContent />;
}