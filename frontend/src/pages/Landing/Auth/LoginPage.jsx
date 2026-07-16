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
      </div>
    </AuthLayout>
  );
}
