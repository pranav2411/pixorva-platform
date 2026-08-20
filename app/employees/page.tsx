"use client";

import React, { useState } from "react";
import { Oswald, Inter } from "next/font/google";
import { ArrowLeft, Plus, Check, Briefcase, Code, Megaphone, PenTool, Search, ShieldCheck, DollarSign, User, Users, PieChart, Camera, Database, Lock, Clipboard, Video, Target, CheckCircle, Smartphone, X, Zap, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

// --- THE MEGA ROSTER (INDIAN PRICING & REASONABLE RATES) ---
export const EMPLOYEES = [
  // ENGINEERING
  {
    id: "dev-1", category: "Engineering", name: "Devon", role: "React Developer", icon: "Code", price: "₹999/mo",
    desc: "Builds UI components, fixes React hooks, and sets up Next.js projects.",
    skills: ["React", "Next.js", "Tailwind"],
    color: "bg-blue-100",
    steps: [{ type: "trigger", name: "Spec", icon: "MessageSquare" }, { type: "action", name: "Write Code", icon: "Code" }]
  },
  {
    id: "dev-2", category: "Engineering", name: "Ruby", role: "Backend Architect", icon: "Database", price: "₹1,299/mo",
    desc: "Designs SQL schemas, writes API endpoints, and optimizes queries.",
    skills: ["Postgres", "Node.js", "SQL"],
    color: "bg-blue-200",
    steps: [{ type: "trigger", name: "Schema Request", icon: "Database" }, { type: "action", name: "Generate SQL", icon: "Code" }]
  },
  {
    id: "dev-3", category: "Engineering", name: "Quinn", role: "QA Tester", icon: "CheckCircle", price: "₹799/mo",
    desc: "Writes unit tests and finds edge cases in your logic.",
    skills: ["Jest", "Cypress", "Debugging"],
    color: "bg-blue-50",
    steps: [{ type: "trigger", name: "Code Snippet", icon: "Code" }, { type: "action", name: "Write Tests", icon: "Check" }]
  },
  {
    id: "dev-4", category: "Engineering", name: "Cy", role: "Security Analyst", icon: "Lock", price: "₹1,499/mo",
    desc: "Audits code for vulnerabilities and writes security policies.",
    skills: ["Security", "Auditing", "Compliance"],
    color: "bg-blue-100",
    steps: [{ type: "trigger", name: "Codebase", icon: "Lock" }, { type: "action", name: "Audit Report", icon: "ShieldCheck" }]
  },

  // MARKETING
  {
    id: "mkt-1", category: "Marketing", name: "Marcus", role: "Growth Hacker", icon: "Megaphone", price: "₹899/mo",
    desc: "Writes viral threads, LinkedIn hooks, and ad copy.",
    skills: ["Viral Hooks", "Copywriting", "Twitter"],
    color: "bg-green-100",
    steps: [{ type: "trigger", name: "Topic", icon: "Zap" }, { type: "action", name: "Write Thread", icon: "Twitter" }]
  },
  {
    id: "mkt-2", category: "Marketing", name: "Stella", role: "Social Media Mgr", icon: "Camera", price: "₹699/mo",
    desc: "Creates Instagram captions and TikTok scripts.",
    skills: ["Instagram", "TikTok", "Visuals"],
    color: "bg-green-200",
    steps: [{ type: "trigger", name: "Image/Idea", icon: "Camera" }, { type: "action", name: "Write Caption", icon: "PenTool" }]
  },
  {
    id: "mkt-3", category: "Marketing", name: "Gordon", role: "SEO Blog Writer", icon: "PenTool", price: "₹799/mo",
    desc: "Writes ranking articles with perfect SEO structure.",
    skills: ["SEO", "Blogging", "Keywords"],
    color: "bg-green-50",
    steps: [{ type: "trigger", name: "Keyword", icon: "Search" }, { type: "action", name: "Write Article", icon: "PenTool" }]
  },
  {
    id: "mkt-4", category: "Marketing", name: "Vic", role: "Video Scripter", icon: "Video", price: "₹899/mo",
    desc: "Turns blog posts into engaging YouTube scripts.",
    skills: ["YouTube", "Scripting", "Storytelling"],
    color: "bg-green-100",
    steps: [{ type: "trigger", name: "Topic", icon: "Video" }, { type: "action", name: "Write Script", icon: "PenTool" }]
  },

  // SALES
  {
    id: "sales-1", category: "Sales", name: "Sarah", role: "SDR / Outreach", icon: "DollarSign", price: "₹999/mo",
    desc: "Finds leads and writes personalized cold emails.",
    skills: ["Cold Email", "Lead Gen", "Sales"],
    color: "bg-red-100",
    steps: [{ type: "trigger", name: "Company", icon: "Search" }, { type: "action", name: "Draft Email", icon: "Mail" }]
  },
  {
    id: "sales-2", category: "Sales", name: "Larry", role: "Lead Enricher", icon: "Target", price: "₹899/mo",
    desc: "Finds emails, LinkedIn profiles, and company data.",
    skills: ["Data Mining", "Enrichment", "Research"],
    color: "bg-red-200",
    steps: [{ type: "trigger", name: "Name", icon: "Search" }, { type: "action", name: "Find Info", icon: "Database" }]
  },

  // OPERATIONS & HR
  {
    id: "ops-1", category: "HR", name: "Holly", role: "HR Manager", icon: "Users", price: "₹1,199/mo",
    desc: "Drafts job descriptions, screens resumes, and writes policies.",
    skills: ["Hiring", "Policy", "Culture"],
    color: "bg-yellow-100",
    steps: [{ type: "trigger", name: "Requirement", icon: "Users" }, { type: "action", name: "Draft Doc", icon: "Clipboard" }]
  },
  {
    id: "ops-2", category: "Finance", name: "Finn", role: "Finance Analyst", icon: "PieChart", price: "₹1,499/mo",
    desc: "Analyzes P&L statements and drafts tax summaries.",
    skills: ["Excel", "Finance", "Accounting"],
    color: "bg-yellow-200",
    steps: [{ type: "trigger", name: "Data", icon: "PieChart" }, { type: "action", name: "Analyze", icon: "Check" }]
  },
  {
    id: "ops-3", category: "Legal", name: "Lawson", role: "Legal Assistant", icon: "ShieldCheck", price: "₹1,999/mo",
    desc: "Drafts NDAs, contracts, and reviews terms.",
    skills: ["Contracts", "Law", "Compliance"],
    color: "bg-yellow-100",
    steps: [{ type: "trigger", name: "Request", icon: "ShieldCheck" }, { type: "action", name: "Draft Contract", icon: "PenTool" }]
  },
  {
    id: "ops-4", category: "Ops", name: "Pat", role: "Product Manager", icon: "Clipboard", price: "₹1,099/mo",
    desc: "Writes user stories, specs, and roadmap items.",
    skills: ["Agile", "Specs", "Roadmap"],
    color: "bg-yellow-50",
    steps: [{ type: "trigger", name: "Feature Idea", icon: "Zap" }, { type: "action", name: "Write Spec", icon: "Clipboard" }]
  },
  
  // SUPPORT
  {
    id: "sup-1", category: "Support", name: "Sam", role: "Customer Support", icon: "Smartphone", price: "₹499/mo",
    desc: "Drafts empathetic replies to angry customer emails.",
    skills: ["Support", "Empathy", "Conflict"],
    color: "bg-orange-100",
    steps: [{ type: "trigger", name: "Complaint", icon: "Mail" }, { type: "action", name: "Draft Reply", icon: "MessageSquare" }]
  },
];

interface Employee {
  id: string;
  category: string;
  name: string;
  role: string;
  icon: string;
  price: string;
  desc: string;
  skills: string[];
  color: string;
  steps: { type: string; name: string; icon: string }[];
}

export default function EmployeesPage() {
  const [hiring, setHiring] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const router = useRouter();

  // Custom Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    employee: Employee | null;
    type: 'trial' | 'paid_upgrade';
  }>({ isOpen: false, employee: null, type: 'trial' });
  const [modalLoading, setModalLoading] = useState(false);

  const handleConfirmTrial = async () => {
    const employee = confirmModal.employee;
    if (!employee) return;
    setModalLoading(true);
    const supabase = createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }
        
        // Provision the agent directly in Supabase
        const { data: newAgent, error: agentError } = await supabase
            .from('agents')
            .insert({
                user_id: user.id,
                name: `${employee.name} (${employee.role})`,
                steps: employee.steps,
                schedule: 'Manual',
                icon: employee.icon
            })
            .select('id')
            .single();

        if (agentError) throw agentError;

        // Save this agent ID as the chosen trial agent
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                trial_agent_id: newAgent.id
            });

        if (profileError) throw profileError;

        alert(`🎉 Success! ${employee.name} has joined your team for your 3-day free trial.`);
        setConfirmModal({ isOpen: false, employee: null, type: 'trial' });
        router.push("/");
    } catch (e: any) {
        alert("Activation failed: " + e.message);
    } finally {
        setModalLoading(false);
    }
  };

  const handleConfirmPaidUpgrade = async () => {
    const employee = confirmModal.employee;
    if (!employee) return;
    setModalLoading(true);
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        // Parse price (e.g. "₹999/mo" -> 99900 paise)
        const parsedAmount = parseInt(employee.price.replace(/[^\d]/g, ""), 10) * 100;

        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.id,
                agentName: `${employee.name} (${employee.role})`,
                icon: employee.icon,
                steps: employee.steps,
                amount: parsedAmount
            })
        });

        const data = await response.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error(data.error || "Failed to create checkout session");
        }
    } catch (e: any) {
        alert("Hiring failed: " + e.message);
    } finally {
        setModalLoading(false);
    }
  };

  const handleHire = async (employee: Employee) => {
    setHiring(employee.id);
    const supabase = createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Please log in to hire employees.");
            router.push("/login");
            setHiring(null);
            return;
        }

        // Check if user has active plan or is eligible for Free Trial
        const { data: profile } = await supabase
            .from('profiles')
            .select('trial_started_at, trial_ends_at, trial_agent_id, plan')
            .eq('id', user.id)
            .single();

        const plan = profile?.plan || 'free';

        // 1. Enterprise Plan: Unlimited agents for free
        if (plan === 'enterprise') {
            const { error: agentError } = await supabase
                .from('agents')
                .insert({
                    user_id: user.id,
                    name: `${employee.name} (${employee.role})`,
                    steps: employee.steps,
                    schedule: 'Manual',
                    icon: employee.icon
                });

            if (agentError) throw agentError;
            alert(`🎉 Success! ${employee.name} has joined your team under your Enterprise Plan.`);
            router.push("/");
            return;
        }

        // 2. Growth Pro Plan: Limit to 4 agents for free
        if (plan === 'growth_pro') {
            const { count, error: countError } = await supabase
                .from('agents')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_paid_individually', false);

            if (countError) throw countError;

            if (count !== null && count >= 4) {
                // Open custom modal instead of window.confirm
                setConfirmModal({ isOpen: true, employee, type: 'paid_upgrade' });
                setHiring(null);
                return;
            } else {
                // They have < 4 agents, provision for free:
                const { error: agentError } = await supabase
                    .from('agents')
                    .insert({
                        user_id: user.id,
                        name: `${employee.name} (${employee.role})`,
                        steps: employee.steps,
                        schedule: 'Manual',
                        icon: employee.icon
                    });

                if (agentError) throw agentError;
                alert(`🎉 Success! ${employee.name} has joined your team under your Growth Pro Plan.`);
                router.push("/");
                return;
            }
        }

        // 3. Free Tier (Check Trial Status)
        const isTrialActive = profile?.trial_ends_at && new Date() < new Date(profile.trial_ends_at);
        const hasChosenTrialAgent = profile?.trial_agent_id !== null;

        if (isTrialActive && !hasChosenTrialAgent) {
            // Open custom modal instead of window.confirm
            setConfirmModal({ isOpen: true, employee, type: 'trial' });
            setHiring(null);
            return;
        }

        // Redirect to Stripe checkout directly for standard paid purchase if no trial / plans active
        const parsedAmount = parseInt(employee.price.replace(/[^\d]/g, ""), 10) * 100;

        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.id,
                agentName: `${employee.name} (${employee.role})`,
                icon: employee.icon,
                steps: employee.steps,
                amount: parsedAmount
            })
        });

        const data = await response.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error(data.error || "Failed to create checkout session");
        }

    } catch (e: unknown) {
        alert("Hiring failed: " + (e as Error).message);
        setHiring(null);
    }
  };

  const filteredEmployees = filter === "All" 
    ? EMPLOYEES 
    : EMPLOYEES.filter(e => e.category === filter);

  return (
    <div className={`min-h-screen bg-white text-black ${inter.className}`}>
      
      {/* HEADER */}
      <div className="bg-white border-b-4 border-black sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <Link href="/" className="bg-black text-white p-2 rounded hover:bg-yellow-400 hover:text-black transition border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-y-1"><ArrowLeft size={20}/></Link>
                  <h1 className={`text-3xl md:text-4xl uppercase ${oswald.className} tracking-tighter`}>Marketplace</h1>
              </div>
              <div className="hidden md:block text-sm font-bold bg-yellow-100 border-2 border-black px-3 py-1 rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  {EMPLOYEES.length} PROS AVAILABLE
              </div>
          </div>
          
          {/* CATEGORY TABS */}
          <div className="max-w-7xl mx-auto px-6 flex gap-3 overflow-x-auto pb-6 pt-2 scrollbar-hide">
            {["All", "Engineering", "Marketing", "Sales", "HR", "Finance", "Legal", "Support"].map((cat) => (
                <button 
                    key={cat} 
                    onClick={() => setFilter(cat)}
                    className={`px-5 py-2 rounded border-2 border-black text-xs font-bold uppercase whitespace-nowrap transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none ${filter === cat ? 'bg-black text-white' : 'bg-white hover:bg-yellow-400'}`}
                >
                    {cat}
                </button>
            ))}
          </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            
            {filteredEmployees.map((emp) => (
                <div key={emp.id} className="group relative bg-white border-4 border-black rounded-xl p-6 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 flex flex-col justify-between h-full">
                    
                    {/* CARD CONTENT */}
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-14 h-14 ${emp.color} border-2 border-black rounded-lg flex items-center justify-center text-black`}>
                                {getIcon(emp.icon)}
                            </div>
                            <span className="bg-black text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border border-black">
                                {emp.category}
                            </span>
                        </div>

                        <h3 className={`text-2xl uppercase mb-1 leading-none ${oswald.className}`}>{emp.name}</h3>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">{emp.role}</p>
                        
                        <p className="text-sm font-medium text-gray-800 leading-relaxed mb-6 min-h-[60px] border-l-4 border-gray-200 pl-3">
                            {emp.desc}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {emp.skills.map((skill, i) => (
                                <span key={i} className="text-[10px] font-black border-2 border-black px-2 py-1 rounded bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* HIRE BUTTON */}
                    <button 
                        onClick={() => handleHire(emp)}
                        disabled={hiring === emp.id}
                        className="w-full bg-yellow-400 text-black border-4 border-black py-3 rounded-lg font-black text-sm uppercase tracking-wide hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
                    >
                        {hiring === emp.id ? "Onboarding..." : <>Hire For {emp.price} <Plus size={16} strokeWidth={4} /></>}
                    </button>
                </div>
            ))}
        </div>
      </main>

      {/* CUSTOM NEOBRUTALIST CONFIRMATION MODAL */}
      {confirmModal.isOpen && confirmModal.employee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black p-8 rounded-3xl max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200 text-center relative">
                <button 
                  disabled={modalLoading}
                  onClick={() => setConfirmModal({ isOpen: false, employee: null, type: 'trial' })} 
                  className="absolute right-4 top-4 text-gray-400 hover:text-black transition disabled:opacity-50"
                >
                    <X size={24} />
                </button>

                <div className="mb-6 flex justify-center">
                    <div className="bg-yellow-400 p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black">
                        <Zap size={36} fill="black" />
                    </div>
                </div>

                <h3 className={`text-3xl uppercase mb-3 ${oswald.className}`}>
                    {confirmModal.type === 'trial' ? 'Start Free Trial' : 'Confirm Purchase'}
                </h3>

                <p className="text-sm font-semibold text-gray-600 mb-8 leading-relaxed">
                    {confirmModal.type === 'trial' ? (
                        <>Would you like to use your one-time <strong>3-day Free Trial</strong> to hire <strong>{confirmModal.employee.name}</strong> for free?</>
                    ) : (
                        <>Would you like to purchase <strong>{confirmModal.employee.name}</strong> individually for <strong>{confirmModal.employee.price}</strong>?</>
                    )}
                </p>

                <div className="flex flex-col gap-3">
                    <button 
                      disabled={modalLoading}
                      onClick={confirmModal.type === 'trial' ? handleConfirmTrial : handleConfirmPaidUpgrade}
                      className="w-full bg-black text-white hover:bg-yellow-400 hover:text-black py-4 rounded-xl border-2 border-black font-black uppercase text-sm tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {modalLoading ? (
                            <Loader2 className="animate-spin" size={16} />
                        ) : (
                            confirmModal.type === 'trial' ? 'Activate Trial Agent' : 'Purchase Individually'
                        )}
                    </button>
                    <button 
                      disabled={modalLoading}
                      onClick={() => setConfirmModal({ isOpen: false, employee: null, type: 'trial' })}
                      className="w-full bg-white text-gray-500 hover:text-red-500 py-2 font-bold uppercase text-xs tracking-wider transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

// Icon Helper
function getIcon(name: string) {
    switch(name) {
        case "Code": return <Code size={28} strokeWidth={2.5} />;
        case "Megaphone": return <Megaphone size={28} strokeWidth={2.5} />;
        case "DollarSign": return <DollarSign size={28} strokeWidth={2.5} />;
        case "ShieldCheck": return <ShieldCheck size={28} strokeWidth={2.5} />;
        case "Users": return <Users size={28} strokeWidth={2.5} />;
        case "PieChart": return <PieChart size={28} strokeWidth={2.5} />;
        case "Camera": return <Camera size={28} strokeWidth={2.5} />;
        case "Database": return <Database size={28} strokeWidth={2.5} />;
        case "Lock": return <Lock size={28} strokeWidth={2.5} />;
        case "Clipboard": return <Clipboard size={28} strokeWidth={2.5} />;
        case "Video": return <Video size={28} strokeWidth={2.5} />;
        case "Target": return <Target size={28} strokeWidth={2.5} />;
        case "CheckCircle": return <CheckCircle size={28} strokeWidth={2.5} />;
        case "Smartphone": return <Smartphone size={28} strokeWidth={2.5} />;
        case "PenTool": return <PenTool size={28} strokeWidth={2.5} />;
        case "Search": return <Search size={28} strokeWidth={2.5} />;
        default: return <Briefcase size={28} strokeWidth={2.5} />;
    }
}