"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/supabase/client";
import { Oswald, Inter } from "next/font/google";
import { ArrowLeft, Mail, Loader2, KeyRound, RefreshCw } from "lucide-react";
import Link from "next/link";
import { showToast } from "../utils/Toast";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate agreement
    if (!agree) {
      setMessage({ type: "error", text: "You must agree to the Terms and Privacy Policy." });
      setLoading(false);
      return;
    }

    // Validate email
    if (!email.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email address." });
      setLoading(false);
      return;
    }

    try {
      // 1. Check if user account exists
      const checkRes = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const checkData = await checkRes.json();

      // If user does NOT exist (new user or previously erased user):
      // Redirect them to the Get Started onboarding flow to start fresh!
      if (!checkData.exists) {
        showToast("No account found for this email. Redirecting you to Get Started to create your workspace...", "success");
        setTimeout(() => {
          router.push("/onboarding");
        }, 1200);
        return;
      }

      // 2. User exists: send Magic Link OTP
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      });

      if (otpError) throw otpError;

      setOtpSent(true);
      setMessage({
        type: "success",
        text: `We sent a magic sign-in link and verification code to ${email}.`,
      });
      showToast("Magic sign-in email sent!", "success");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to send sign-in link" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setMessage({ type: "error", text: "Please enter the verification code from your email." });
      return;
    }

    setVerifying(true);
    setMessage(null);

    try {
      const supabase = createClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode.trim(),
        type: "email",
      });

      if (verifyError) throw verifyError;

      showToast("Verified successfully! Welcome back.", "success");
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Invalid or expired verification code." });
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      });
      if (otpError) throw otpError;
      setMessage({ type: "success", text: "New verification code and magic link sent! Check your inbox." });
      showToast("New email dispatched!", "success");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to resend email" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 ${inter.className}`}>
      
      {/* Back Button */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`text-4xl uppercase tracking-tighter italic mb-2 ${oswald.className}`}>
            Pixorva
          </div>
          <h1 className="text-2xl font-bold">
            {otpSent ? "Check your inbox" : "Welcome back"}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {otpSent
              ? `We sent a magic link and 8-digit code to ${email}`
              : "Enter your email to sign in to your workspace."}
          </p>
        </div>

        {/* MESSAGES */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs font-semibold text-center ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {!otpSent ? (
          /* STEP 1: ENTER EMAIL */
          <form onSubmit={handleSendMagicLink} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition text-sm"
                  required
                />
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="flex items-start gap-3 mt-4 text-xs font-semibold text-gray-600">
              <input
                type="checkbox"
                id="agree-checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 cursor-pointer w-4 h-4 border-2 border-black rounded focus:ring-0 accent-black"
                required
              />
              <label htmlFor="agree-checkbox" className="cursor-pointer select-none leading-relaxed">
                I agree to Pixorva&apos;s{" "}
                <Link href="/terms" target="_blank" className="underline font-bold text-black hover:text-yellow-600">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" target="_blank" className="underline font-bold text-black hover:text-yellow-600">Privacy & Policies</Link>.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading || !agree}
              className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-wide hover:bg-yellow-400 hover:text-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Send Magic Link"}
            </button>
          </form>
        ) : (
          /* STEP 2: VERIFICATION CODE INPUT OR RESEND EMAIL */
          <div className="space-y-6">
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                  Enter 8-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="e.g. 25821115"
                    maxLength={8}
                    autoFocus
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition text-sm font-mono tracking-widest text-center"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={verifying || !otpCode.trim()}
                className="w-full bg-[#ffc700] text-black py-4 rounded-xl font-bold uppercase tracking-wide hover:bg-yellow-400 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {verifying ? <Loader2 className="animate-spin" size={18} /> : "Verify & Log In"}
              </button>
            </form>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs uppercase tracking-wide transition flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                <span>Request Another Email</span>
              </button>

              <button
                type="button"
                onClick={() => { setOtpSent(false); setMessage(null); }}
                className="text-xs text-gray-500 hover:text-black text-center font-semibold"
              >
                ← Use a different email
              </button>
            </div>
          </div>
        )}
        
        <p className="text-center text-xs text-gray-400 mt-8">
          Confirm your data is processed securely under global standards (DPDPA / GDPR).
        </p>

      </div>
    </div>
  );
}