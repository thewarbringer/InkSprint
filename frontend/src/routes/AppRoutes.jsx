
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../pages/Landing/LandingPage.jsx";
import LoginPage from "../pages/Landing/Auth/LoginPage.jsx";
import SignupPage from "../pages/Landing/Auth/SignupPage.jsx";
import TermsPage from "../pages/Landing/Auth/TermsPage.jsx";
import PrivacyPage from "../pages/Landing/Auth/PrivacyPage.jsx";
import DashboardPage from "../pages/Landing/Dashboard/DashboardPage.jsx";
import RoomSetupPage from "../pages/Landing/Room/RoomSetupPage.jsx";
import LobbyPage from "../pages/Landing/Lobby/LobbyPage.jsx";
import GameScreenPage from "../pages/Landing/Game/GameScreenPage.jsx";
import ResultsPage from "../pages/Landing/Results/ResultsPage.jsx";
import ProfilePage from "../pages/Landing/Profile/ProfilePage.jsx";
import SettingsPage from "../pages/Landing/Settings/SettingsPage.jsx";
import TrialPage from "../pages/Trial/TrialPage.jsx";
import { getUserSession } from "../utils/auth.js";

function RequireAuth({ children }) {
  return getUserSession() ? children : <Navigate to="/login" replace />;
}

function RedirectIfAuthenticated({ children }) {
  return getUserSession() ? <Navigate to="/dashboard" replace /> : children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RedirectIfAuthenticated><LandingPage /></RedirectIfAuthenticated>} />
        <Route path="/login" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
        <Route path="/signup" element={<RedirectIfAuthenticated><SignupPage /></RedirectIfAuthenticated>} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/play" element={<RequireAuth><RoomSetupPage /></RequireAuth>} />
        <Route path="/lobby/:roomCode" element={<RequireAuth><LobbyPage /></RequireAuth>} />
        <Route path="/game/:roomCode" element={<RequireAuth><GameScreenPage /></RequireAuth>} />
        <Route path="/results/:roomCode" element={<RequireAuth><ResultsPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
        <Route path="/trial" element={<RequireAuth><TrialPage /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  );
}
