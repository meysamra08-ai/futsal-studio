
import ReactDOM from "react-dom/client";

import App from "./App";

import { BoardProvider } from "./core/contexts/BoardContext";
import { TeamProvider } from "./core/contexts/TeamContext";
import { UIProvider } from "./core/contexts/UIContext";


ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <UIProvider>
  <TeamProvider>
    <BoardProvider>
        <App />
    </BoardProvider>
  </TeamProvider>
</UIProvider>

);