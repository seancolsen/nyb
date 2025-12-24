import { Routes, Route } from "react-router-dom";
import NamePage from "./NamePage";
import HomePage from "./HomePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/:name" element={<NamePage />} />
    </Routes>
  );
}

export default App;
