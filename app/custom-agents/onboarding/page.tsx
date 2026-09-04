"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Oswald, Inter } from "next/font/google";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Globe,
  Check,
  CheckCheck,
  Copy,
  Mail,
  Phone,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  Briefcase,
  Layers,
  Database,
  ShieldCheck,
  Server,
  Headphones,
  Zap,
  Code,
  BarChart3,
  ClipboardList,
  Rocket,
  PlusCircle
} from "lucide-react";

const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"] });
const inter = Inter({ subsets: ["latin"] });

const TOTAL_STEPS = 8;

const AGENTS_LIST = [
  "Cy", "Devon", "Finn", "Gordon", "Holly", "Larry", 
  "Lawson", "Marcus", "Pat", "Quinn", "Ruby", "Sam", 
  "Sarah", "Stella", "Vic"
];

const ROLE_OPTIONS = [
  { 
    id: "support", 
    title: "24/7 Tier-1 & Tier-2 Support", 
    desc: "Ticket triaging, empathy-first resolving, escalation routing", 
    icon: <Headphones size={20} className="text-[#ffc700]" /> 
  },
  { 
    id: "sales", 
    title: "Sales & Inbound Lead Qualifier", 
    desc: "Autonomous prospect scoring, outbound cadences, CRM updates", 
    icon: <Briefcase size={20} className="text-[#ffc700]" /> 
  },
  { 
    id: "devops", 
    title: "DevOps & Cloud SRE Guard", 
    desc: "Log monitoring, canary alerts, auto-rollback triggers", 
    icon: <Zap size={20} className="text-[#ffc700]" /> 
  },
  { 
    id: "fullstack", 
    title: "Full-Stack Code Synthesizer", 
    desc: "PR creation, unit test authoring, architectural sandboxing", 
    icon: <Code size={20} className="text-[#ffc700]" /> 
  },
  { 
    id: "finance", 
    title: "Financial & Invoicing Auditor", 
    desc: "Tax receipts reconciliation, anomaly detection, payment tracking", 
    icon: <BarChart3 size={20} className="text-[#ffc700]" /> 
  },
  { 
    id: "governance", 
    title: "Compliance & Safety Auditor", 
    desc: "PII masking, audit logging, security policy enforcement", 
    icon: <ShieldCheck size={20} className="text-[#ffc700]" /> 
  },
  { 
    id: "ops", 
    title: "Internal Operations Coordinator", 
    desc: "Calendar dispatch, sprint reports, cross-team sync digests", 
    icon: <ClipboardList size={20} className="text-[#ffc700]" /> 
  },
  { 
    id: "marketing", 
    title: "Growth & Content Strategist", 
    desc: "SEO research, blog authoring, social content scheduling", 
    icon: <Rocket size={20} className="text-[#ffc700]" /> 
  },
  { 
    id: "other", 
    title: "Other / Custom Role", 
    desc: "Specify your proprietary role or custom department workflow", 
    icon: <PlusCircle size={20} className="text-[#ffc700]" /> 
  }
];

const INTEGRATION_OPTIONS = [
  "Slack", "Discord", "HubSpot", "Salesforce", "PostgreSQL",
  "MongoDB", "Snowflake", "Notion", "GitHub", "Jira",
  "Stripe / Razorpay", "WhatsApp API", "Custom REST / GraphQL", "Other"
];

const INDUSTRIES = [
  "SaaS & Software", "FinTech & Banking", "E-Commerce & Retail",
  "Healthcare & MedTech", "Logistics & Supply Chain", "Legal & Compliance",
  "Real Estate & PropTech", "Education & EdTech", "Manufacturing",
  "Agency & Consulting", "Media & Entertainment", "Other"
];

