import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout.jsx";

export default function TermsPage() {
  return (
    <AuthLayout
      title="Terms of Service"
      subtitle="Please read our terms and conditions carefully."
      footer={
        <Link to="/signup" className="font-semibold text-secondary hover:underline">
          Go back to sign up
        </Link>
      }
    >
      <div className="max-h-[350px] overflow-y-auto pr-2 text-[14px] text-muted leading-relaxed flex flex-col gap-4">
        <div>
          <h4 className="font-semibold text-white mb-1">1. Acceptance of Terms</h4>
          <p>By registering or using InkSprint AI, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-1">2. User Conduct</h4>
          <p>You agree not to use the drawing canvas or nickname fields to generate offensive, obscene, or hateful content. Abuse of our game lobbies or prediction system will result in account suspension.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-1">3. Ownership of Sketches</h4>
          <p>All drawings created during multiplayer sprints are stored temporarily to compute predictions. You grant InkSprint a non-exclusive licence to process these sketches to improve our machine learning models.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-1">4. Account Responsibility</h4>
          <p>You are solely responsible for maintaining the confidentiality of your credentials and account password.</p>
        </div>
      </div>
    </AuthLayout>
  );
}
