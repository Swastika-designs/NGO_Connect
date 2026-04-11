import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NGOConnect from "./pages/NGOConnect";
import NGORegisterPage from './pages/NGORegisterPage';
import IdentityVerificationPage from './pages/IdentityVerificationPage';
import TierSelectionPage from './pages/TierSelectionPage';
import LoginPage from "./pages/LoginPage";
import NGOsPage from "./pages/NGOsPage";
import NGODetailPage from "./pages/NGODetailPage";
import SupportPage from "./pages/SupportPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<NGOConnect />} />
        <Route path="/ngo/login" element={<LoginPage />} />
        <Route path="/ngo/register" element={<NGORegisterPage />} />
        <Route path="/ngo/verify/identity" element={<IdentityVerificationPage />} />
        <Route path="/ngo/verify/tier" element={<TierSelectionPage />} />
        <Route path="/ngos" element={<NGOsPage />} />
        <Route path="/ngos/:slug" element={<NGODetailPage />} />
        <Route path="/support" element={<SupportPage />} />
      </Routes>
    </Router>
  );
}

export default App;