const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Contact", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] px-8 pb-8 pt-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5 text-[19px] font-bold tracking-[-0.01em]">
              <div className="relative h-[30px] w-[30px] rounded-[9px] bg-gradient-to-br from-primary to-secondary shadow-glow">
                <div className="absolute inset-[7px] rounded-[4px] bg-bg" />
              </div>
              InkSprint AI
            </div>
            <p className="mt-2.5 max-w-[260px] text-[13.5px] leading-relaxed text-muted">
              Where creativity meets artificial intelligence. A real-time
              multiplayer drawing game powered by on-device recognition.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-3.5 text-[13px] text-white">{col.heading}</h4>
              {col.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="mb-2.5 block text-[13.5px] text-muted transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-white/[0.08] pt-6 text-[12.5px] text-muted">
          <span>© 2026 InkSprint AI. All rights reserved.</span>
          <span>Built for players who draw fast and think faster.</span>
        </div>
      </div>
    </footer>
  );
}
