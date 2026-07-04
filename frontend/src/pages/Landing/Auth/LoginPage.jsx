import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import AuthLayout from "./AuthLayout.jsx";
import FormInput from "../../../components/common/FormInput.jsx";
import PasswordInput from "../../../components/common/PasswordInput.jsx";
import { Checkbox, SocialButton } from "../../../components/common/AuthControls.jsx";
import OrDivider from "../../../components/common/OrDivider.jsx";
import Button from "../../../components/common/Button.jsx";
import { loginSchema } from "../../../utils/validation.js";
import { setUserSession } from "../../../utils/auth.js";

export default function LoginPage() {
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data) {
    setSubmitError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Invalid email or password.');
      }

      setUserSession({ user: result.user, token: result.token }, Boolean(data.remember));
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to jump back into a sprint."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-secondary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormInput
          label="Email"
          icon={Mail}
          placeholder="you@example.com"
          error={errors.email}
          registerProps={register("email")}
        />

        <PasswordInput
          label="Password"
          placeholder="••••••••"
          error={errors.password}
          registerProps={register("password")}
        />

        <div className="mb-6 flex items-center justify-between">
          <Checkbox label="Remember me" registerProps={register("remember")} />
          <Link to="/forgot-password" className="text-[13.5px] text-secondary hover:underline">
            Forgot password?
          </Link>
        </div>

        {submitError && (
          <p className="mb-4 text-[13.5px] text-danger">{submitError}</p>
        )}

        <Button type="submit" variant="primary" className="w-full justify-center" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <OrDivider />

      <div className="flex gap-3">
        <SocialButton label="Google" icon={<GoogleIcon />} />
        <SocialButton label="Discord" icon={<DiscordIcon />} />
      </div>
    </AuthLayout>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A10.99 10.99 0 0 0 12 23z" fill="#34A853"/>
      <path d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.85z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a10.99 10.99 0 0 0-9.82 6.05l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38z" fill="#EA4335"/>
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#5865F2">
      <path d="M20.32 4.37a19.8 19.8 0 0 0-4.9-1.52.07.07 0 0 0-.08.04c-.21.38-.45.87-.61 1.26a18.3 18.3 0 0 0-5.46 0 12.6 12.6 0 0 0-.62-1.26.08.08 0 0 0-.08-.04c-1.7.29-3.36.8-4.9 1.52a.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 6 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-2a.08.08 0 0 0-.04-.11 13 13 0 0 1-1.87-.9.08.08 0 0 1 0-.13c.13-.09.25-.19.37-.28a.08.08 0 0 1 .08 0c3.93 1.8 8.18 1.8 12.06 0a.08.08 0 0 1 .08 0c.12.1.24.19.37.28a.08.08 0 0 1 0 .13c-.6.35-1.22.65-1.87.9a.08.08 0 0 0-.04.11c.36.7.78 1.37 1.23 2a.08.08 0 0 0 .08.03 19.9 19.9 0 0 0 6.03-3.03.08.08 0 0 0 .03-.06c.5-5.18-.83-9.67-3.51-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.17 1.1 2.15 2.42 0 1.34-.94 2.42-2.15 2.42zm7.97 0c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.17 1.1 2.15 2.42 0 1.34-.93 2.42-2.15 2.42z"/>
    </svg>
  );
}
