import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Swords, Trophy, User, Settings, LogOut } from "lucide-react";
import { clearUserSession } from "../../utils/auth.js";

const ICONS = { LayoutDashboard, Swords, Trophy, User, Settings };

const LINKS = [
  { label: "Dashboard", to: "/dashboard", icon: "LayoutDashboard" },
  { label: "Play", to: "/play", icon: "Swords" },
  { label: "Profile", to: "/profile", icon: "User" },
  { label: "Settings", to: "/settings", icon: "Settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUserSession();
    navigate("/");
    window.location.reload();
  };
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[240px] flex-col border-r border-white/[0.08] bg-bg/70 backdrop-blur-xl md:flex">
      <div className="flex items-center gap-2.5 px-6 py-6 text-[18px] font-bold tracking-[-0.01em]">
        <div className="relative h-[28px] w-[28px] rounded-[8px] bg-gradient-to-br from-primary to-secondary shadow-glow">
          <div className="absolute inset-[6px] rounded-[4px] bg-bg" />
        </div>
        InkSprint AI
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {LINKS.map((link) => {
          const Icon = ICONS[link.icon];
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-[14px] font-medium transition-colors ${
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-muted hover:bg-white/[0.04] hover:text-white"
                }`
              }
            >
              <Icon size={17} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-[14px] font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-danger"
        >
          <LogOut size={17} />
          Log out
        </button>
      </div>
    </aside>
  );
}
