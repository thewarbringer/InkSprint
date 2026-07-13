import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../pages/Landing/LandingPage.jsx";
import LoginPage from "../pages/Landing/Auth/LoginPage.jsx";
import SignupPage from "../pages/Landing/Auth/SignupPage.jsx";
import DashboardPage from "../pages/Landing/Dashboard/DashboardPage.jsx";
import RoomSetupPage from "../pages/Landing/Room/RoomSetupPage.jsx";
import LobbyPage from "../pages/Landing/Lobby/LobbyPage.jsx";
import GameScreenPage from "../pages/Landing/Game/GameScreenPage.jsx";
import ResultsPage from "../pages/Landing/Results/ResultsPage.jsx";
import ProfilePage from "../pages/Landing/Profile/ProfilePage.jsx";
import LeaderboardPage from "../pages/Leaderboard/LeaderboardPage.jsx";
import SettingsPage from "../pages/Landing/Settings/SettingsPage.jsx";
import TrialPage from "../pages/Trial/TrialPage.jsx";
import { getUserToken } from "../utils/auth.js";

/**
 * GuestRoute — only renders children if the user is NOT logged in.
 * If already logged in, redirects to /dashboard.
 */
function GuestRoute({ children }) {
  const isLoggedIn = Boolean(getUserToken());
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/play" element={<RoomSetupPage />} />
        <Route path="/lobby/:roomCode" element={<LobbyPage />} />
        <Route path="/game/:roomCode" element={<GameScreenPage />} />
        <Route path="/results/:roomCode" element={<ResultsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/trial" element={<TrialPage />} />
      </Routes>
    </BrowserRouter>
  );
}
