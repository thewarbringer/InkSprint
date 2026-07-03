import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/Landing/LandingPage.jsx";
import LoginPage from "../pages/Auth/LoginPage.jsx";
import SignupPage from "../pages/Auth/SignupPage.jsx";
import DashboardPage from "../pages/Dashboard/DashboardPage.jsx";
import RoomSetupPage from "../pages/Room/RoomSetupPage.jsx";
import LobbyPage from "../pages/Lobby/LobbyPage.jsx";
import GameScreenPage from "../pages/Game/GameScreenPage.jsx";
import ResultsPage from "../pages/Results/ResultsPage.jsx";
import ProfilePage from "../pages/Profile/ProfilePage.jsx";
import LeaderboardPage from "../pages/Leaderboard/LeaderboardPage.jsx";
import SettingsPage from "../pages/Settings/SettingsPage.jsx";

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
