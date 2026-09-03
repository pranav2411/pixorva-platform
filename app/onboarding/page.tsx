"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Oswald, Inter } from "next/font/google";
import { 
  Building2, Briefcase, Calendar, ChevronRight, Check, 
  Search, Eye, EyeOff, ArrowLeft, Loader2, ChevronLeft, Star
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

const TESTIMONIALS = [
  {
    name: "Bryan",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    title: "Revolutionized our video business",
    quote: "Pixorva's AI employees were a game-changer for our video business. A <mark class='bg-[#ffc700] text-black px-1 font-bold rounded-sm'>60% boost in website traffic</mark> from Gordon, better leads from Sarah, and 100% call response from Devon — all working 24/7."
  },
  {
    name: "Steve",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    title: "I've simply been blown away",
    quote: "I've <mark class='bg-[#ffc700] text-black px-1 font-bold rounded-sm'>simply been blown away</mark> by Pixorva. As a 14-month-old one-man shop, marketing was a massive headache — now I actually have a sales process, and Marcus pushes me right when I need it."
  },
  {
    name: "Elena",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    title: "Saved 25+ hours every week",
    quote: "Hiring Sarah and Devon helped our agency scale outreach without hiring 4 SDRs. We saw an immediate <mark class='bg-[#ffc700] text-black px-1 font-bold rounded-sm'>3.2x increase in pipeline</mark> in the first 3 weeks."
  }
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
  
  // Analysis Step State (Step 10)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [timeOptProgress, setTimeOptProgress] = useState<number>(0);
  const [growthAreasProgress, setGrowthAreasProgress] = useState<number>(0);
  const [testimonialIndex, setTestimonialIndex] = useState<number>(0);

  // Auth state
  const [email, setEmail] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronize browser history with step
  useEffect(() => {
    // Replace initial state with step 1
    if (typeof window !== "undefined") {
      window.history.replaceState({ step: 1 }, "", "?step=1");
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && typeof event.state.step === "number") {
        setStep(event.state.step);
      } else {
        setStep((prev) => Math.max(1, prev - 1));
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const goToStep = (newStep: number) => {
    setError(null);
    if (typeof window !== "undefined") {
      window.history.pushState({ step: newStep }, "", `?step=${newStep}`);
    }
    setStep(newStep);
  };

  const handleNext = () => {
    goToStep(Math.min(step + 1, totalSteps));
  };

  const handleBack = () => {
    if (step > 1) {
      if (isAnalyzing && step === 10) {
        setIsAnalyzing(false);
        return;
      }
      goToStep(step - 1);
    } else {
      router.push("/");
    }
  };

  // Step 10 Analysis Simulation
  const startAnalysis = () => {
    setIsAnalyzing(true);
    setTimeOptProgress(0);
    setGrowthAreasProgress(0);

    // Progress 1: Time Optimization
    const interval1 = setInterval(() => {
      setTimeOptProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval1);
          return 100;
        }
        return prev + Math.floor(Math.random() * 12) + 8;
      });
    }, 120);

    // Progress 2: Identifying Growth Areas (starts shortly after)
    setTimeout(() => {
      const interval2 = setInterval(() => {
        setGrowthAreasProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval2);
            // Once both finish, pause briefly and advance to Step 11
            setTimeout(() => {
              goToStep(11);
            }, 800);
            return 100;
          }
          return prev + Math.floor(Math.random() * 10) + 6;
        });
      }, 100);
    }, 600);
  };

  const filteredIndustries = useMemo(() => {
    if (!industrySearch.trim()) return INDUSTRIES;
    return INDUSTRIES.filter(item => 
      item.name.toLowerCase().includes(industrySearch.toLowerCase().trim())
    );
  }, [industrySearch]);

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
    goToStep(12);
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
    <div className={`min-h-screen bg-[#131415] text-white flex flex-col justify-between selection:bg-[#ffc700] selection:text-black ${inter.className}`}>
      
      {/* TOP HEADER & PROGRESS */}
      <header className="pt-6 pb-4 px-6 flex flex-col items-center relative">
        {/* TOP ROW WITH BACK BUTTON & LOGO */}
        <div className="w-full max-w-2xl flex items-center justify-between mb-5">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-neutral-400 hover:text-white transition flex items-center gap-1 text-xs font-bold"
              aria-label="Previous step"
            >
              <ChevronLeft size={18} />
              <span className="hidden sm:inline">Back</span>
            </button>
          ) : (
            <div className="w-9" />
          )}

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <Image
              src="/favicon.ico"
              alt="Pixorva Logo"
              width={28}
              height={28}
              className="w-7 h-7 rounded-lg"
            />
            <span className={`text-2xl md:text-3xl tracking-tighter uppercase italic ${oswald.className} text-white group-hover:text-[#ffc700] transition`}>
              PIXORVA
            </span>
          </Link>

          <div className="w-9" />
        </div>

        {/* PROGRESS BARS */}
        <div className="flex justify-center items-center gap-1.5 max-w-xl mx-auto w-full px-4">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i + 1 <= step ? "bg-[#ffc700]" : "bg-neutral-800"
              }`}
            />
          ))}
        </div>
      </header>

      {/* MAIN BODY */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full">

        {/* STEP 1: USAGE INTENT */}
        {step === 1 && (
          <div className="w-full text-center animate-fadeIn max-w-lg">
            <h1 className={`text-3xl md:text-5xl uppercase mb-8 leading-tight ${oswald.className}`}>
              How will you use your AI team?
            </h1>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => { setUsageIntent("business"); handleNext(); }}
                className="group border border-neutral-800 hover:border-[#ffc700] bg-neutral-900/80 hover:bg-neutral-900 rounded-2xl p-5 flex items-center justify-between text-left transition-all duration-200 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-neutral-800 group-hover:bg-[#ffc700]/10 rounded-xl text-neutral-300 group-hover:text-[#ffc700] transition">
                    <Building2 size={26} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">For my business</h3>
                    <p className="text-sm text-neutral-400">AI Employees that love overtime</p>
                  </div>
                </div>
                <ChevronRight className="text-neutral-500 group-hover:text-[#ffc700] transition" size={22} />
              </button>

              <button
                onClick={() => { setUsageIntent("job"); handleNext(); }}
                className="group border border-neutral-800 hover:border-[#ffc700] bg-neutral-900/80 hover:bg-neutral-900 rounded-2xl p-5 flex items-center justify-between text-left transition-all duration-200 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-neutral-800 group-hover:bg-[#ffc700]/10 rounded-xl text-neutral-300 group-hover:text-[#ffc700] transition">
                    <Briefcase size={26} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">For my job</h3>
                    <p className="text-sm text-neutral-400">So you can log off before 9pm</p>
                  </div>
                </div>
                <ChevronRight className="text-neutral-500 group-hover:text-[#ffc700] transition" size={22} />
              </button>

              <button
                onClick={() => { setUsageIntent("personal"); handleNext(); }}
                className="group border border-neutral-800 hover:border-[#ffc700] bg-neutral-900/80 hover:bg-neutral-900 rounded-2xl p-5 flex items-center justify-between text-left transition-all duration-200 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-neutral-800 group-hover:bg-[#ffc700]/10 rounded-xl text-neutral-300 group-hover:text-[#ffc700] transition">
                    <Calendar size={26} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">For my personal life</h3>
                    <p className="text-sm text-neutral-400">No spreadsheet degree required</p>
                  </div>
                </div>
                <ChevronRight className="text-neutral-500 group-hover:text-[#ffc700] transition" size={22} />
              </button>
            </div>

            <div className="mt-8">
              <span className="text-sm text-neutral-400">Already have an account? </span>
              <Link href="/login" className="text-sm font-bold text-white hover:text-[#ffc700] transition">
                Sign in
              </Link>
            </div>
          </div>
        )}

        {/* STEP 2: WEBSITE URL */}
        {step === 2 && (
          <div className="w-full text-center animate-fadeIn max-w-lg">
            <h1 className={`text-3xl md:text-5xl uppercase mb-8 leading-tight ${oswald.className}`}>
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
                className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#ffc700] rounded-xl px-5 py-4 text-white text-center text-lg focus:outline-none transition shadow-inner"
              />
              <button
                type="submit"
                className="bg-[#ffc700] text-black font-black py-4 rounded-xl hover:bg-yellow-400 transition text-sm uppercase tracking-wide shadow-md"
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
            <h1 className={`text-3xl md:text-5xl uppercase mb-8 leading-tight ${oswald.className}`}>
              How many emails do you receive per day?
            </h1>
            <div className="flex flex-col gap-3">
              {["10", "50", "100", "> 100"].map((count) => (
                <button
                  key={count}
                  onClick={() => { setEmailsCount(count); handleNext(); }}
                  className="group border border-neutral-800 hover:border-[#ffc700] bg-neutral-900/80 hover:bg-neutral-900 rounded-xl p-4 flex items-center justify-between transition-all"
                >
                  <span className="font-bold text-white text-base pl-2">{count}</span>
                  <ChevronRight className="text-neutral-500 group-hover:text-[#ffc700] transition" size={20} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: INTRODUCING SARAH */}
        {step === 4 && (
          <div className="w-full text-center animate-fadeIn max-w-lg flex flex-col items-center">
            <div className="w-64 h-64 relative rounded-2xl overflow-hidden mb-6 border-2 border-neutral-700 shadow-2xl bg-neutral-900">
              <video 
                src="/GIF/Sarah.mp4"
                poster="/GIF/Sarah.png"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className={`text-2xl md:text-3xl font-black mb-6 ${oswald.className}`}>
              Meet Sarah, your AI Executive Assistant. She will tame your inbox.
            </h2>
            <div className="flex flex-col gap-3 text-left w-full mb-8 text-sm text-neutral-300">
              <div className="flex items-center gap-3">
                <span className="text-[#ffc700] font-bold">✓</span>
                <span>Categorize emails by importance. And with a lot of style.</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#ffc700] font-bold">✓</span>
                <span>Draft responses based on your style</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#ffc700] font-bold">✓</span>
                <span>Learn from your interactions</span>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-[#ffc700] hover:bg-yellow-400 text-black py-4 rounded-xl font-black text-sm uppercase tracking-wide transition shadow-lg"
            >
              That sounds great! Continue
            </button>
          </div>
        )}

        {/* STEP 5: SOCIAL MEDIA FREQUENCY */}
        {step === 5 && (
          <div className="w-full text-center animate-fadeIn max-w-lg">
            <h1 className={`text-3xl md:text-5xl uppercase mb-8 leading-tight ${oswald.className}`}>
              How often do you post on social media?
            </h1>
            <div className="flex flex-col gap-3">
              {["Everyday", "2-3 times a week", "When I remember", "Never"].map((freq) => (
                <button
                  key={freq}
                  onClick={() => { setSocialFrequency(freq); handleNext(); }}
                  className="group border border-neutral-800 hover:border-[#ffc700] bg-neutral-900/80 hover:bg-neutral-900 rounded-xl p-4 flex items-center justify-between transition-all"
                >
                  <span className="font-bold text-white text-base pl-2">{freq}</span>
                  <ChevronRight className="text-neutral-500 group-hover:text-[#ffc700] transition" size={20} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: INTRODUCING MARCUS */}
        {step === 6 && (
          <div className="w-full text-center animate-fadeIn max-w-lg flex flex-col items-center">
            <div className="w-64 h-64 relative rounded-2xl overflow-hidden mb-6 border-2 border-neutral-700 shadow-2xl bg-neutral-900">
              <video 
                src="/GIF/Marcus.mp4"
                poster="/GIF/Marcus.png"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className={`text-2xl md:text-3xl font-black mb-6 ${oswald.className}`}>
              Want to get more engagement? Stay consistent. Marcus will post on socials for you.
            </h2>
            <div className="flex flex-col gap-3 text-left w-full mb-8 text-sm text-neutral-300">
              <div className="flex items-center gap-3">
                <span className="text-[#ffc700] font-bold">✓</span>
                <span>Send you daily viral post ideas</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#ffc700] font-bold">✓</span>
                <span>Generate on-brand pictures</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#ffc700] font-bold">✓</span>
                <span>Connected to all your social media accounts</span>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-[#ffc700] hover:bg-yellow-400 text-black py-4 rounded-xl font-black text-sm uppercase tracking-wide transition shadow-lg"
            >
              That sounds great! Continue
            </button>
          </div>
        )}

        {/* STEP 7: ARTICLES / BLOG FREQUENCY */}
        {step === 7 && (
          <div className="w-full text-center animate-fadeIn max-w-lg">
            <h1 className={`text-3xl md:text-5xl uppercase mb-8 leading-tight ${oswald.className}`}>
              How often do you post new articles on your website?
            </h1>
            <div className="flex flex-col gap-3">
              {["Everyday", "2-3 times a week", "When I remember", "Never"].map((freq) => (
                <button
                  key={freq}
                  onClick={() => { setArticleFrequency(freq); handleNext(); }}
                  className="group border border-neutral-800 hover:border-[#ffc700] bg-neutral-900/80 hover:bg-neutral-900 rounded-xl p-4 flex items-center justify-between transition-all"
                >
                  <span className="font-bold text-white text-base pl-2">{freq}</span>
                  <ChevronRight className="text-neutral-500 group-hover:text-[#ffc700] transition" size={20} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 8: INTRODUCING GORDON */}
        {step === 8 && (
          <div className="w-full text-center animate-fadeIn max-w-lg flex flex-col items-center">
            <div className="w-64 h-64 relative rounded-2xl overflow-hidden mb-6 border-2 border-neutral-700 shadow-2xl bg-neutral-900">
              <video 
                src="/GIF/Gordon.mp4"
                poster="/GIF/Gordon.png"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className={`text-2xl md:text-3xl font-black mb-6 ${oswald.className}`}>
              To get more visitors from Google, Gordon will create great content pieces that rank well on Google.
            </h2>
            <div className="flex flex-col gap-3 text-left w-full mb-8 text-sm text-neutral-300">
              <div className="flex items-center gap-3">
                <span className="text-[#ffc700] font-bold">✓</span>
                <span>Send you daily article ideas</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#ffc700] font-bold">✓</span>
                <span>Expert SEO</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#ffc700] font-bold">✓</span>
                <span>Connected to your website</span>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-[#ffc700] hover:bg-yellow-400 text-black py-4 rounded-xl font-black text-sm uppercase tracking-wide transition shadow-lg"
            >
              That sounds great! Continue
            </button>
          </div>
        )}

        {/* STEP 9: BUSINESS INDUSTRY SELECTOR */}
        {step === 9 && (
          <div className="w-full text-center animate-fadeIn max-w-xl">
            <h1 className={`text-3xl md:text-5xl uppercase mb-6 leading-tight ${oswald.className}`}>
              What business are you in?
            </h1>
            
            {/* Search Input */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search..."
                value={industrySearch}
                onChange={(e) => setIndustrySearch(e.target.value)}
                className="w-full bg-neutral-900 border-b-2 border-neutral-700 focus:border-[#ffc700] px-4 py-3 text-center text-white text-base focus:outline-none transition"
              />
            </div>

            {/* Pill Cloud */}
            <div className="flex flex-wrap justify-center gap-2.5 max-h-[380px] overflow-y-auto pr-1 py-1">
              {filteredIndustries.map((item) => (
                <button
                  key={item.name}
                  onClick={() => { setIndustry(item.name); handleNext(); }}
                  className="bg-neutral-900/90 hover:bg-[#ffc700] hover:text-black border border-neutral-700 hover:border-[#ffc700] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>{item.emoji}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 10: COMPARISON & LIVE ANALYSIS PROGRESS SCREEN */}
        {step === 10 && (
          <div className="w-full text-center animate-fadeIn max-w-xl flex flex-col items-center">
            
            {!isAnalyzing ? (
              /* Screen 10A: Ready to analyze */
              <>
                <h1 className={`text-3xl md:text-5xl uppercase mb-10 leading-tight ${oswald.className}`}>
                  You&apos;re all set - let&apos;s see how your business compares.
                </h1>

                <div className="flex flex-col w-full mb-10 text-left">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between border-b border-neutral-800/80 py-4">
                    <span className="text-base md:text-lg font-bold text-white">
                      181 {industry} Companies Found
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#ffc700] text-black flex items-center justify-center font-black text-xs shadow">
                      ✓
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between border-b border-neutral-800/80 py-4">
                    <span className="text-base md:text-lg font-bold text-white">
                      Time Optimization Potential
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#ffc700] text-black flex items-center justify-center font-black text-xs shadow">
                      ✓
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center justify-between border-b border-neutral-800/80 py-4">
                    <span className="text-base md:text-lg font-bold text-white">
                      Identifying Growth Areas
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#ffc700] text-black flex items-center justify-center font-black text-xs shadow">
                      ✓
                    </div>
                  </div>
                </div>

                <button
                  onClick={startAnalysis}
                  className="w-full bg-[#ffc700] hover:bg-yellow-400 text-black py-4 rounded-xl font-black text-sm uppercase tracking-wide transition shadow-lg"
                >
                  Continue to see results
                </button>
              </>
            ) : (
              /* Screen 10B: Live Analyzing with Progress Tickers & Testimonial Box */
              <>
                <h1 className={`text-2xl md:text-4xl uppercase mb-8 leading-tight ${oswald.className}`}>
                  Analyzing success patterns from <br />
                  <span className="text-[#ffc700]">{industry}</span> businesses we&apos;ve helped
                </h1>

                {/* Progress items */}
                <div className="flex flex-col w-full mb-8 text-left">
                  
                  {/* Item 1: Completed */}
                  <div className="flex items-center justify-between border-b border-neutral-800/80 py-3.5">
                    <span className="text-sm md:text-base font-bold text-white">
                      181 {industry} Companies Found
                    </span>
                    <div className="w-5 h-5 rounded-full bg-[#ffc700] text-black flex items-center justify-center font-black text-xs shadow">
                      ✓
                    </div>
                  </div>

                  {/* Item 2: Time Optimization Potential */}
                  <div className="flex items-center justify-between border-b border-neutral-800/80 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm md:text-base font-bold text-white">
                        Time Optimization Potential
                      </span>
                      {timeOptProgress < 100 && (
                        <span className="w-2 h-2 rounded-full bg-[#ffc700] animate-ping inline-block" />
                      )}
                    </div>
                    {timeOptProgress >= 100 ? (
                      <div className="w-5 h-5 rounded-full bg-[#ffc700] text-black flex items-center justify-center font-black text-xs shadow">
                        ✓
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 w-32">
                        <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#ffc700] transition-all duration-150"
                            style={{ width: `${timeOptProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-400 font-mono w-9 text-right">
                          {timeOptProgress}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Item 3: Identifying Growth Areas */}
                  <div className="flex items-center justify-between border-b border-neutral-800/80 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm md:text-base font-bold text-white">
                        Identifying Growth Areas
                      </span>
                      {timeOptProgress >= 100 && growthAreasProgress < 100 && (
                        <span className="w-2 h-2 rounded-full bg-[#ffc700] animate-ping inline-block" />
                      )}
                    </div>
                    {growthAreasProgress >= 100 ? (
                      <div className="w-5 h-5 rounded-full bg-[#ffc700] text-black flex items-center justify-center font-black text-xs shadow">
                        ✓
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 w-32">
                        <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#ffc700] transition-all duration-150"
                            style={{ width: `${growthAreasProgress}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-400 font-mono w-9 text-right">
                          {growthAreasProgress}%
                        </span>
                      </div>
                    )}
                  </div>

                </div>

                {/* TESTIMONIAL CAROUSEL CARD */}
                <div className="w-full bg-[#1c1d20] border border-neutral-800 rounded-2xl p-6 text-left shadow-2xl relative">
                  <h3 className={`text-xl font-bold uppercase tracking-wide text-center text-white mb-4 ${oswald.className}`}>
                    40,000+ happy businesses
                  </h3>

                  {/* Reviewer Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden relative border border-neutral-700">
                      <Image 
                        src={TESTIMONIALS[testimonialIndex].avatar} 
                        alt={TESTIMONIALS[testimonialIndex].name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-none mb-1">
                        {TESTIMONIALS[testimonialIndex].name}
                      </h4>
                      {/* Trustpilot Stars */}
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <div key={s} className="w-3.5 h-3.5 bg-[#00b67a] flex items-center justify-center rounded-sm">
                            <Star size={10} className="fill-white text-white" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Title & Quote */}
                  <h5 className="font-bold text-sm text-white mb-1.5">
                    {TESTIMONIALS[testimonialIndex].title}
                  </h5>
                  <p 
                    className="text-xs text-neutral-300 leading-relaxed mb-4"
                    dangerouslySetInnerHTML={{ __html: TESTIMONIALS[testimonialIndex].quote }}
                  />

                  {/* Carousel Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                    <div className="flex gap-1.5">
                      {TESTIMONIALS.map((_, idx) => (
                        <div 
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            idx === testimonialIndex ? "bg-[#ffc700]" : "bg-neutral-700"
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setTestimonialIndex((prev) => (prev > 0 ? prev - 1 : TESTIMONIALS.length - 1))}
                        className="w-7 h-7 rounded-full border border-neutral-700 hover:border-neutral-400 text-neutral-400 hover:text-white flex items-center justify-center transition"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setTestimonialIndex((prev) => (prev < TESTIMONIALS.length - 1 ? prev + 1 : 0))}
                        className="w-7 h-7 rounded-full border border-neutral-700 hover:border-neutral-400 text-neutral-400 hover:text-white flex items-center justify-center transition"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

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
                className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#ffc700] rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none transition placeholder:text-neutral-500"
              />
              <button
                type="submit"
                className="w-full bg-[#ffc700] hover:bg-yellow-400 text-black py-3.5 rounded-xl font-black text-sm uppercase tracking-wide transition shadow-md"
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
                  className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#ffc700] rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition placeholder:text-neutral-500"
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
                    className="w-full bg-neutral-900 border border-neutral-700 focus:border-[#ffc700] rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition placeholder:text-neutral-500 pr-10"
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
                className="w-full bg-[#ffc700] hover:bg-yellow-400 text-black py-3.5 rounded-xl font-black text-sm uppercase tracking-wide transition shadow-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
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
