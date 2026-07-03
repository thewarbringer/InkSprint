/**
 * Uncontrolled input driven by react-hook-form. Pass `icon` as a lucide-react
 * component, and spread {...register("fieldName")} into `registerProps` —
 * react-hook-form's own ref travels in there, so this component doesn't
 * need to forward a ref itself.
 */
export default function FormInput({
  label,
  icon: Icon,
  error,
  type = "text",
  registerProps,
  placeholder,
  rightElement,
}) {
  return (
    <div className="mb-5">
      <label className="mb-1.5 block text-[13.5px] font-medium text-muted">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
        )}
        <input
          type={type}
          placeholder={placeholder}
          {...registerProps}
          className={`w-full rounded-[10px] border bg-white/[0.04] py-3 text-[14.5px] text-white placeholder:text-white/[0.25] transition-colors focus:outline-none focus:ring-1 ${
            Icon ? "pl-10" : "pl-3.5"
          } ${rightElement ? "pr-10" : "pr-3.5"} ${
            error
              ? "border-danger/60 focus:border-danger focus:ring-danger/40"
              : "border-white/[0.08] focus:border-primary/60 focus:ring-primary/40"
          }`}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && <p className="mt-1.5 text-[12.5px] text-danger">{error.message}</p>}
    </div>
  );
}
