export function SocialButton({ label, icon, disabled, ...props }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-white/[0.08] bg-white/[0.04] py-2.5 text-[13.5px] font-medium text-white transition-colors hover:bg-white/[0.08] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {icon}
      {label}
    </button>
  );
}

export function Checkbox({ label, registerProps, error }) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-2.5 text-[13.5px] text-muted">
        <input
          type="checkbox"
          {...registerProps}
          className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-white/[0.2] bg-white/[0.04] text-primary accent-primary focus:ring-1 focus:ring-primary/40"
        />
        <span>{label}</span>
      </label>
      {error && <p className="mt-1.5 text-[12.5px] text-danger">{error.message}</p>}
    </div>
  );
}
