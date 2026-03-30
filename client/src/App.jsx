import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NGOConnect from "./pages/NGOConnect";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NGOConnect />} />
      </Routes>
    </Router>
  );
}

export default App;