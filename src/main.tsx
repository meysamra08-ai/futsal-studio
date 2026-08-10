import ReactDOM from "react-dom/client";

import App from "./App";

import { AppProvider } from "./core/contexts/AppContext";
import { BoardProvider } from "./core/contexts/BoardContext";
import { TeamProvider } from "./core/contexts/TeamContext";
import { UIProvider } from "./core/contexts/UIContext";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <AppProvider>
    <UIProvider>
      <TeamProvider>
        <BoardProvider>
          <App />
        </BoardProvider>
      </TeamProvider>
    </UIProvider>
  </AppProvider>
);