import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout.jsx";

export default function PrivacyPage() {
  return (
    <AuthLayout
      title="Privacy Policy"
      subtitle="Your privacy is extremely important to us."
      footer={
        <Link to="/signup" className="font-semibold text-secondary hover:underline">
          Go back to sign up
        </Link>
      }
    >
      <div className="max-h-[350px] overflow-y-auto pr-2 text-[14px] text-muted leading-relaxed flex flex-col gap-4">
        <div>
          <h4 className="font-semibold text-white mb-1">1. Information We Collect</h4>
          <p>We collect your email, username, and secure password hashes upon registration. If you sign in via Google, we collect your verified email, name, and profile picture URL.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-1">2. Drawing Data</h4>
          <p>We analyze coordinates of drawn lines locally and temporarily on our servers to check predictions against our Quick, Draw! models. We do not sell your canvas coordinates to third parties.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-1">3. Cookies and Session Storage</h4>
          <p>We use local storage and session cookies to persist your login token. These are essential for keeping you signed in to your account.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-1">4. Contact Us</h4>
          <p>For inquiries regarding your stored account details, please reach out to us at privacy@inksprint.ai.</p>
        </div>
      </div>
    </AuthLayout>
  );
}
