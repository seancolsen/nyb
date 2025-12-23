import { Routes, Route } from "react-router-dom";
import NamePage from "./NamePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<div>hello</div>} />
      <Route path="/:name" element={<NamePage />} />
    </Routes>
  );
}

export default App;
