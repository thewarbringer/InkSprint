import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import AuthLayout from "./AuthLayout.jsx";
import FormInput from "../../../components/common/FormInput.jsx";
import Button from "../../../components/common/Button.jsx";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Mock sending reset link (or add actual backend API here if desired)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Unable to request password reset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle={`We've sent a password reset link to ${email}.`}
        footer={
          <Link to="/login" className="flex items-center justify-center gap-1.5 font-semibold text-secondary hover:underline">
            <ArrowLeft size={14} /> Back to log in
          </Link>
        }
      >
        <div className="text-center py-6 text-[14.5px] text-muted">
          Click the link in the email to set a new password. If you don't receive it in a few minutes, check your spam folder.
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email to receive a password reset link."
      footer={
        <Link to="/login" className="flex items-center justify-center gap-1.5 font-semibold text-secondary hover:underline">
          <ArrowLeft size={14} /> Back to log in
        </Link>
      }
    >
      <form onSubmit={handleReset} noValidate>
        <FormInput
          label="Email address"
          icon={Mail}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          placeholder="you@example.com"
          type="email"
        />

        {error && (
          <p className="mb-4 text-[13.5px] text-danger">{error}</p>
        )}

        <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
          {loading ? "Sending link…" : "Send reset link"}
        </Button>
      </form>
    </AuthLayout>
  );
}
