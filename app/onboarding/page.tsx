"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Oswald, Inter } from "next/font/google";
import { 
  Building2, Briefcase, Calendar, ChevronRight, Check, 
  Search, Eye, EyeOff, ArrowLeft, Loader2 
} from "lucide-react";
import { createClient } from "../utils/supabase/client";
import { showToast } from "../utils/Toast";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

const INDUSTRIES = [
  { name: "Accounting", emoji: "📊" },
  { name: "Advertising", emoji: "📢" },
  { name: "Agriculture", emoji: "🌾" },
  { name: "AI", emoji: "🤖" },
  { name: "Analytics", emoji: "📈" },
  { name: "App Development", emoji: "📱" },
  { name: "Architecture", emoji: "🏗️" },
  { name: "Asset Management", emoji: "💼" },
  { name: "Automotive", emoji: "🚗" },
  { name: "Bakery", emoji: "🥐" },
  { name: "Banking", emoji: "🏛️" },
  { name: "Bar", emoji: "🍺" },
  { name: "Beauty Salon", emoji: "💄" },
  { name: "Big Data", emoji: "📊" },
  { name: "Billing Services", emoji: "💳" },
  { name: "Biotechnology", emoji: "🧬" },
  { name: "Blockchain", emoji: "⛓️" },
  { name: "Bookkeeping", emoji: "📚" },
  { name: "Brewing", emoji: "🍻" },
  { name: "Building Maintenance", emoji: "🔧" },
  { name: "Business Consulting", emoji: "💼" },
  { name: "Catering", emoji: "🍽️" },
  { name: "Child Care", emoji: "👶" },
  { name: "Cleaning Services", emoji: "🧹" },
  { name: "Cloud Computing", emoji: "☁️" },
  { name: "Coffee Shop", emoji: "☕" },
  { name: "Commercial Real Estate", emoji: "🏢" },
  { name: "Computer Repair", emoji: "💻" },
  { name: "Graphic Design", emoji: "🎨" },
  { name: "Fitness & Gym", emoji: "🏋️" },
  { name: "Healthcare", emoji: "🏥" },
  { name: "Legal Services", emoji: "⚖️" },
  { name: "Logistics", emoji: "📦" },
  { name: "Hospitality", emoji: "🏨" },
  { name: "E-Commerce", emoji: "🛒" },
  { name: "Education", emoji: "🎓" },
  { name: "Real Estate", emoji: "🏡" },
  { name: "Cybersecurity", emoji: "🛡️" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 12;

  // Form State
  const [usageIntent, setUsageIntent] = useState<string>("");
  const [websiteUrl, setWebsiteUrl] = useState<string>("");
  const [emailsCount, setEmailsCount] = useState<string>("");
  const [socialFrequency, setSocialFrequency] = useState<string>("");
  const [articleFrequency, setArticleFrequency] = useState<string>("");
  const [industry, setIndustry] = useState<string>("Accounting");
  const [industrySearch, setIndustrySearch] = useState<string>("");
  
  // Auth state
  const [email, setEmail] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const filteredIndustries = useMemo(() => {
    if (!industrySearch.trim()) return INDUSTRIES;
    return INDUSTRIES.filter(item => 
      item.name.toLowerCase().includes(industrySearch.toLowerCase().trim())
    );
  }, [industrySearch]);

  const handleNext = () => {
    setError(null);
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/workspace`
        }
      });
      if (signInError) throw signInError;
    } catch (err: any) {
      setError(err.message || "Failed to continue with Google");
      setLoading(false);
    }
  };

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    setError(null);
    setStep(12);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            industry,
            website: websiteUrl,
            usage_intent: usageIntent,
          }
        }
      });

      if (signUpError) throw signUpError;

      showToast("Account created successfully! Welcome to Pixorva.", "success");
      router.push("/trial");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#111214] text-white flex flex-col justify-between selection:bg-yellow-400 selection:text-black ${inter.className}`}>
      
      {/* TOP BAR / PROGRESS */}
      <header className="pt-8 pb-4 px-6 flex flex-col items-center">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 mb-6 group cursor-pointer">
          <Image
            src="/favicon.ico"
            alt="Pixorva Logo"
            width={32}
            height={32}
            className="w-8 h-8 rounded-lg"
          />
          <span className={`text-3xl tracking-tighter uppercase italic ${oswald.className} text-white group-hover:text-yellow-400 transition`}>
            PIXORVA
          </span>
        </Link>

        {/* PROGRESS BARS */}
        <div className="flex justify-center items-center gap-2 max-w-xl mx-auto w-full px-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i + 1 <= step ? "bg-yellow-400" : "bg-neutral-800"
              }`}
            />
          ))}
        </div>
      </header>

      {/* CONTENT AREA */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">

        {/* STEP 1: USAGE INTENT */}
        {step === 1 && (
          <div className="w-full text-center animate-fadeIn">
            <h1 className={`text-3xl md:text-5xl uppercase mb-8 ${oswald.className}`}>
              How will you use your AI team?
            </h1>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => { setUsageIntent("business"); handleNext(); }}
                className="group border border-neutral-700 hover:border-yellow-400 bg-neutral-900/60 hover:bg-neutral-900 rounded-2xl p-5 flex items-center justify-between text-left transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-neutral-800 group-hover:bg-yellow-400/10 rounded-xl text-neutral-300 group-hover:text-yellow-400 transition">
                    <Building2 size={26} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">For my business</h3>
                    <p className="text-sm text-neutral-400">AI Employees that love overtime</p>
                  </div>
                </div>
                <ChevronRight className="text-neutral-500 group-hover:text-yellow-400 transition" size={20} />
              </button>

              <button
                onClick={() => { setUsageIntent("job"); handleNext(); }}
                className="group border border-neutral-700 hover:border-yellow-400 bg-neutral-900/60 hover:bg-neutral-900 rounded-2xl p-5 flex items-center justify-between text-left transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-neutral-800 group-hover:bg-yellow-400/10 rounded-xl text-neutral-300 group-hover:text-yellow-400 transition">
                    <Briefcase size={26} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">For my job</h3>
                    <p className="text-sm text-neutral-400">So you can log off before 9pm</p>
                  </div>
                </div>
                <ChevronRight className="text-neutral-500 group-hover:text-yellow-400 transition" size={20} />
              </button>

              <button
                onClick={() => { setUsageIntent("personal"); handleNext(); }}
                className="group border border-neutral-700 hover:border-yellow-400 bg-neutral-900/60 hover:bg-neutral-900 rounded-2xl p-5 flex items-center justify-between text-left transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-neutral-800 group-hover:bg-yellow-400/10 rounded-xl text-neutral-300 group-hover:text-yellow-400 transition">
                    <Calendar size={26} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">For my personal life</h3>
                    <p className="text-sm text-neutral-400">No spreadsheet degree required</p>
                  </div>
                </div>
                <ChevronRight className="text-neutral-500 group-hover:text-yellow-400 transition" size={20} />
              </button>
            </div>

            <div className="mt-8">
              <span className="text-sm text-neutral-400">Already have an account? </span>
              <Link href="/login" className="text-sm font-bold text-white hover:text-yellow-400 transition">
                Sign in
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: WEBSITE URL */}
        {step === 2 && (
          <div className="w-full text-center animate-fadeIn max-w-lg">
            <h1 className={`text-3xl md:text-5xl uppercase mb-8 ${oswald.className}`}>
              What&apos;s your website&apos;s URL?
            </h1>
            <form 
              onSubmit={(e) => { e.preventDefault(); handleNext(); }}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                placeholder="yourbusiness.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                autoFocus
                className="w-full bg-neutral-900 border border-neutral-700 focus:border-yellow-400 rounded-xl px-5 py-4 text-white text-center text-lg focus:outline-none transition shadow-inner"
              />
              <button
                type="submit"
                className="bg-yellow-400 text-black font-bold py-3.5 rounded-xl hover:bg-yellow-300 transition text-sm uppercase tracking-wide font-black"
              >
                Continue
              </button>
            </form>
            <div className="mt-5">
              <button
                onClick={() => { setWebsiteUrl(""); handleNext(); }}
                className="text-sm text-neutral-400 hover:text-white underline transition"
              >
                I don&apos;t have a website
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: EMAIL VOLUME */}
        {step === 3 && (
          <div className="w-full text-center animate-fadeIn max-w-lg">
            <h1 className={`text-3xl md:text-5xl uppercase mb-8 ${oswald.className}`}>
              How many emails do you receive per day?
            </h1>
            <div className="flex flex-col gap-3">
              {["10", "50", "100", "> 100"].map((count) => (
                <button
                  key={count}
                  onClick={() => { setEmailsCount(count); handleNext(); }}
                  className="group border border-neutral-700 hover:border-yellow-400 bg-neutral-900/60 hover:bg-neutral-900 rounded-xl p-4 flex items-center justify-between transition-all"
                >
                  <span className="font-bold text-white text-base pl-2">{count}</span>
                  <ChevronRight className="text-neutral-500 group-hover:text-yellow-400 transition" size={18} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: INTRODUCING EVA */}
        {step === 4 && (
          <div className="w-full text-center animate-fadeIn max-w-lg flex flex-col items-center">
            <div className="w-64 h-64 relative rounded-2xl overflow-hidden mb-6 border-2 border-neutral-700 shadow-2xl">
              <Image 
                src="/onboarding/eva.png"
                alt="Eva - AI Executive Assistant"
                fill
                className="object-cover"
                priority
              />
            </div>
            <h2 className={`text-2xl md:text-3xl font-black mb-6 ${oswald.className}`}>
              Meet Eva, your AI Executive Assistant. She will tame your inbox.
            </h2>
            <div className="flex flex-col gap-3 text-left w-full mb-8 text-sm text-neutral-300">
              <div className="flex items-center gap-3">
                <span className="text-yellow-400 font-bold">✓</span>
                <span>Categorize emails by importance. And with a lot of style.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-400 font-bold">✓</span>
                <span>Draft responses based on your style</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-400 font-bold">✓</span>
                <span>Learn from your interactions</span>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-4 rounded-xl font-black text-sm uppercase tracking-wide transition shadow-lg"
            >
              That sounds great! Continue
            </button>
          </div>
        )}

        {/* STEP 5: SOCIAL MEDIA FREQUENCY */}
        {step === 5 && (
          <div className="w-full text-center animate-fadeIn max-w-lg">
            <h1 className={`text-3xl md:text-5xl uppercase mb-8 ${oswald.className}`}>
              How often do you post on social media?
            </h1>
            <div className="flex flex-col gap-3">
              {["Everyday", "2-3 times a week", "When I remember", "Never"].map((freq) => (
                <button
                  key={freq}
                  onClick={() => { setSocialFrequency(freq); handleNext(); }}
                  className="group border border-neutral-700 hover:border-yellow-400 bg-neutral-900/60 hover:bg-neutral-900 rounded-xl p-4 flex items-center justify-between transition-all"
                >
                  <span className="font-bold text-white text-base pl-2">{freq}</span>
                  <ChevronRight className="text-neutral-500 group-hover:text-yellow-400 transition" size={18} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: INTRODUCING SONNY */}
        {step === 6 && (
          <div className="w-full text-center animate-fadeIn max-w-lg flex flex-col items-center">
            <div className="w-64 h-64 relative rounded-2xl overflow-hidden mb-6 border-2 border-neutral-700 shadow-2xl">
              <Image 
                src="/onboarding/sonny.png"
                alt="Sonny - AI Socials Agent"
                fill
                className="object-cover"
                priority
              />
            </div>
            <h2 className={`text-2xl md:text-3xl font-black mb-6 ${oswald.className}`}>
              Want to get more engagement? Stay consistent. Sonny will post on socials for you.
            </h2>
            <div className="flex flex-col gap-3 text-left w-full mb-8 text-sm text-neutral-300">
              <div className="flex items-center gap-3">
                <span className="text-yellow-400 font-bold">✓</span>
                <span>Send you daily viral post ideas</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-400 font-bold">✓</span>
                <span>Generate on-brand pictures</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-400 font-bold">✓</span>
                <span>Connected to all your social media accounts</span>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-4 rounded-xl font-black text-sm uppercase tracking-wide transition shadow-lg"
            >
              That sounds great! Continue
            </button>
          </div>
        )}

        {/* STEP 7: ARTICLES / BLOG FREQUENCY */}
        {step === 7 && (
          <div className="w-full text-center animate-fadeIn max-w-lg">
            <h1 className={`text-3xl md:text-5xl uppercase mb-8 ${oswald.className}`}>
              How often do you post new articles on your website?
            </h1>
            <div className="flex flex-col gap-3">
              {["Everyday", "2-3 times a week", "When I remember", "Never"].map((freq) => (
                <button
                  key={freq}
                  onClick={() => { setArticleFrequency(freq); handleNext(); }}
                  className="group border border-neutral-700 hover:border-yellow-400 bg-neutral-900/60 hover:bg-neutral-900 rounded-xl p-4 flex items-center justify-between transition-all"
                >
                  <span className="font-bold text-white text-base pl-2">{freq}</span>
                  <ChevronRight className="text-neutral-500 group-hover:text-yellow-400 transition" size={18} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 8: INTRODUCING PENNY */}
        {step === 8 && (
          <div className="w-full text-center animate-fadeIn max-w-lg flex flex-col items-center">
            <div className="w-64 h-64 relative rounded-2xl overflow-hidden mb-6 border-2 border-neutral-700 shadow-2xl">
              <Image 
                src="/onboarding/penny.png"
                alt="Penny - AI SEO & Content Specialist"
                fill
                className="object-cover"
                priority
              />
            </div>
            <h2 className={`text-2xl md:text-3xl font-black mb-6 ${oswald.className}`}>
              To get more visitors from Google, Penny will create great content piece that ranks well on Google.
            </h2>
            <div className="flex flex-col gap-3 text-left w-full mb-8 text-sm text-neutral-300">
              <div className="flex items-center gap-3">
                <span className="text-yellow-400 font-bold">✓</span>
                <span>Send you daily article ideas</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-400 font-bold">✓</span>
                <span>Expert SEO</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-yellow-400 font-bold">✓</span>
                <span>Connected to your website</span>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-4 rounded-xl font-black text-sm uppercase tracking-wide transition shadow-lg"
            >
              That sounds great! Continue
            </button>
          </div>
        )}

        {/* STEP 9: BUSINESS INDUSTRY SELECTOR */}
        {step === 9 && (
          <div className="w-full text-center animate-fadeIn max-w-xl">
            <h1 className={`text-3xl md:text-5xl uppercase mb-6 ${oswald.className}`}>
              What business are you in?
            </h1>
            
            {/* Search Input */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search..."
                value={industrySearch}
                onChange={(e) => setIndustrySearch(e.target.value)}
                className="w-full bg-neutral-900 border-b-2 border-neutral-700 focus:border-yellow-400 px-4 py-3 text-center text-white text-base focus:outline-none transition"
              />
            </div>

            {/* Pill Cloud */}
            <div className="flex flex-wrap justify-center gap-2.5 max-h-[380px] overflow-y-auto pr-1 py-1">
              {filteredIndustries.map((item) => (
                <button
                  key={item.name}
                  onClick={() => { setIndustry(item.name); handleNext(); }}
                  className="bg-neutral-900/90 hover:bg-yellow-400 hover:text-black border border-neutral-700 hover:border-yellow-400 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>{item.emoji}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 10: BUSINESS COMPARISON / ANALYZER */}
        {step === 10 && (
          <div className="w-full text-center animate-fadeIn max-w-lg flex flex-col items-center">
            <h1 className={`text-2xl md:text-4xl uppercase mb-10 ${oswald.className}`}>
              You&apos;re all set - let&apos;s see how your business compares.
            </h1>

            <div className="flex flex-col gap-5 w-full mb-10">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <span className="text-base font-bold text-neutral-200">
                  181 {industry} Companies Found
                </span>
                <div className="w-6 h-6 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <span className="text-base font-bold text-neutral-200">
                  Time Optimization Potential
                </span>
                <div className="w-6 h-6 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <span className="text-base font-bold text-neutral-200">
                  Identifying Growth Areas
                </span>
                <div className="w-6 h-6 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-4 rounded-xl font-black text-sm uppercase tracking-wide transition shadow-lg"
            >
              Continue to see results
            </button>
          </div>
        )}

        {/* STEP 11: REACH YOUR GOALS (GOOGLE OR EMAIL) */}
        {step === 11 && (
          <div className="w-full text-center animate-fadeIn max-w-md">
            <h1 className={`text-3xl md:text-4xl uppercase mb-2 ${oswald.className}`}>
              Reach your goals with Pixorva
            </h1>
            <p className="text-sm text-neutral-400 mb-8">
              Sign up to see how AI employees can help you succeed
            </p>

            {error && (
              <div className="bg-red-950/50 border border-red-500 text-red-200 px-4 py-2.5 rounded-xl text-xs mb-5 text-left">
                {error}
              </div>
            )}

            {/* GOOGLE SIGN IN */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-3 transition mb-6 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* DIVIDER */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-[1px] bg-neutral-800" />
              <span className="text-xs text-neutral-500 font-bold uppercase">OR</span>
              <div className="flex-1 h-[1px] bg-neutral-800" />
            </div>

            {/* EMAIL FORM */}
            <form onSubmit={handleEmailContinue} className="flex flex-col gap-4">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-neutral-900 border border-neutral-700 focus:border-yellow-400 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none transition placeholder:text-neutral-500"
              />
              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide transition font-black shadow-md"
              >
                Continue with email
              </button>
            </form>
          </div>
        )}

        {/* STEP 12: REGISTER / PASSWORD */}
        {step === 12 && (
          <div className="w-full text-center animate-fadeIn max-w-md">
            <h1 className={`text-3xl md:text-4xl uppercase mb-2 ${oswald.className}`}>
              Reach your goals with Pixorva
            </h1>
            <p className="text-sm text-neutral-400 mb-6">
              Sign up to see how AI employees can help you succeed
            </p>

            {error && (
              <div className="bg-red-950/50 border border-red-500 text-red-200 px-4 py-2.5 rounded-xl text-xs mb-5 text-left">
                {error}
              </div>
            )}

            {/* EMAIL PILL BADGE */}
            <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 px-4 py-2.5 rounded-xl mb-6 text-left">
              <div className="w-7 h-7 rounded-full bg-neutral-700 text-white font-bold text-xs flex items-center justify-center uppercase">
                {email[0] || "U"}
              </div>
              <span className="text-sm font-semibold text-neutral-300 truncate">
                {email}
              </span>
            </div>

            {/* REGISTER FORM */}
            <form onSubmit={handleRegister} className="flex flex-col gap-4 text-left">
              <div>
                <label className="text-xs text-neutral-400 font-bold block mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-neutral-900 border border-neutral-700 focus:border-yellow-400 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition placeholder:text-neutral-500"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 font-bold block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-neutral-900 border border-neutral-700 focus:border-yellow-400 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition placeholder:text-neutral-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black py-3.5 rounded-xl font-black text-sm uppercase tracking-wide transition shadow-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                <span>Register</span>
              </button>
            </form>

            <div className="mt-6 flex justify-start">
              <button
                onClick={handleBack}
                className="text-xs font-bold text-neutral-400 hover:text-white flex items-center gap-1.5 transition"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="py-6 text-center text-xs text-neutral-600">
        © {new Date().getFullYear()} Pixorva Inc. All rights reserved.
      </footer>
    </div>
  );
}
