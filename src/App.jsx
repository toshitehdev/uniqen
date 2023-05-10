import { Route, Routes, Navigate } from "react-router-dom";

import { AppProvider } from "./context";

import "./App.css";

import Home from "./routes/home/Home";
import Dapp from "./routes/app/Dapp";
import Collections from "./routes/collections/Collections";
import Mint from "./routes/mint/Mint";

function App() {
  return (
    <div>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app" element={<Dapp />}>
            <Route index element={<Navigate to="/app/collections" />} />
            <Route path="/app/collections" element={<Collections />} />
            <Route path="/app/mint" element={<Mint />} />
          </Route>
        </Routes>
      </AppProvider>
    </div>
  );
}

export default App;
