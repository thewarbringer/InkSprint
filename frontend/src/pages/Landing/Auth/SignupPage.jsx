import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User } from "lucide-react";
import AuthLayout from "./AuthLayout.jsx";
import FormInput from "../../../components/common/FormInput.jsx";
import PasswordInput from "../../../components/common/PasswordInput.jsx";
import { Checkbox } from "../../../components/common/AuthControls.jsx";
import Button from "../../../components/common/Button.jsx";
import { signupSchema } from "../../../utils/validation.js";
import { setUserSession } from "../../../utils/auth.js";

export default function SignupPage() {
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(signupSchema) });

  async function onSubmit(data) {
    setSubmitError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Unable to create account.');
      }

      setUserSession({ user: result.user, token: result.token });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start sprinting in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-secondary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormInput
          label="Username"
          icon={User}
          placeholder="quickpen"
          error={errors.username}
          registerProps={register("username")}
        />

        <FormInput
          label="Email"
          icon={Mail}
          placeholder="you@example.com"
          error={errors.email}
          registerProps={register("email")}
        />

        <PasswordInput
          label="Password"
          placeholder="At least 8 characters"
          error={errors.password}
          registerProps={register("password")}
        />

        <PasswordInput
          label="Confirm password"
          placeholder="••••••••"
          error={errors.confirmPassword}
          registerProps={register("confirmPassword")}
        />

        <div className="mb-6">
          <Checkbox
            label={
              <>
                I agree to the{" "}
                <Link to="/terms" className="text-secondary hover:underline">Terms of Service</Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-secondary hover:underline">Privacy Policy</Link>
              </>
            }
            registerProps={register("terms")}
            error={errors.terms}
          />
        </div>

        {submitError && (
          <p className="mb-4 text-[13.5px] text-danger">{submitError}</p>
        )}

        <Button type="submit" variant="primary" className="w-full justify-center" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}
