import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/Landing/LandingPage.jsx";
import LoginPage from "../pages/Landing/Auth/LoginPage.jsx";
import SignupPage from "../pages/Landing/Auth/SignupPage.jsx";
import DashboardPage from "../pages/Landing/Dashboard/DashboardPage.jsx";
import RoomSetupPage from "../pages/Landing/Room/RoomSetupPage.jsx";
import LobbyPage from "../pages/Landing/Lobby/LobbyPage.jsx";
import GameScreenPage from "../pages/Landing/Game/GameScreenPage.jsx";
import ResultsPage from "../pages/Landing/Results/ResultsPage.jsx";
import ProfilePage from "../pages/Landing/Profile/ProfilePage.jsx";
import LeaderboardPage from "../pages/Landing/Leaderboard/LeaderboardPage.jsx";
import SettingsPage from "../pages/Landing/Settings/SettingsPage.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/play" element={<RoomSetupPage />} />
        <Route path="/lobby/:roomCode" element={<LobbyPage />} />
        <Route path="/game/:roomCode" element={<GameScreenPage />} />
        <Route path="/results/:roomCode" element={<ResultsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
 