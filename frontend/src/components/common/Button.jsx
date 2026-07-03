import { motion } from "framer-motion";

const VARIANT_STYLES = {
  primary:
    "bg-gradient-to-br from-primary to-accent text-white shadow-none hover:shadow-glow-lg",
  ghost:
    "bg-transparent text-white border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.18]",
};

/**
 * @param {"primary"|"ghost"} variant
 * @param {"button"|"a"} as - render as a <button> or <a>
 */
export default function Button({
  children,
  variant = "primary",
  as = "button",
  className = "",
  ...props
}) {
  const Component = motion[as] ?? motion.button;

  return (
    <Component
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ y: 0, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
      className={`inline-flex items-center gap-2 rounded-[10px] px-[22px] py-[11px] text-[14.5px] font-semibold whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2 ${VARIANT_STYLES[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
