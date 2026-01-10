import { Routes, Route } from "react-router-dom";

import { HomePage } from "./pages/home/HomePage";
import { NamePage } from "./pages/name/NamePage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:name" element={<NamePage />} />
    </Routes>
  );
}
