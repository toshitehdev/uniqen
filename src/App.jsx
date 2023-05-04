import { Route, Routes, Navigate } from "react-router-dom";

import "./App.css";

import Home from "./routes/home/Home";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </>
  );
}

export default App;
