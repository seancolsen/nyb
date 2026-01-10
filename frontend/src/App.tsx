import { Routes, Route } from "react-router-dom";
import { NamePage } from "./pages/name/NamePage";
import { HomePage } from "./pages/home/HomePage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:name" element={<NamePage />} />
    </Routes>
  );
}
