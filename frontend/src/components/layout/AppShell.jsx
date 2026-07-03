import { Bell } from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import { Avatar } from "../common/UIAtoms.jsx";
import { CURRENT_USER } from "../../constants/appData.js";
import AnimatedBackground from "../common/AnimatedBackground.jsx";

export default function AppShell({ title, subtitle, children }) {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <AnimatedBackground />
      <Sidebar />

      <div className="relative z-[3] md:pl-[240px]">
        <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-bg/60 px-6 py-4 backdrop-blur-xl md:px-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[20px] font-bold tracking-[-0.01em]">{title}</h1>
              {subtitle && <p className="text-[13px] text-muted">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-4">
              <button className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.05] text-muted transition-colors hover:text-white">
                <Bell size={16} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger" />
              </button>
              <div className="flex items-center gap-2.5">
                <Avatar name={CURRENT_USER.username} gradient={CURRENT_USER.avatarGrad} size={34} />
                <div className="hidden sm:block">
                  <div className="text-[13.5px] font-semibold leading-tight">{CURRENT_USER.username}</div>
                  <div className="text-[11.5px] leading-tight text-muted">{CURRENT_USER.tag}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-6 py-8 md:px-10">{children}</main>
      </div>
    </div>
  );
}
