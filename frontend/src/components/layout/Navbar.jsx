import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../common/Button.jsx";
import { getCurrentUser, clearUserSession, fetchCurrentUser, getUserToken, setUserSession } from "../../utils/auth.js";
import { CURRENT_USER } from "../../constants/appData.js";

const LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const lastY = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    function handleScroll() {
      const y = window.scrollY;
      setHidden(y > lastY.current && y > 120);
      lastY.current = y;
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleStorage = () => setUser(getCurrentUser());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // If we don't have a user in session but a token exists, try fetching user info
  useEffect(() => {
    if (user) return;
    const token = getUserToken();
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        const fetched = await fetchCurrentUser();
        if (!cancelled && fetched) {
          setUser(fetched);
          // Persist so other tabs/components can read it too
          try {
            setUserSession({ user: fetched, token }, true);
          } catch (e) {
            // ignore
          }
        }
      } catch (err) {
        console.error('Failed to fetch current user from token', err);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  const handleLogout = () => {
    clearUserSession();
    setUser(null);
    navigate('/');
  };

  return (
    <motion.nav
      animate={{ y: hidden ? "-100%" : 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.08] bg-bg/55 backdrop-blur-2xl"
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-8 py-[18px]">
        <div className="flex items-center gap-2.5 text-[19px] font-bold tracking-[-0.01em]">
          <div className="relative h-[30px] w-[30px] rounded-[9px] bg-gradient-to-br from-primary to-secondary shadow-glow">
            <div className="absolute inset-[7px] rounded-[4px] bg-bg" />
          </div>
          InkSprint AI
        </div>

        <div className="hidden gap-9 text-[14.5px] text-muted md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/** displayUser falls back to CURRENT_USER so we always have a visible name */}
              <span className="mr-3 text-[14px] font-medium text-white">{(user || CURRENT_USER)?.username || (user || CURRENT_USER)?.name || (user || CURRENT_USER)?.email || 'Player'}</span>
              <Button as="a" href="/dashboard" variant="ghost">
                Dashboard
              </Button>
              <Button as="button" onClick={handleLogout} variant="primary">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button as="a" href="/login" variant="ghost">
                Log in
              </Button>
              <Button as="a" href="/play" variant="primary">
                Play free
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