export default function CustomAgentOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const [bgAgent, setBgAgent] = useState<string>("Devon");

  // Form Fields
  const [companyName, setCompanyName] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [industry, setIndustry] = useState<string>("SaaS & Software");
  const [companySize, setCompanySize] = useState<string>("11-50");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([
    "24/7 Tier-1 & Tier-2 Support",
    "Sales & Inbound Lead Qualifier"
  ]);
  const [customRoleText, setCustomRoleText] = useState<string>("");
  const [customIndustryText, setCustomIndustryText] = useState<string>("");
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([
    "Slack",
    "PostgreSQL"
  ]);
  const [customIntegrationText, setCustomIntegrationText] = useState<string>("");
  const [bottlenecks, setBottlenecks] = useState<string>("");
  const [dailyVolume, setDailyVolume] = useState<string>("1,000 - 5,000 actions/day");
  const [hostingPreference, setHostingPreference] = useState<string>("Managed Dedicated Cloud");
  const [fullName, setFullName] = useState<string>("");
  const [workEmail, setWorkEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [timeline, setTimeline] = useState<string>("Immediate (< 2 weeks)");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");

  // Select a random agent video background on load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * AGENTS_LIST.length);
    setBgAgent(AGENTS_LIST[randomIndex]);
  }, []);

  // Clean domain for favicon
  const cleanDomain = React.useMemo(() => {
    if (!website) return "";
    try {
      const url = website.startsWith("http://") || website.startsWith("https://") ? website : `https://${website}`;
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch (e) {
      return website.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    }
  }, [website]);

  // Handle browser back/forward buttons
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.replaceState({ step: 1 }, "", window.location.pathname);
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

  const goToStep = (nextStep: number) => {
    setSubmitError(null);
    if (typeof window !== "undefined") {
      window.history.pushState({ step: nextStep }, "", window.location.pathname);
    }
    setStep(nextStep);
  };

  const handleBack = () => {
    if (step > 1 && !submittedRequest) {
      goToStep(step - 1);
    } else {
      router.push("/custom-agents");
    }
  };

  const toggleRole = (title: string) => {
    setSelectedRoles(prev => 
      prev.includes(title) ? prev.filter(r => r !== title) : [...prev, title]
    );
  };

  const toggleIntegration = (item: string) => {
    setSelectedIntegrations(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (!fullName.trim() || !workEmail.trim()) {
      setSubmitError("Please fill in your full name and work email.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const finalRoles = selectedRoles.map(r => {
      if (r === "Other / Custom Role" && customRoleText.trim()) {
        return `Other: ${customRoleText.trim()}`;
      }
      return r;
    });

    const finalIndustry = (industry === "Other" && customIndustryText.trim())
      ? `Other: ${customIndustryText.trim()}`
      : industry;

    const finalIntegrations = selectedIntegrations.map(i => {
      if (i === "Other" && customIntegrationText.trim()) {
        return `Other: ${customIntegrationText.trim()}`;
      }
      return i;
    });

    try {
      const response = await fetch("/api/custom-agents/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          website,
          industry: finalIndustry,
          companySize,
          roles: finalRoles,
          integrations: finalIntegrations,
          bottlenecks,
          dailyVolume,
          hostingPreference,
          fullName,
          workEmail,
          phone,
          timeline,
          additionalNotes
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request.");
      }

      setSubmittedRequest({
        refId: data.refId,
        companyName,
        website,
        industry: finalIndustry,
        companySize,
        roles: finalRoles,
        integrations: finalIntegrations,
        workEmail,
        fullName,
        timeline,
        bottlenecks
      });
      setStep(9); // Confirmation state
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred while submitting your request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyRefId = () => {
    if (submittedRequest?.refId) {
      navigator.clipboard.writeText(submittedRequest.refId);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  // Progress percentage
  const progressPercent = step <= TOTAL_STEPS ? Math.round(((step - 1) / (TOTAL_STEPS - 1)) * 100) : 100;

  return (
    <div className={`min-h-screen bg-[#0e0f12] text-white ${inter.className} flex flex-col selection:bg-[#ffc700] selection:text-black relative overflow-x-hidden`}>
      
      {/* Background Ambient Video */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <video
          key={bgAgent}
          src={`/GIF/${bgAgent}.mp4`}
          poster={`/GIF/${bgAgent}.png`}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-25 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0f12]/85 via-[#0e0f12]/75 to-[#0e0f12]/95 backdrop-blur-[1px]" />
      </div>

      {/* Top Header - Seamless Margin with max-w-7xl */}
      <header className="bg-[#141519]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="bg-black/50 text-white p-2 rounded-xl hover:bg-[#ffc700] hover:text-black transition border border-white/15 shadow-sm flex items-center justify-center shrink-0"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-[#ffc700]">
                Agent Onboarding
              </span>
              <h1 className={`text-lg sm:text-xl font-black uppercase text-white ${oswald.className}`}>
                Get Agents for Your Business
              </h1>
            </div>
          </div>

          {!submittedRequest && (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 bg-black/40 border border-white/10 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Agent Sandbox
              </span>
              <span className="text-xs font-bold text-neutral-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
                Step {step} of {TOTAL_STEPS}
              </span>
            </div>
          )}
        </div>

        {/* Top Slim Progress Bar */}
        {!submittedRequest && (
          <div className="w-full bg-white/5 h-1">
            <div
              className="bg-[#ffc700] h-1 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </header>

      {/* Main Sequential Form Content - Translucent Glassmorphism Card */}
      <main className="flex-grow flex items-center justify-center py-10 px-6 relative z-10">
        <div className="w-full max-w-2xl bg-[#141519]/75 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
          
          {/* STEP 1: Company Name */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#ffc700]">
                  Question 1 of 8
                </span>
                <h2 className={`text-3xl sm:text-4xl font-black uppercase text-white ${oswald.className}`}>
                  What is the name of your business?
                </h2>
                <p className="text-sm text-neutral-400">
                  We will configure your agents with your company identity and operating guidelines.
                </p>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="e.g. Acme Technologies, Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && companyName.trim()) {
                      goToStep(2);
                    }
                  }}
                  autoFocus
                  className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-4 text-base text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] focus:bg-black/60 transition"
                />
              </div>

              {submitError && (
                <div className="text-xs text-red-400 bg-red-950/40 border border-red-800 p-3 rounded-xl">
                  {submitError}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="text-xs text-neutral-500">Press Enter ↵ to continue</span>
                <button
                  type="button"
                  onClick={() => {
                    if (!companyName.trim()) {
                      setSubmitError("Please enter your company or business name.");
                      return;
                    }
                    goToStep(2);
                  }}
                  className="bg-[#ffc700] hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 active:scale-95 shadow-md"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Website Domain */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#ffc700]">
                  Question 2 of 8
                </span>
                <h2 className={`text-3xl sm:text-4xl font-black uppercase text-white ${oswald.className}`}>
                  What is your business website?
                </h2>
                <p className="text-sm text-neutral-400">
                  Your website helps us inspect your brand identity, product documentation, and public knowledge base.
                </p>
              </div>

              <div className="space-y-2">
                <div className="relative flex items-center">
                  <div className="absolute left-4 flex items-center justify-center w-5 h-5">
                    {cleanDomain ? (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`}
                        alt="Domain favicon"
                        className="w-4 h-4 rounded-sm object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Globe size={18} className="text-neutral-500" />
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        goToStep(3);
                      }
                    }}
                    autoFocus
                    className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl pl-12 pr-5 py-4 text-base text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] focus:bg-black/60 transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className="text-xs font-bold text-neutral-400 hover:text-white transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="bg-[#ffc700] hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 active:scale-95 shadow-md"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Industry & Company Size */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#ffc700]">
                  Question 3 of 8
                </span>
                <h2 className={`text-3xl sm:text-4xl font-black uppercase text-white ${oswald.className}`}>
                  Industry & Company Size
                </h2>
                <p className="text-sm text-neutral-400">
                  Select the domain sector that matches your operational regulations.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Primary Industry
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ffc700] focus:bg-black/60"
                  >
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind} className="bg-[#141519]">
                        {ind}
                      </option>
                    ))}
                  </select>
                  {industry === "Other" && (
                    <div className="space-y-1 pt-2 animate-fadeIn">
                      <input
                        type="text"
                        placeholder="Please specify your industry (e.g. CleanTech, Aerospace, Non-Profit...)"
                        value={customIndustryText}
                        onChange={(e) => setCustomIndustryText(e.target.value)}
                        autoFocus
                        className="w-full bg-black/40 backdrop-blur-md border border-[#ffc700]/50 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] focus:bg-black/60"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Current Team Size
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {["1-10", "11-50", "51-200", "201-1000", "1000+"].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setCompanySize(size)}
                        className={`p-3 rounded-xl text-xs font-bold transition border ${
                          companySize === size
                            ? "bg-[#ffc700] text-black border-yellow-300 shadow-sm"
                            : "bg-black/30 backdrop-blur-sm text-neutral-300 border-white/10 hover:border-white/25 hover:bg-black/50"
                        }`}
                      >
                        {size} people
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className="text-xs font-bold text-neutral-400 hover:text-white transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(4)}
                  className="bg-[#ffc700] hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 active:scale-95 shadow-md"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Workforce Roles Needed */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#ffc700]">
                  Question 4 of 8
                </span>
                <h2 className={`text-3xl sm:text-4xl font-black uppercase text-white ${oswald.className}`}>
                  Which roles do you need agents for?
                </h2>
                <p className="text-sm text-neutral-400">
                  Select all the departments and functions you would like autonomous agents to perform.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
                {ROLE_OPTIONS.map((role) => {
                  const isSelected = selectedRoles.includes(role.title);
                  return (
                    <div
                      key={role.id}
                      onClick={() => toggleRole(role.title)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                        isSelected
                          ? "bg-[#ffc700]/15 backdrop-blur-md border-[#ffc700] shadow-[0_0_12px_rgba(255,199,0,0.15)]"
                          : "bg-black/40 backdrop-blur-md border-white/10 hover:border-white/25 hover:bg-black/60"
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-black/50 border border-white/10 shrink-0 flex items-center justify-center">
                        {role.icon}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-bold text-xs text-white truncate">{role.title}</h5>
                          {isSelected && (
                            <CheckCircle2 size={16} className="text-[#ffc700] shrink-0 ml-1" />
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{role.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedRoles.includes("Other / Custom Role") && (
                <div className="space-y-1.5 pt-2 animate-fadeIn">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#ffc700]">
                    Specify your other custom role:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Healthcare Claims Specialist, Supply Chain Analyst, Legal Paralegal..."
                    value={customRoleText}
                    onChange={(e) => setCustomRoleText(e.target.value)}
                    autoFocus
                    className="w-full bg-black/50 backdrop-blur-md border border-[#ffc700]/50 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] focus:bg-black/70 transition"
                  />
                </div>
              )}

              {submitError && (
                <div className="text-xs text-red-400 bg-red-950/40 border border-red-800 p-3 rounded-xl">
                  {submitError}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => goToStep(3)}
                  className="text-xs font-bold text-neutral-400 hover:text-white transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedRoles.length === 0) {
                      setSubmitError("Please select at least one role.");
                      return;
                    }
                    goToStep(5);
                  }}
                  className="bg-[#ffc700] hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 active:scale-95 shadow-md"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Tools & Integrations */}
          {step === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#ffc700]">
                  Question 5 of 8
                </span>
                <h2 className={`text-3xl sm:text-4xl font-black uppercase text-white ${oswald.className}`}>
                  Which tools should they connect with?
                </h2>
                <p className="text-sm text-neutral-400">
                  Select your current database, CRM, communication, and project management software.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {INTEGRATION_OPTIONS.map((item) => {
                  const isSelected = selectedIntegrations.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleIntegration(item)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        isSelected
                          ? "bg-[#ffc700] text-black shadow-md border border-yellow-300"
                          : "bg-black/40 backdrop-blur-sm text-neutral-300 border border-white/10 hover:border-white/25 hover:bg-black/60"
                      }`}
                    >
                      {isSelected && <Check size={14} />}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>

              {selectedIntegrations.includes("Other") && (
                <div className="space-y-1.5 pt-2 animate-fadeIn">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#ffc700]">
                    Specify other tools or APIs:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Asana, Linear, Supabase, proprietary internal ERP..."
                    value={customIntegrationText}
                    onChange={(e) => setCustomIntegrationText(e.target.value)}
                    autoFocus
                    className="w-full bg-black/50 backdrop-blur-md border border-[#ffc700]/50 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] focus:bg-black/70 transition"
                  />
                </div>
              )}

              <p className="text-xs text-neutral-500 italic">
                * We also build custom connectors for internal proprietary microservices and ERPs.
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => goToStep(4)}
                  className="text-xs font-bold text-neutral-400 hover:text-white transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(6)}
                  className="bg-[#ffc700] hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 active:scale-95 shadow-md"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Operational Bottlenecks & Goals */}
          {step === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#ffc700]">
                  Question 6 of 8
                </span>
                <h2 className={`text-3xl sm:text-4xl font-black uppercase text-white ${oswald.className}`}>
                  What bottlenecks should agents solve?
                </h2>
                <p className="text-sm text-neutral-400">
                  Describe what your team spends too much manual time on (e.g. ticket triaging, invoice reconciliation, SQL reporting).
                </p>
              </div>

              <div className="space-y-2">
                <textarea
                  rows={4}
                  placeholder="E.g., Our tier-1 support spends 4 hours a day looking up orders in Postgres and replying to shipping questions. We want agents to autonomously query the DB and reply via Slack/Zendesk."
                  value={bottlenecks}
                  onChange={(e) => setBottlenecks(e.target.value)}
                  autoFocus
                  className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] focus:bg-black/60 transition"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => goToStep(5)}
                  className="text-xs font-bold text-neutral-400 hover:text-white transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(7)}
                  className="bg-[#ffc700] hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 active:scale-95 shadow-md"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: Volume & Hosting Preference */}
          {step === 7 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#ffc700]">
                  Question 7 of 8
                </span>
                <h2 className={`text-3xl sm:text-4xl font-black uppercase text-white ${oswald.className}`}>
                  Workload & Infrastructure
                </h2>
                <p className="text-sm text-neutral-400">
                  Select your anticipated daily task volume and hosting deployment preference.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Estimated Daily Agent Activity
                  </label>
                  <select
                    value={dailyVolume}
                    onChange={(e) => setDailyVolume(e.target.value)}
                    className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ffc700] focus:bg-black/60"
                  >
                    <option value="< 500 actions/day" className="bg-[#141519]">&lt; 500 actions/day</option>
                    <option value="1,000 - 5,000 actions/day" className="bg-[#141519]">1,000 - 5,000 actions/day</option>
                    <option value="5,000 - 20,000 actions/day" className="bg-[#141519]">5,000 - 20,000 actions/day</option>
                    <option value="20,000+ actions/day" className="bg-[#141519]">20,000+ actions/day (High Throughput)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Hosting / Security Preference
                  </label>
                  <select
                    value={hostingPreference}
                    onChange={(e) => setHostingPreference(e.target.value)}
                    className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#ffc700] focus:bg-black/60"
                  >
                    <option value="Managed Dedicated Cloud" className="bg-[#141519]">Pixorva Managed Dedicated Cloud (Fastest Setup)</option>
                    <option value="Hybrid VPC Peering" className="bg-[#141519]">Hybrid VPC Peering (AWS / GCP)</option>
                    <option value="Air-Gapped On-Premise" className="bg-[#141519]">Air-Gapped On-Premise / Private Cluster</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => goToStep(6)}
                  className="text-xs font-bold text-neutral-400 hover:text-white transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(8)}
                  className="bg-[#ffc700] hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 active:scale-95 shadow-md"
                >
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: Contact Details & Timeline */}
          {step === 8 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#ffc700]">
                  Question 8 of 8
                </span>
                <h2 className={`text-3xl sm:text-4xl font-black uppercase text-white ${oswald.className}`}>
                  Where should we send your blueprint?
                </h2>
                <p className="text-sm text-neutral-400">
                  Our engineering solutions team will review your specifications and deliver a custom architecture proposal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Alex Morgan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] focus:bg-black/60 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Corporate Work Email *
                  </label>
                  <input
                    type="email"
                    placeholder="alex@company.com"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] focus:bg-black/60 transition"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] focus:bg-black/60 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Target Deployment Timeline
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ffc700] focus:bg-black/60 transition"
                  >
                    <option value="Immediate (< 2 weeks)" className="bg-[#141519]">Immediate (&lt; 2 weeks)</option>
                    <option value="Within 1 Month" className="bg-[#141519]">Within 1 Month</option>
                    <option value="Next Quarter (2-3 Months)" className="bg-[#141519]">Next Quarter (2-3 Months)</option>
                    <option value="Exploring Feasibility" className="bg-[#141519]">Exploring Feasibility</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Additional Notes or Security Requirements (Optional)
                </label>
                <input
                  type="text"
                  placeholder="E.g. We require NDA before code review; need SOC2 reports; custom SSO (Okta/SAML)."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full bg-black/40 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] focus:bg-black/60 transition"
                />
              </div>

              {submitError && (
                <div className="text-xs text-red-400 bg-red-950/40 border border-red-800 p-3 rounded-xl">
                  {submitError}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => goToStep(7)}
                  disabled={isSubmitting}
                  className="text-xs font-bold text-neutral-400 hover:text-white transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-[#ffc700] hover:bg-yellow-400 text-black px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 active:scale-95 shadow-[0_0_20px_rgba(255,199,0,0.3)] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating Request...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 9: Success Confirmation / Request Raised */}
          {step === 9 && submittedRequest && (
            <div className="text-center py-6 space-y-6 animate-fadeIn">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#ffc700]/10 border-2 border-[#ffc700] flex items-center justify-center text-[#ffc700] shadow-[0_0_30px_rgba(255,199,0,0.25)]">
                <CheckCheck size={42} />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-[#ffc700] text-black px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  Request Raised Successfully 🚀
                </div>
                <h2 className={`text-3xl sm:text-4xl font-black uppercase text-white ${oswald.className}`}>
                  Your Custom Agent Request Is Created!
                </h2>
                <p className="text-sm text-neutral-300 max-w-lg mx-auto leading-relaxed">
                  Someone from our team will contact you soon with all the details you have filled, along with a tailored architecture proposal.
                </p>
              </div>

              {/* Reference ID */}
              <div className="bg-black/40 backdrop-blur-md border border-white/15 rounded-2xl p-4 max-w-md mx-auto flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Request Reference ID</span>
                  <div className="text-base font-black text-[#ffc700] tracking-wider">{submittedRequest.refId}</div>
                </div>
                <button
                  onClick={copyRefId}
                  className="bg-[#1f2028] hover:bg-neutral-800 text-neutral-200 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
                >
                  {copiedRef ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedRef ? "Copied" : "Copy ID"}</span>
                </button>
              </div>

              {/* Specification Recap */}
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-left max-w-lg mx-auto space-y-2.5 font-sans text-xs">
                <h5 className="font-bold uppercase tracking-wider text-neutral-400 border-b border-white/10 pb-2">
                  Submitted Specification Recap
                </h5>
                <div className="grid grid-cols-2 gap-y-2 text-neutral-300">
                  <div><span className="text-neutral-500 font-medium">Business:</span> {submittedRequest.companyName}</div>
                  <div><span className="text-neutral-500 font-medium">Industry:</span> {submittedRequest.industry}</div>
                  <div><span className="text-neutral-500 font-medium">Contact:</span> {submittedRequest.fullName}</div>
                  <div><span className="text-neutral-500 font-medium">Email:</span> {submittedRequest.workEmail}</div>
                  <div><span className="text-neutral-500 font-medium">Timeline:</span> {submittedRequest.timeline}</div>
                  <div><span className="text-neutral-500 font-medium">Roles:</span> {submittedRequest.roles?.length} roles selected</div>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <span className="text-neutral-500">Selected Roles: </span>
                  <span className="text-[#ffc700] font-semibold">{submittedRequest.roles?.join(", ")}</span>
                </div>
              </div>

              {/* Required Support Callout */}
              <div className="bg-[#18191f]/80 backdrop-blur-md border border-[#ffc700]/30 rounded-2xl p-5 max-w-lg mx-auto text-sm space-y-1">
                <div className="text-neutral-300">
                  A full copy has been dispatched to <strong className="text-white">{submittedRequest.workEmail}</strong>.
                </div>
                <div className="text-neutral-400 text-xs pt-1">
                  For more information or urgent priority onboarding, contact us at:
                </div>
                <div className="pt-1">
                  <a
                    href="mailto:support@pixorva.org"
                    className="inline-flex items-center gap-1.5 text-base font-black text-[#ffc700] hover:underline"
                  >
                    <Mail size={16} />
                    <span>support@pixorva.org</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/custom-agents"
                  className="bg-black/40 hover:bg-black/60 text-neutral-300 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition border border-white/10"
                >
                  Return to Documentation
                </Link>
                <Link
                  href="/workspace"
                  className="bg-[#ffc700] hover:bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-md"
                >
                  Open Workspace Console
                </Link>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
