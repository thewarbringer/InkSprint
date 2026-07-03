import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import FormInput from "./FormInput.jsx";

export default function PasswordInput({ label, error, registerProps, placeholder }) {
  const [visible, setVisible] = useState(false);

  return (
    <FormInput
      label={label}
      icon={Lock}
      error={error}
      type={visible ? "text" : "password"}
      placeholder={placeholder}
      registerProps={registerProps}
      rightElement={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="text-muted transition-colors hover:text-white"
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      }
    />
  );
}
