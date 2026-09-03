"use client";

import { useEffect, useState } from "react";
import { createClient } from "../utils/supabase/client";
import { useRouter } from "next/navigation";
import { Oswald, Inter } from "next/font/google";
import { 
  ArrowLeft, Save, User as UserIcon, Loader2, Zap, X, Trash2, 
  Shield, User, CreditCard, Key, Activity, Smartphone, Shuffle, 
  Check, Globe, ExternalLink, Code2, Copy, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { showToast } from "../utils/Toast";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

const SHOWCASE_AGENTS = [
  { name: "Sarah", role: "Executive Assistant", video: "/GIF/Sarah.mp4", poster: "/GIF/Sarah.png", desc: "Automates email triage, calendar scheduling & executive correspondence" },
  { name: "Marcus", role: "Social Media Manager", video: "/GIF/Marcus.mp4", poster: "/GIF/Marcus.png", desc: "Generates viral post ideas, creates assets & manages social engagement" },
  { name: "Gordon", role: "SEO Specialist", video: "/GIF/Gordon.mp4", poster: "/GIF/Gordon.png", desc: "Researches high-intent keywords & authors Google ranking articles" },
  { name: "Devon", role: "Full-Stack Engineer", video: "/GIF/Devon.mp4", poster: "/GIF/Devon.png", desc: "Builds web features, audits Pull Requests & debugs cloud systems" },
  { name: "Ruby", role: "Backend Architect", video: "/GIF/Ruby.mp4", poster: "/GIF/Ruby.png", desc: "Optimizes low-latency APIs, caches data & structures cloud microservices" },
  { name: "Vic", role: "Sales & Outbound", video: "/GIF/Vic.mp4", poster: "/GIF/Vic.png", desc: "Conducts cold outreach, qualifies B2B leads & books sales calls" },
  { name: "Finn", role: "Financial Analyst", video: "/GIF/Finn.mp4", poster: "/GIF/Finn.png", desc: "Automates financial forecasting, runway modeling & expense variance audits" },
  { name: "Holly", role: "HR & Talent Recruiter", video: "/GIF/Holly.mp4", poster: "/GIF/Holly.png", desc: "Screens candidate profiles, schedules interviews & manages team onboarding" },
  { name: "Larry", role: "Legal & Contracts", video: "/GIF/Larry.mp4", poster: "/GIF/Larry.png", desc: "Reviews master service agreements & ensures regulatory compliance" },
  { name: "Pat", role: "Customer Support Lead", video: "/GIF/Pat.mp4", poster: "/GIF/Pat.png", desc: "Resolves support tickets 24/7 with zero latency & high client satisfaction" },
  { name: "Sam", role: "Product Strategy", video: "/GIF/Sam.mp4", poster: "/GIF/Sam.png", desc: "Prioritizes user stories, synthesizes customer feedback & aligns roadmaps" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [plan, setPlan] = useState("free");
  
  const [subscriptionAgents, setSubscriptionAgents] = useState<any[]>([]);
  const [paidAgents, setPaidAgents] = useState<any[]>([]);
  
  // Background Agent Video Showcase state
  const [currentAgentIndex, setCurrentAgentIndex] = useState(0);

  // Modal toggles
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancelGovModal, setShowCancelGovModal] = useState(false);
  const [selectedAgentToCancel, setSelectedAgentToCancel] = useState<any | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Compliance States
  const [showErasureModal, setShowErasureModal] = useState(false);
  const [erasing, setErasing] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; token: string; created: string; usedToday: number; dailyLimit: number }[]>([]);
  const [newKeyName, setNewKeyName] = useState("");

  // Playground States
  const [selectedPlaygroundKey, setSelectedPlaygroundKey] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [availablePlaygroundAgents, setAvailablePlaygroundAgents] = useState<any[]>([]);
  const [playgroundPrompt, setPlaygroundPrompt] = useState("Explain why Pixorva is fast in one punchy sentence.");
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundResult, setPlaygroundResult] = useState("");

  // Invoices / Payments
  const [payments, setPayments] = useState<{ id: string; amount: number; planName: string; created: string; razorpayId: string }[]>([]);

  // Active Session
  const [activeSession, setActiveSession] = useState<{ device: string; location: string; ip: string; lastActive: string } | null>(null);

  // Pick random agent on mount
  useEffect(() => {
    setCurrentAgentIndex(Math.floor(Math.random() * SHOWCASE_AGENTS.length));
  }, []);

  const currentAgent = SHOWCASE_AGENTS[currentAgentIndex] || SHOWCASE_AGENTS[0];

  const handleNextAgent = () => {
    setCurrentAgentIndex((prev) => (prev + 1) % SHOWCASE_AGENTS.length);
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings/data");
        const data = await res.json();

        if (res.status === 401 || !data.success) {
          router.push("/login");
          return;
        }

        setEmail(data.email || "");
        setFullName(data.fullName || "");
        setUserId(data.userId || "");
        setPlan(data.plan || "free");
        setSubscriptionAgents(data.subscriptionAgents || []);
        setPaidAgents(data.paidAgents || []);
        setApiKeys(data.apiKeys || []);
        setPayments(data.payments || []);
        setActiveSession(data.activeSession || null);

        // Pre-select playground defaults
        if (data.apiKeys && data.apiKeys.length > 0) {
          setSelectedPlaygroundKey(data.apiKeys[0].token);
        }
        if (data.paidAgents && data.paidAgents.length > 0) {
          setAvailablePlaygroundAgents(data.paidAgents);
          setSelectedAgentId(data.paidAgents[0].id);
        }
      } catch (err) {
        console.error("Failed to load settings data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [router]);

  // 1. Update Profile Name
  const updateProfile = async () => {
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", userId);

    if (error) {
      showToast("Error updating profile", "error");
    } else {
      showToast("Profile updated successfully!", "success");
    }
    setSaving(false);
  };

  // 2. Cancel Bundled Subscription
  const handleCancelSubscription = async () => {
    setCancelling(true);
    const supabase = createClient();
    try {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ plan: "free" })
        .eq("id", userId);
      if (profileError) throw profileError;

      const { error: agentsError } = await supabase
        .from("agents")
        .delete()
        .eq("user_id", userId)
        .eq("is_paid_individually", false);
      if (agentsError) throw agentsError;

      setPlan("free");
      setSubscriptionAgents([]);
      setPaidAgents(prev => prev.filter(a => a.is_paid_individually));
      setShowCancelModal(false);
      showToast("Subscription cancelled successfully.", "success");
    } catch (err: any) {
      showToast("Cancellation failed: " + err.message, "error");
    } finally {
      setCancelling(false);
    }
  };

  // 3. Cancel Governance Tower
  const handleCancelGovernance = async () => {
    setCancelling(true);
    const supabase = createClient();
    try {
      const { error: govError } = await supabase
        .from("agents")
        .delete()
        .eq("user_id", userId)
        .eq("name", "Governance Control Tower");
      if (govError) throw govError;

      setPaidAgents(prev => prev.filter(a => a.name !== "Governance Control Tower"));
      setShowCancelGovModal(false);
      showToast("Governance subscription terminated.", "success");
    } catch (err: any) {
      showToast("Failed to cancel governance: " + err.message, "error");
    } finally {
      setCancelling(false);
    }
  };

  // 4. Cancel Individual Contract
  const handleCancelIndividual = async () => {
    if (!selectedAgentToCancel) return;
    setCancelling(true);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("agents")
        .delete()
        .eq("id", selectedAgentToCancel.id)
        .eq("user_id", userId);
      if (error) throw error;

      setPaidAgents(prev => prev.filter(a => a.id !== selectedAgentToCancel.id));
      setSelectedAgentToCancel(null);
      showToast(`Terminated contract for ${selectedAgentToCancel.name.split("(")[0]}.`, "success");
    } catch (err: any) {
      showToast("Failed to terminate contract: " + err.message, "error");
    } finally {
      setCancelling(false);
    }
  };

  // 5. Download Compliance Archive
  const handleDownloadArchive = async () => {
    try {
      const exportBundle = {
        meta: {
          exportDate: new Date().toISOString(),
          complianceStandards: ["India DPDPA 2023", "EU GDPR Article 20", "CCPA"],
          dataSubject: email,
          userId: userId
        },
        profile: {
          fullName,
          email,
          planTier: plan
        },
        workforce: {
          bundledHires: subscriptionAgents,
          standaloneHires: paidAgents
        },
        securityTokens: apiKeys.map(k => ({ name: k.name, created: k.created })),
        transactions: payments
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `pixorva_compliance_archive_${userId.slice(0, 8)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast("Compliance data archive compiled and downloaded.", "success");
    } catch (err: any) {
      showToast("Failed to compile archive: " + err.message, "error");
    }
  };

  // 6. Request Compliance Data Erasure via Server API
  const handleRequestErasure = async () => {
    setErasing(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to complete data erasure");
      }

      showToast("Your account and all workforce data have been completely erased.", "success");
      router.push("/onboarding");
    } catch (err: any) {
      showToast("Failed to complete data erasure: " + err.message, "error");
      setErasing(false);
    }
  };

  // API Key Generators
  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      showToast("Please enter a key description.", "error");
      return;
    }
    try {
      const res = await fetch("/api/settings/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName })
      });
      const data = await res.json();
      if (data.success && data.key) {
        setApiKeys(prev => [...prev, data.key]);
        setNewKeyName("");
        showToast(`API Key "${newKeyName}" generated successfully.`, "success");
      } else {
        showToast(data.error || "Failed to generate API Key.", "error");
      }
    } catch (e) {
      showToast("Failed to generate API Key.", "error");
    }
  };

  const handleRevokeApiKey = async (id: string, name: string) => {
    try {
      const res = await fetch("/api/settings/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setApiKeys(prev => prev.filter(k => k.id !== id));
        showToast(`API Key "${name}" revoked.`, "success");
      } else {
        showToast(data.error || "Failed to revoke API Key.", "error");
      }
    } catch (e) {
      showToast("Failed to revoke API Key.", "error");
    }
  };

  // Interactive Playground Execute
  const handlePlaygroundExecute = async () => {
    if (!selectedPlaygroundKey) {
      showToast("Please select or generate an API key first.", "error");
      return;
    }
    if (!selectedAgentId) {
      showToast("Please hire or provision at least one agent first.", "error");
      return;
    }

    setPlaygroundLoading(true);
    setPlaygroundResult("");

    try {
      const selectedAgent = availablePlaygroundAgents.find(a => a.id === selectedAgentId);
      const res = await fetch("/api/run-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${selectedPlaygroundKey}`
        },
        body: JSON.stringify({
          input: playgroundPrompt,
          agentId: selectedAgentId,
          agentRole: selectedAgent ? selectedAgent.name : "AI Agent"
        })
      });

      const data = await res.json();
      if (res.status === 200 && data.success) {
        setPlaygroundResult(data.result);
        showToast("API run executed successfully!", "success");
        
        const refreshRes = await fetch("/api/settings/data");
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          setApiKeys(refreshData.apiKeys || []);
        }
      } else {
        setPlaygroundResult(JSON.stringify(data, null, 2));
        showToast(data.result || "API run failed.", "error");
      }
    } catch (err: any) {
      setPlaygroundResult(`Execution Error: ${err.message}`);
      showToast("API execution failed.", "error");
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Revoke All active devices/sessions
  const handleRevokeAllSessions = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      showToast("All active login sessions have been revoked.", "success");
      router.push("/login");
    } catch (e: any) {
      showToast("Failed to revoke sessions: " + e.message, "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0e0f12] text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-[#ffc700]" size={36} />
        <span className={`text-xl font-bold tracking-wider uppercase ${oswald.className}`}>
          Loading Pixorva Settings...
        </span>
      </div>
    );
  }

  const hasGovernance = paidAgents.some(a => a.name === "Governance Control Tower");
  const hiredIndividuals = paidAgents.filter(a => a.name !== "Governance Control Tower");

  return (
    <div className={`min-h-screen bg-[#0e0f12] text-white relative overflow-x-hidden selection:bg-[#ffc700] selection:text-black ${inter.className}`}>
      
      {/* 1. CINEMATIC FULL-SCREEN AMBIENT BACKGROUND VIDEO LAYER */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <video
          key={currentAgent.video}
          src={currentAgent.video}
          poster={currentAgent.poster}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-20 filter blur-sm scale-105 transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0f12]/90 via-[#0e0f12]/85 to-[#0e0f12]/95" />
        {/* Glow Spheres */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#ffc700]/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-yellow-500/10 rounded-full filter blur-3xl pointer-events-none" />
      </div>

      {/* 2. TOP NAVBAR */}
      <nav className="bg-[#141519]/90 backdrop-blur-xl border-b border-neutral-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="bg-neutral-900 text-white p-2 rounded-xl hover:bg-[#ffc700] hover:text-black transition border border-neutral-700 flex items-center justify-center shrink-0 shadow-sm"
            aria-label="Back to Home"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-wider ${oswald.className} flex items-center gap-2`}>
              <span>SETTINGS</span>
              <span className="text-[#ffc700] text-sm font-sans font-semibold tracking-normal normal-case border border-neutral-700 bg-neutral-900/80 px-2.5 py-0.5 rounded-full hidden sm:inline-block">
                Workspace Console
              </span>
            </h1>
          </div>
        </div>

        {/* Live agent switcher header badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleNextAgent}
            className="hidden md:flex items-center gap-2 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Shuffle size={13} className="text-[#ffc700]" />
            <span>Agent: <strong className="text-white">{currentAgent.name}</strong></span>
          </button>

          <div className="bg-[#ffc700] text-black border border-yellow-300 px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm">
            {plan !== "free" ? plan.replace("_", " ") : "Free Tier"}
          </div>
        </div>
      </nav>

      {/* 3. WIDE RESPONSIVE DASHBOARD LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT RAIL / SIDEBAR (3 Columns - STATIC, NOT SCROLLABLE) */}
          <aside className="lg:col-span-3 space-y-6">
            
            {/* QUICK JUMP NAVIGATION (STATIC) */}
            <div className="bg-[#16171b]/95 backdrop-blur-xl border border-neutral-800 rounded-3xl p-5 shadow-xl">
              <h4 className="text-xs font-black uppercase tracking-wider text-neutral-400 mb-3 px-2">
                Quick Jump
              </h4>
              <nav className="flex flex-col gap-1.5 text-xs font-bold">
                <a href="#profile" className="px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition flex items-center gap-2.5">
                  <UserIcon size={14} className="text-[#ffc700]" />
                  <span>Profile & Details</span>
                </a>
                <a href="#api-console" className="px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition flex items-center gap-2.5">
                  <Key size={14} className="text-[#ffc700]" />
                  <span>Developer API Keys</span>
                </a>
                <a href="#playground" className="px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition flex items-center gap-2.5">
                  <Code2 size={14} className="text-[#ffc700]" />
                  <span>API Interactive Sandbox</span>
                </a>
                <a href="#billing" className="px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition flex items-center gap-2.5">
                  <CreditCard size={14} className="text-[#ffc700]" />
                  <span>Billing & Tax Receipts</span>
                </a>
                <a href="#security" className="px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition flex items-center gap-2.5">
                  <Smartphone size={14} className="text-[#ffc700]" />
                  <span>Session Security</span>
                </a>
                <a href="#compliance" className="px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition flex items-center gap-2.5">
                  <Shield size={14} className="text-[#ffc700]" />
                  <span>GDPR / DPDPA Compliance</span>
                </a>
                <a href="#subscriptions" className="px-3 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800 transition flex items-center gap-2.5">
                  <Zap size={14} className="text-[#ffc700]" />
                  <span>Plans & Subscriptions</span>
                </a>
              </nav>
            </div>

            {/* ACTIVE TEAM SUMMARY BADGE */}
            <div className="bg-[#16171b]/95 backdrop-blur-xl border border-neutral-800 rounded-3xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-neutral-400">My Active Team</span>
                <span className="text-xs font-bold uppercase bg-green-950 text-green-400 border border-green-800 px-2.5 py-0.5 rounded-full">
                  {paidAgents.length} Running
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                All {paidAgents.length} provisioned AI staff members are active in your workspace.
              </p>
            </div>

          </aside>

          {/* RIGHT RAIL / MAIN CONTENT (9 Columns) */}
          <div className="lg:col-span-9 space-y-8">

            {/* SECTION 1: PROFILE DETAILS */}
            <section id="profile" className="bg-[#16171b]/95 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="bg-[#ffc700] text-black p-2.5 rounded-xl shadow-sm">
                  <UserIcon size={22} />
                </div>
                <span>Profile Details</span>
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-2">
                    Email Address
                  </label>
                  <input 
                    type="text" 
                    value={email} 
                    disabled 
                    className="w-full px-4 py-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 font-mono text-sm cursor-not-allowed" 
                  />
                  <p className="text-xs text-neutral-500 mt-2">Email address is verified and permanently linked to your workspace.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-neutral-400 mb-2">
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex. John Doe"
                    className="w-full px-4 py-3.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#ffc700] transition text-sm font-medium" 
                  />
                </div>

                <button 
                  onClick={updateProfile}
                  disabled={saving}
                  className="bg-[#ffc700] hover:bg-yellow-400 text-black px-8 py-3.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </section>

            {/* SECTION 2: DEVELOPER API CONSOLE */}
            <section id="api-console" className="bg-[#16171b]/95 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl scroll-mt-24">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
                <div className="bg-[#ffc700] text-black p-2.5 rounded-xl shadow-sm">
                  <Key size={22} />
                </div>
                <span>Developer API Console</span>
              </h2>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                Generate custom developer API keys to integrate Pixorva agents into external Slack channels, GitHub webhooks, or programmatic workflows.
              </p>

              {/* Create Key Form */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Key name (e.g. Slack bot, CI pipeline)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-grow px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#ffc700] transition"
                />
                <button
                  onClick={handleCreateApiKey}
                  className="bg-[#ffc700] hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-black uppercase text-xs tracking-wide transition shrink-0 shadow-md"
                >
                  Generate Key
                </button>
              </div>

              {/* Keys List */}
              {apiKeys.length === 0 ? (
                <div className="border border-dashed border-neutral-800 p-6 rounded-2xl text-center text-xs text-neutral-500 font-bold bg-neutral-900/50">
                  No API keys generated yet. Enter a description above to create one.
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map(k => (
                    <div key={k.id} className="flex flex-col border border-neutral-800 p-5 rounded-2xl bg-neutral-900/80 gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-sm uppercase text-white mb-1">{k.name}</p>
                          <span className="text-[11px] text-neutral-500 font-medium block">Created on {k.created}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(k.token);
                              showToast("API Key copied to clipboard!", "success");
                            }}
                            className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase text-white transition flex items-center gap-1"
                          >
                            <Copy size={12} />
                            <span>Copy</span>
                          </button>
                          <button
                            onClick={() => handleRevokeApiKey(k.id, k.name)}
                            className="bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition"
                          >
                            Revoke
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-neutral-800 pt-3">
                        <code className="text-xs bg-black/60 border border-neutral-800 px-3 py-1.5 rounded font-mono block text-neutral-300 w-fit select-all mb-3">
                          {k.token}
                        </code>
                        
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase text-neutral-400 mb-1.5">
                          <span>Live Daily Quota Usage</span>
                          <span className="text-white font-mono">{k.usedToday.toLocaleString()} / {k.dailyLimit.toLocaleString()} tokens</span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-[#ffc700] h-full rounded-full transition-all duration-300" 
                            style={{ width: `${Math.min((k.usedToday / k.dailyLimit) * 100, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SECTION 3: INTERACTIVE API PLAYGROUND */}
            {apiKeys.length > 0 && (
              <section id="playground" className="bg-[#16171b]/95 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl scroll-mt-24">
                <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
                  <div className="bg-[#ffc700] text-black p-2.5 rounded-xl shadow-sm">
                    <Code2 size={22} />
                  </div>
                  <span>Interactive API Sandbox</span>
                </h2>
                <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                  Test your live integration keys directly inside this playground sandbox. Execution logs and quota increment in real time.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Controls */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">Select Authorization Key</label>
                      <select
                        value={selectedPlaygroundKey}
                        onChange={(e) => setSelectedPlaygroundKey(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-[#ffc700]"
                      >
                        {apiKeys.map(k => (
                          <option key={k.id} value={k.token}>{k.name} ({k.token.slice(0, 12)}...)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">Target AI Agent</label>
                      {availablePlaygroundAgents.length === 0 ? (
                        <div className="border border-dashed border-neutral-800 p-3 rounded-xl text-center text-xs font-bold text-neutral-500 bg-neutral-900">
                          No hired agents found.
                        </div>
                      ) : (
                        <select
                          value={selectedAgentId}
                          onChange={(e) => setSelectedAgentId(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-[#ffc700]"
                        >
                          {availablePlaygroundAgents.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">Prompt Message</label>
                      <textarea
                        rows={3}
                        value={playgroundPrompt}
                        onChange={(e) => setPlaygroundPrompt(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-3 text-xs font-medium text-white focus:outline-none focus:border-[#ffc700] resize-none"
                      />
                    </div>

                    <button
                      onClick={handlePlaygroundExecute}
                      disabled={playgroundLoading}
                      className="w-full bg-[#ffc700] hover:bg-yellow-400 text-black py-3 px-4 rounded-xl font-black uppercase text-xs tracking-wider transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {playgroundLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                      <span>{playgroundLoading ? "Executing Run..." : "Execute API Run"}</span>
                    </button>
                  </div>

                  {/* Right Viewports */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">Equivalent Curl Request</label>
                      <div className="bg-black/90 border border-neutral-800 text-green-400 p-4 rounded-xl font-mono text-[10px] overflow-x-auto select-all max-h-[140px]">
                        <pre>
{`curl -X POST "${typeof window !== 'undefined' ? window.location.origin : 'https://pixorva.com'}/api/run-agent" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer ${selectedPlaygroundKey || 'px_live_...'}" \\
-d '${JSON.stringify({
  input: playgroundPrompt,
  agentId: selectedAgentId || 'your-agent-uuid',
  agentRole: availablePlaygroundAgents.find(a => a.id === selectedAgentId)?.name || 'AI-Agent'
}, null, 2)}'`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase text-neutral-400 mb-1.5">Execution Result</label>
                      <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl font-mono text-xs min-h-[120px] max-h-[150px] overflow-y-auto text-neutral-200">
                        {playgroundLoading ? (
                          <span className="text-neutral-500 font-bold flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin text-[#ffc700]" /> Streaming model response...
                          </span>
                        ) : playgroundResult ? (
                          <pre className="whitespace-pre-wrap">{playgroundResult}</pre>
                        ) : (
                          <span className="text-neutral-500 italic">Execute run above to view response outputs.</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 4: BILLING & RECEIPTS */}
            <section id="billing" className="bg-[#16171b]/95 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl scroll-mt-24">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
                <div className="bg-[#ffc700] text-black p-2.5 rounded-xl shadow-sm">
                  <CreditCard size={22} />
                </div>
                <span>Receipt Billing History</span>
              </h2>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                View recent payment receipts and corresponding tax invoices compiled for your account subscriptions.
              </p>

              <div className="space-y-4">
                {payments.length === 0 ? (
                  <div className="border border-dashed border-neutral-800 p-6 rounded-2xl text-center text-xs text-neutral-500 font-bold bg-neutral-900/50">
                    No payments recorded yet. Invoices will automatically appear here once subscriptions are created.
                  </div>
                ) : (
                  payments.map(p => (
                    <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between border border-neutral-800 p-4 rounded-2xl bg-neutral-900/80 gap-4">
                      <div>
                        <p className="font-bold text-sm uppercase text-white mb-1">{p.planName}</p>
                        <span className="text-xs text-neutral-500 font-mono block">Paid on {p.created} • Razorpay {p.razorpayId}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-xs uppercase text-green-400 bg-green-950/60 px-3 py-1 rounded-lg border border-green-800/80">
                          ₹{p.amount.toLocaleString()} Paid
                        </span>
                        <Link 
                          href={`/sample_receipt.html?amount=${p.amount}&plan=${encodeURIComponent(p.planName)}&razorpayId=${p.razorpayId}`} 
                          target="_blank" 
                          className="bg-neutral-800 hover:bg-[#ffc700] hover:text-black border border-neutral-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase text-white transition shadow-sm"
                        >
                          View Invoice
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* SECTION 5: ACTIVE SESSION SECURITY */}
            <section id="security" className="bg-[#16171b]/95 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl scroll-mt-24">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
                <div className="bg-[#ffc700] text-black p-2.5 rounded-xl shadow-sm">
                  <Smartphone size={22} />
                </div>
                <span>Active Session Security</span>
              </h2>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                Monitor authentication devices signed into your Pixorva account. Revoke older sessions if you suspect security friction.
              </p>

              <div className="space-y-3 mb-6">
                {activeSession ? (
                  <div className="flex justify-between items-center border border-neutral-800 p-4 rounded-2xl bg-neutral-900/80">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{activeSession.device}</span>
                        <span className="bg-green-950/80 border border-green-700 text-green-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                          Current Session
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500 font-mono mt-1 block">
                        {activeSession.location} • IP: {activeSession.ip}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-neutral-800 p-4 rounded-2xl text-center text-xs text-neutral-500 font-bold bg-neutral-900/50">
                    Loading session logs...
                  </div>
                )}
              </div>

              <button
                onClick={handleRevokeAllSessions}
                className="w-full bg-red-950/60 hover:bg-red-900 text-red-300 py-3.5 px-6 border border-red-800 rounded-xl font-black uppercase text-xs tracking-wider transition shadow-md flex items-center justify-center gap-2"
              >
                Revoke All Other Sessions
              </button>
            </section>

            {/* SECTION 6: COMPLIANCE & DATA ERASURE */}
            <section id="compliance" className="bg-[#16171b]/95 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl scroll-mt-24">
              <h2 className="text-2xl font-bold mb-3 flex items-center gap-3">
                <div className="bg-[#ffc700] text-black p-2.5 rounded-xl shadow-sm">
                  <Shield size={22} />
                </div>
                <span>Compliance & Data Sovereignty</span>
              </h2>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                In accordance with India DPDPA, EU GDPR, and CCPA standards, you hold full sovereignty over your stored data. Access data portability archives or request total erasure here.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleDownloadArchive}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white py-3.5 px-6 rounded-xl border border-neutral-700 font-black uppercase text-xs tracking-wider transition flex items-center justify-center gap-2"
                >
                  Download Data Archive
                </button>
                <button
                  onClick={() => setShowErasureModal(true)}
                  className="bg-red-950/60 hover:bg-red-900 text-red-300 py-3.5 px-6 rounded-xl border border-red-800 font-black uppercase text-xs tracking-wider transition flex items-center justify-center gap-2"
                >
                  Request Data Erasure
                </button>
              </div>
            </section>

            {/* SECTION 7: SUBSCRIPTION & PLAN STATUS */}
            <section id="subscriptions" className="bg-[#16171b]/95 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl scroll-mt-24">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="bg-[#ffc700] text-black p-2.5 rounded-xl shadow-sm">
                  <Zap size={22} />
                </div>
                <span>Plan & Subscription Status</span>
              </h2>

              <div className="space-y-6">
                
                {/* 1. Bundled Plans */}
                <div className="border border-neutral-800 p-6 rounded-2xl bg-neutral-900/80 shadow-md">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-800">
                    <h3 className="font-bold text-sm uppercase text-white flex items-center gap-2">
                      <CreditCard size={18} className="text-[#ffc700]" />
                      Growth Pro / Enterprise Bundle
                    </h3>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${plan !== "free" ? "bg-green-950 text-green-400 border-green-800" : "bg-neutral-800 text-neutral-400 border-neutral-700"}`}>
                      {plan !== "free" ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {plan === "growth_pro" && (
                    <div className="space-y-4">
                      <p className={`text-xl font-black uppercase text-white ${oswald.className}`}>Growth Pro Plan (₹1,999/mo)</p>
                      <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold uppercase text-neutral-400">Plan Slot Utilisation</span>
                          <span className="text-xs font-bold uppercase text-white">{subscriptionAgents.length} / 4 slots</span>
                        </div>
                        <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-[#ffc700] h-full rounded-full" style={{ width: `${(subscriptionAgents.length / 4) * 100}%` }} />
                        </div>
                      </div>
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="w-full bg-red-950/60 hover:bg-red-900 text-red-300 py-2.5 rounded-xl border border-red-800 font-bold uppercase text-xs tracking-wider transition"
                      >
                        Cancel Growth Pro Subscription
                      </button>
                    </div>
                  )}

                  {plan === "enterprise" && (
                    <div className="space-y-4">
                      <p className={`text-xl font-black uppercase text-white ${oswald.className}`}>Enterprise Plan (₹4,999/mo)</p>
                      <p className="text-xs text-neutral-400">Allows unlimited hires and custom integrations across all channels.</p>
                      <button
                        onClick={() => setShowCancelModal(true)}
                        className="w-full bg-red-950/60 hover:bg-red-900 text-red-300 py-2.5 rounded-xl border border-red-800 font-bold uppercase text-xs tracking-wider transition"
                      >
                        Cancel Enterprise Subscription
                      </button>
                    </div>
                  )}

                  {plan === "free" && (
                    <div className="space-y-3">
                      <p className="text-xs text-neutral-500 italic">No bundled platform plan active.</p>
                      <Link href="/pricing" className="text-xs font-bold uppercase text-[#ffc700] hover:underline block">
                        Browse Platform Plans →
                      </Link>
                    </div>
                  )}
                </div>

                {/* 2. Governance Control Tower Plan */}
                <div className="border border-neutral-800 p-6 rounded-2xl bg-neutral-900/80 shadow-md">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-800">
                    <h3 className="font-bold text-sm uppercase text-white flex items-center gap-2">
                      <Shield size={18} className="text-[#ffc700]" />
                      Governance Gate
                    </h3>
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${hasGovernance ? "bg-green-950 text-green-400 border-green-800" : "bg-neutral-800 text-neutral-400 border-neutral-700"}`}>
                      {hasGovernance ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {hasGovernance ? (
                    <div className="space-y-4">
                      <p className={`text-xl font-black uppercase text-white ${oswald.className}`}>Governance Control Tower (₹1,999/mo)</p>
                      <p className="text-xs text-neutral-400 leading-normal">Grants proxy gating, auditing vaults, and admission policy checks.</p>
                      <button
                        onClick={() => setShowCancelGovModal(true)}
                        className="w-full bg-red-950/60 hover:bg-red-900 text-red-300 py-2.5 rounded-xl border border-red-800 font-bold uppercase text-xs tracking-wider transition"
                      >
                        Cancel Governance Subscription
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-neutral-500 italic">Governance Gate is locked.</p>
                      <Link href="/governance/info" className="text-xs font-bold uppercase text-[#ffc700] hover:underline block">
                        Subscribe to Governance Gate →
                      </Link>
                    </div>
                  )}
                </div>

                {/* 3. Individual AI Employee Subscriptions */}
                <div className="border border-neutral-800 p-6 rounded-2xl bg-neutral-900/80 shadow-md">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-800">
                    <h3 className="font-bold text-sm uppercase text-white flex items-center gap-2">
                      <User size={18} className="text-[#ffc700]" />
                      Individual AI Employee Subscriptions
                    </h3>
                    <span className="text-xs font-bold uppercase text-white bg-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-700">
                      {hiredIndividuals.length} Hired
                    </span>
                  </div>

                  {hiredIndividuals.length === 0 ? (
                    <p className="text-xs text-neutral-500 italic">No individually hired employee subscriptions active.</p>
                  ) : (
                    <div className="space-y-4">
                      {hiredIndividuals.map((agent) => {
                        let price = "₹999/mo";
                        const lowerName = agent.name.toLowerCase();
                        if (lowerName.includes("ruby")) price = "₹1,299/mo";
                        else if (lowerName.includes("quinn")) price = "₹799/mo";
                        else if (lowerName.includes("cy")) price = "₹1,499/mo";
                        else if (lowerName.includes("marcus")) price = "₹899/mo";
                        else if (lowerName.includes("stella")) price = "₹699/mo";
                        else if (lowerName.includes("gordon")) price = "₹799/mo";
                        else if (lowerName.includes("vic")) price = "₹899/mo";
                        else if (lowerName.includes("sarah")) price = "₹999/mo";
                        else if (lowerName.includes("larry")) price = "₹899/mo";
                        else if (lowerName.includes("holly")) price = "₹1,199/mo";
                        else if (lowerName.includes("finn")) price = "₹1,499/mo";
                        else if (lowerName.includes("lawson")) price = "₹1,999/mo";
                        else if (lowerName.includes("pat")) price = "₹1,099/mo";
                        else if (lowerName.includes("sam")) price = "₹499/mo";

                        return (
                          <div key={agent.id} className="flex justify-between items-center border border-neutral-800 p-4 rounded-xl bg-neutral-900">
                            <div>
                              <p className="font-bold text-sm uppercase text-white">{agent.name.split("(")[0]}</p>
                              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wide mt-1 block">
                                Hired Subscription • {price}
                              </span>
                            </div>
                            <button 
                              onClick={() => setSelectedAgentToCancel(agent)}
                              className="bg-red-950/60 hover:bg-red-900 text-red-300 px-3.5 py-1.5 rounded-lg border border-red-800 text-[10px] font-bold uppercase transition"
                            >
                              Cancel Contract
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </section>

          </div>

        </div>
      </main>

      {/* MODAL 1: CANCEL BUNDLED PLAN */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#18191e] border border-neutral-700 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center relative">
            <button disabled={cancelling} onClick={() => setShowCancelModal(false)} className="absolute right-4 top-4 text-neutral-400 hover:text-white transition">
              <X size={20} />
            </button>
            <div className="mb-6 flex justify-center">
              <div className="bg-red-950/60 p-4 rounded-2xl border border-red-800 text-red-400">
                <Trash2 size={32} />
              </div>
            </div>
            <h3 className={`text-2xl uppercase mb-3 text-white ${oswald.className}`}>Cancel Bundle Plan?</h3>
            <p className="text-xs text-neutral-300 mb-8 leading-relaxed">
              Are you sure you want to cancel your platform bundle subscription? You will immediately lose slot access and all included employee slots will be terminated.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                disabled={cancelling}
                onClick={handleCancelSubscription}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition shadow-md flex items-center justify-center gap-2"
              >
                {cancelling ? <Loader2 className="animate-spin" size={16} /> : "Yes, Cancel Plan"}
              </button>
              <button disabled={cancelling} onClick={() => setShowCancelModal(false)} className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition">
                Keep My Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CANCEL GOVERNANCE */}
      {showCancelGovModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#18191e] border border-neutral-700 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center relative">
            <button disabled={cancelling} onClick={() => setShowCancelGovModal(false)} className="absolute right-4 top-4 text-neutral-400 hover:text-white transition">
              <X size={20} />
            </button>
            <div className="mb-6 flex justify-center">
              <div className="bg-red-950/60 p-4 rounded-2xl border border-red-800 text-red-400">
                <Shield size={32} />
              </div>
            </div>
            <h3 className={`text-2xl uppercase mb-3 text-white ${oswald.className}`}>Cancel Governance?</h3>
            <p className="text-xs text-neutral-300 mb-8 leading-relaxed">
              Are you sure you want to cancel your Governance Control Tower subscription? You will lose Proxy gating and audit logs access immediately.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                disabled={cancelling}
                onClick={handleCancelGovernance}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition shadow-md flex items-center justify-center gap-2"
              >
                {cancelling ? <Loader2 className="animate-spin" size={16} /> : "Yes, Cancel Governance"}
              </button>
              <button disabled={cancelling} onClick={() => setShowCancelGovModal(false)} className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition">
                Keep My Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CANCEL INDIVIDUAL AGENT */}
      {selectedAgentToCancel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#18191e] border border-neutral-700 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center relative">
            <button disabled={cancelling} onClick={() => setSelectedAgentToCancel(null)} className="absolute right-4 top-4 text-neutral-400 hover:text-white transition">
              <X size={20} />
            </button>
            <div className="mb-6 flex justify-center">
              <div className="bg-red-950/60 p-4 rounded-2xl border border-red-800 text-red-400">
                <User size={32} />
              </div>
            </div>
            <h3 className={`text-2xl uppercase mb-3 text-white ${oswald.className}`}>Cancel Contract?</h3>
            <p className="text-xs text-neutral-300 mb-8 leading-relaxed">
              Are you sure you want to terminate the hiring subscription for <strong>{selectedAgentToCancel.name.split("(")[0]}</strong>? This employee will be removed from your office immediately.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                disabled={cancelling}
                onClick={handleCancelIndividual}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition shadow-md flex items-center justify-center gap-2"
              >
                {cancelling ? <Loader2 className="animate-spin" size={16} /> : "Yes, Terminate Contract"}
              </button>
              <button disabled={cancelling} onClick={() => setSelectedAgentToCancel(null)} className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition">
                Keep Employee
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: COMPLIANCE DATA ERASURE */}
      {showErasureModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#18191e] border border-neutral-700 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center relative">
            <button disabled={erasing} onClick={() => setShowErasureModal(false)} className="absolute right-4 top-4 text-neutral-400 hover:text-white transition">
              <X size={20} />
            </button>
            <div className="mb-6 flex justify-center">
              <div className="bg-red-950/60 p-4 rounded-2xl border border-red-800 text-red-400">
                <AlertTriangle size={32} />
              </div>
            </div>
            <h3 className={`text-2xl uppercase mb-3 text-white ${oswald.className}`}>Erase Personal Data?</h3>
            <p className="text-xs text-neutral-300 mb-8 leading-relaxed">
              Warning: Under GDPR and DPDPA, this triggers total erasure of your profile and deletes all hired employees and credentials permanently from database storage. This action is irreversible.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                disabled={erasing}
                onClick={handleRequestErasure}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition shadow-md flex items-center justify-center gap-2"
              >
                {erasing ? <Loader2 className="animate-spin" size={16} /> : "Yes, Delete My Account"}
              </button>
              <button disabled={erasing} onClick={() => setShowErasureModal(false)} className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-300 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}