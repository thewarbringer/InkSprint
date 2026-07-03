import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, Crown } from "lucide-react";
import AppShell from "../../components/layout/AppShell.jsx";
import Button from "../../components/common/Button.jsx";
import { Avatar } from "../../components/common/UIAtoms.jsx";
import { RESULTS_DATA } from "../../constants/appData.js";

export default function ResultsPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const r = RESULTS_DATA;

  return (
    <AppShell title="Round results" subtitle={`Room ${roomCode}`}>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-success/[0.14] to-secondary/[0.06] p-8 text-center"
          >
            <Crown className="mx-auto mb-3 text-warning" size={28} />
            <div className="mb-1 text-[13px] uppercase tracking-[0.06em] text-muted">
              {r.isYou ? "You won the round" : `${r.winner} won the round`}
            </div>
            <div className="mb-4 font-mono text-[32px] font-bold">{r.word}</div>
            <div className="flex justify-center gap-8 text-[13.5px] text-muted">
              <div>
                <div className="font-mono text-[18px] text-white">{r.recognitionTime}</div>
                recognition time
              </div>
              <div>
                <div className="font-mono text-[18px] text-success">+{r.xpGained} XP</div>
                earned
              </div>
            </div>
          </motion.div>

          {r.achievementsUnlocked.length > 0 && (
            <div className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6">
              <h3 className="mb-3 text-[14px] font-semibold">Achievement unlocked</h3>
              {r.achievementsUnlocked.map((a) => (
                <div key={a.title} className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-warning/[0.15] text-warning">
                    <Award size={20} />
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold">{a.title}</div>
                    <div className="text-[12.5px] text-muted">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="primary" className="flex-1 justify-center" onClick={() => navigate(`/lobby/${roomCode}`)}>
              Play again
            </Button>
            <Button variant="ghost" className="flex-1 justify-center" onClick={() => navigate("/dashboard")}>
              Back to dashboard
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.05] p-6">
          <h3 className="mb-4 text-[14px] font-semibold">Standings</h3>
          <div className="flex flex-col gap-3">
            {r.standings.map((s) => (
              <div
                key={s.name}
                className={`flex items-center justify-between rounded-[10px] px-3 py-2.5 ${
                  s.isYou ? "bg-primary/[0.1]" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-4 font-mono text-[13px] text-muted">{s.rank}</span>
                  <Avatar name={s.name} size={30} />
                  <span className="text-[13.5px] font-medium">{s.name}</span>
                </div>
                <span className="font-mono text-[13.5px]">{s.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
