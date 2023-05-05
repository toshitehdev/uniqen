import { Route, Routes, Navigate } from "react-router-dom";

import { AppProvider } from "./context";

import "./App.css";

import Home from "./routes/home/Home";
import Dapp from "./routes/app/Dapp";
import Collections from "./routes/collections/Collections";

function App() {
  return (
    <div>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app" element={<Dapp />}>
            <Route index element={<Navigate to="/app/collections" />} />
            <Route path="/app/collections" element={<Collections />} />
          </Route>
        </Routes>
      </AppProvider>
    </div>
  );
}

export default App;
