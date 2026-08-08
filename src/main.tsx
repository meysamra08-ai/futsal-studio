
import ReactDOM from "react-dom/client";

import App from "./App";

import { BoardProvider } from "./Context/BoardContext";
import { TeamProvider } from "./Context/TeamContext";
import { UIProvider } from "./Context/UIContext";


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