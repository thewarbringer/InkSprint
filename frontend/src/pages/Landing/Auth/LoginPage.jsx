import { useState, useEffect, useRef, useCallback } from "react";
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
  const [googleReady, setGoogleReady] = useState(false);
  const googleBtnRef = useRef(null);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  // Google credential callback — receives the ID token from Google
  const handleGoogleCredential = useCallback(
    async (response) => {
      setSubmitError(null);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/google-signin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });

        const result = await res.json();

        // No account found → redirect to signup
        if (res.status === 404) {
          navigate("/signup");
          return;
        }

        if (!res.ok) {
          throw new Error(result.message || "Google sign-in failed.");
        }

        setUserSession({ user: result.user, token: result.token }, true);
        navigate("/dashboard");
      } catch (err) {
        console.error("Google login error:", err);
        setSubmitError(err.message || "Google sign-in failed. Please try again.");
      }
    },
    [navigate]
  );

  // Initialize Google Identity Services once the script loads
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    function initGoogleSignIn() {
      if (!clientId) {
        console.error('Missing VITE_GOOGLE_CLIENT_ID env var. Add it to frontend/.env');
        return false;
      }

      if (!window.google?.accounts?.id) return false;

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredential,
          auto_select: false,
        });

        if (googleBtnRef.current) {
          // Render Google's official sign-in button into our container
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: "filled_black",
            size: "large",
            shape: "pill",
            text: "continue_with",
            width: 350,
          });
        }

        setGoogleReady(true);
        return true;
      } catch (err) {
        console.error("Google Sign-In initialization error:", err);
        return false;
      }
    }

    // Try immediately (script might already be loaded)
    if (initGoogleSignIn()) return;

    // Poll until the GSI script loads (check every 300ms, up to 15s)
    let attempts = 0;
    const maxAttempts = 50;
    const interval = setInterval(() => {
      attempts++;
      if (initGoogleSignIn() || attempts >= maxAttempts) {
        clearInterval(interval);
        if (attempts >= maxAttempts && !window.google?.accounts?.id) {
          console.warn("Google Sign-In script failed to load after 15 seconds");
        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, [handleGoogleCredential]);

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

      <div className="flex flex-col gap-3">
        {/* Google renders its own official button here */}
        <div
          ref={googleBtnRef}
          className="flex justify-center rounded-[10px] overflow-hidden [&>div]:!w-full [&>div>div]:!w-full"
        />
        {/* Fallback if Google button hasn't loaded */}
        {!googleReady && (
          <div className="text-center text-[13px] text-muted py-2">
            Loading Google Sign-In…
          </div>
        )}

        <SocialButton label="Discord" icon={<DiscordIcon />} />
      </div>
    </AuthLayout>
  );
}

function DiscordIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#5865F2">
      <path d="M20.32 4.37a19.8 19.8 0 0 0-4.9-1.52.07.07 0 0 0-.08.04c-.21.38-.45.87-.61 1.26a18.3 18.3 0 0 0-5.46 0 12.6 12.6 0 0 0-.62-1.26.08.08 0 0 0-.08-.04c-1.7.29-3.36.8-4.9 1.52a.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 6 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-2a.08.08 0 0 0-.04-.11 13 13 0 0 1-1.87-.9.08.08 0 0 1 0-.13c.13-.09.25-.19.37-.28a.08.08 0 0 1 .08 0c3.93 1.8 8.18 1.8 12.06 0a.08.08 0 0 1 .08 0c.12.1.24.19.37.28a.08.08 0 0 1 0 .13c-.6.35-1.22.65-1.87.9a.08.08 0 0 0-.04.11c.36.7.78 1.37 1.23 2a.08.08 0 0 0 .08.03 19.9 19.9 0 0 0 6.03-3.03.08.08 0 0 0 .03-.06c.5-5.18-.83-9.67-3.51-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.17 1.1 2.15 2.42 0 1.34-.94 2.42-2.15 2.42zm7.97 0c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42 1.21 0 2.17 1.1 2.15 2.42 0 1.34-.93 2.42-2.15 2.42z"/>
    </svg>
  );
}
