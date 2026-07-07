import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, Bell, Shield, Volume2, UserCog, LogOut, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell.jsx";
import Button from "../../components/common/Button.jsx";
import { Toggle } from "../../components/common/UIAtoms.jsx";
import FormInput from "../../components/common/FormInput.jsx";
import { getUserSession, clearUserSession, getApiBaseUrl } from "../../utils/auth.js";

const TABS = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy", icon: Shield },
  { id: "audio", label: "Audio", icon: Volume2 },
  { id: "account", label: "Account", icon: UserCog },
];

const ACCENTS = [
  { name: "Violet", value: "#6C63FF" },
  { name: "Cyan", value: "#00D4FF" },
  { name: "Coral", value: "#FF4D6D" },
  { name: "Mint", value: "#00FF9C" },
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const user = getUserSession()?.user || { username: "user", email: "user@example.com" };
  const [tab, setTab] = useState("appearance");
  const [accent, setAccent] = useState("#6C63FF");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [account, setAccount] = useState({
    email: user.email || "",
    username: user.username || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    matchInvites: true,
    friendRequests: true,
    dailyChallenge: false,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    showOnlineStatus: true,
    showMatchHistory: true,
    allowFriendRequests: true,
  });

  const [audio, setAudio] = useState({ master: 80, music: 60, sfx: 90 });

  const handleSaveChanges = async () => {
    try {
      // Save account settings to backend
      const response = await fetch(`${getApiBaseUrl()}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getUserSession()?.token}`,
        },
        body: JSON.stringify({
          email: account.email,
          username: account.username,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving changes:", err);
      alert("Failed to save changes. Please try again.");
    }
  };

  const handleChangePassword = async () => {
    if (!account.currentPassword || !account.newPassword || !account.confirmPassword) {
      alert("Please fill in all password fields.");
      return;
    }

    if (account.newPassword !== account.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getUserSession()?.token}`,
        },
        body: JSON.stringify({
          currentPassword: account.currentPassword,
          newPassword: account.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to change password");
      }

      alert("Password changed successfully!");
      setAccount((a) => ({
        ...a,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      console.error("Error changing password:", err);
      alert("Failed to change password. Please try again.");
    }
  };

  const handleLogoutAllDevices = () => {
    if (window.confirm("Are you sure? You'll be logged out of all devices.")) {
      clearUserSession();
      navigate("/");
      window.location.reload();
    }
  };

  return (
    <AppShell title="Settings" subtitle="Manage your account and preferences.">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
        <div className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-shrink-0 items-center gap-2.5 rounded-[10px] px-3.5 py-2.5 text-[13.5px] font-medium transition-colors lg:w-full ${
                tab === t.id ? "bg-white/[0.08] text-white" : "text-muted hover:bg-white/[0.04]"
              }`}
            >
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-7"
        >
          {tab === "appearance" && (
            <div>
              <h3 className="mb-1 text-[16px] font-semibold">Appearance</h3>
              <p className="mb-6 text-[13px] text-muted">
                InkSprint runs in dark mode only, for now — pick an accent color instead.
              </p>
              <div className="flex gap-3">
                {ACCENTS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setAccent(c.value)}
                    className="flex flex-col items-center gap-2"
                  >
                    <span
                      className="h-10 w-10 rounded-full border-2 transition-transform"
                      style={{
                        backgroundColor: c.value,
                        borderColor: accent === c.value ? "white" : "transparent",
                        transform: accent === c.value ? "scale(1.1)" : "scale(1)",
                      }}
                    />
                    <span className="text-[11.5px] text-muted">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div>
              <h3 className="mb-1 text-[16px] font-semibold">Notifications</h3>
              <p className="mb-2 text-[13px] text-muted">Choose what InkSprint notifies you about.</p>
              <div className="divide-y divide-white/[0.06]">
                <Toggle
                  label="Match invites"
                  checked={notifications.matchInvites}
                  onChange={(v) => setNotifications((n) => ({ ...n, matchInvites: v }))}
                />
                <Toggle
                  label="Friend requests"
                  checked={notifications.friendRequests}
                  onChange={(v) => setNotifications((n) => ({ ...n, friendRequests: v }))}
                />
                <Toggle
                  label="Daily challenge reminders"
                  checked={notifications.dailyChallenge}
                  onChange={(v) => setNotifications((n) => ({ ...n, dailyChallenge: v }))}
                />
                <Toggle
                  label="Product updates &amp; news"
                  checked={notifications.marketing}
                  onChange={(v) => setNotifications((n) => ({ ...n, marketing: v }))}
                />
              </div>
            </div>
          )}

          {tab === "privacy" && (
            <div>
              <h3 className="mb-1 text-[16px] font-semibold">Privacy</h3>
              <p className="mb-2 text-[13px] text-muted">Control what other players can see.</p>
              <div className="divide-y divide-white/[0.06]">
                <Toggle
                  label="Show online status"
                  checked={privacy.showOnlineStatus}
                  onChange={(v) => setPrivacy((p) => ({ ...p, showOnlineStatus: v }))}
                />
                <Toggle
                  label="Show match history on profile"
                  checked={privacy.showMatchHistory}
                  onChange={(v) => setPrivacy((p) => ({ ...p, showMatchHistory: v }))}
                />
                <Toggle
                  label="Allow friend requests"
                  checked={privacy.allowFriendRequests}
                  onChange={(v) => setPrivacy((p) => ({ ...p, allowFriendRequests: v }))}
                />
              </div>
            </div>
          )}

          {tab === "audio" && (
            <div>
              <h3 className="mb-1 text-[16px] font-semibold">Audio</h3>
              <p className="mb-6 text-[13px] text-muted">Adjust volume levels.</p>
              <div className="flex flex-col gap-6">
                {[
                  { key: "master", label: "Master volume" },
                  { key: "music", label: "Music" },
                  { key: "sfx", label: "Sound effects" },
                ].map((s) => (
                  <div key={s.key}>
                    <div className="mb-2 flex justify-between text-[13.5px]">
                      <span>{s.label}</span>
                      <span className="font-mono text-muted">{audio[s.key]}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={audio[s.key]}
                      onChange={(e) => setAudio((a) => ({ ...a, [s.key]: Number(e.target.value) }))}
                      className="w-full accent-primary"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "account" && (
            <div>
              <h3 className="mb-1 text-[16px] font-semibold">Account</h3>
              <p className="mb-6 text-[13px] text-muted">Update your account details.</p>
              <FormInput
                label="Email"
                value={account.email}
                onChange={(e) => setAccount((a) => ({ ...a, email: e.target.value }))}
              />
              <FormInput
                label="Username"
                value={account.username}
                onChange={(e) => setAccount((a) => ({ ...a, username: e.target.value }))}
              />
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <Button variant="primary" onClick={handleSaveChanges}>
                  {saveSuccess ? "✓ Saved" : "Save changes"}
                </Button>
                <Button variant="ghost" onClick={() => setTab("account-password")}
                >
                  Change password
                </Button>
              </div>
              {tab === "account-password" && (
                <div className="mt-8 border-t border-white/[0.08] pt-6">
                  <h4 className="mb-4 text-[14px] font-semibold">Change Password</h4>
                  <div className="relative mb-4">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Current password"
                      value={account.currentPassword}
                      onChange={(e) => setAccount((a) => ({ ...a, currentPassword: e.target.value }))}
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-muted outline-none focus:bg-white/[0.08]"
                    />
                  </div>
                  <div className="relative mb-4">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="New password"
                      value={account.newPassword}
                      onChange={(e) => setAccount((a) => ({ ...a, newPassword: e.target.value }))}
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-muted outline-none focus:bg-white/[0.08]"
                    />
                  </div>
                  <div className="relative mb-4">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm password"
                      value={account.confirmPassword}
                      onChange={(e) => setAccount((a) => ({ ...a, confirmPassword: e.target.value }))}
                      className="w-full rounded-lg border border-white/[0.08] bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-muted outline-none focus:bg-white/[0.08]"
                    />
                  </div>
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="mb-4 text-[12px] text-secondary hover:underline"
                  >
                    {showPassword ? "Hide" : "Show"} passwords
                  </button>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button variant="primary" onClick={handleChangePassword}>
                      Update password
                    </Button>
                    <Button variant="ghost" onClick={() => setTab("account")}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              <div className="mt-8 border-t border-white/[0.08] pt-6">
                <Button
                  variant="ghost"
                  className="text-danger hover:bg-danger/[0.08]"
                  onClick={handleLogoutAllDevices}
                >
                  <LogOut size={15} />
                  Log out of all devices
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AppShell>
  );
}
