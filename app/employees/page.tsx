"use client";

import React, { useState } from "react";
import { Oswald, Inter } from "next/font/google";
import { ArrowLeft, Plus, Check, Briefcase, Code, Megaphone, PenTool, Search, ShieldCheck, DollarSign, User, Users, PieChart, Camera, Database, Lock, Clipboard, Video, Target, CheckCircle, Smartphone } from "lucide-react";
import Link from "next/link";
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

// --- THE MEGA ROSTER (20 AGENTS) ---
const EMPLOYEES = [
  // ENGINEERING
  {
    id: "dev-1", category: "Engineering", name: "Devon", role: "React Developer", icon: "Code", price: "$49/mo",
    desc: "Builds UI components, fixes React hooks, and sets up Next.js projects.",
    skills: ["React", "Next.js", "Tailwind"],
    steps: [{ type: "trigger", name: "Spec", icon: "MessageSquare" }, { type: "action", name: "Write Code", icon: "Code" }]
  },
  {
    id: "dev-2", category: "Engineering", name: "Ruby", role: "Backend Architect", icon: "Database", price: "$59/mo",
    desc: "Designs SQL schemas, writes API endpoints, and optimizes queries.",
    skills: ["Postgres", "Node.js", "SQL"],
    steps: [{ type: "trigger", name: "Schema Request", icon: "Database" }, { type: "action", name: "Generate SQL", icon: "Code" }]
  },
  {
    id: "dev-3", category: "Engineering", name: "Quinn", role: "QA Tester", icon: "CheckCircle", price: "$39/mo",
    desc: "Writes unit tests and finds edge cases in your logic.",
    skills: ["Jest", "Cypress", "Debugging"],
    steps: [{ type: "trigger", name: "Code Snippet", icon: "Code" }, { type: "action", name: "Write Tests", icon: "Check" }]
  },
  {
    id: "dev-4", category: "Engineering", name: "Cy", role: "Security Analyst", icon: "Lock", price: "$89/mo",
    desc: "Audits code for vulnerabilities and writes security policies.",
    skills: ["Security", "Auditing", "Compliance"],
    steps: [{ type: "trigger", name: "Codebase", icon: "Lock" }, { type: "action", name: "Audit Report", icon: "ShieldCheck" }]
  },

  // MARKETING
  {
    id: "mkt-1", category: "Marketing", name: "Marcus", role: "Growth Hacker", icon: "Megaphone", price: "$49/mo",
    desc: "Writes viral threads, LinkedIn hooks, and ad copy.",
    skills: ["Viral Hooks", "Copywriting", "Twitter"],
    steps: [{ type: "trigger", name: "Topic", icon: "Zap" }, { type: "action", name: "Write Thread", icon: "Twitter" }]
  },
  {
    id: "mkt-2", category: "Marketing", name: "Stella", role: "Social Media Mgr", icon: "Camera", price: "$39/mo",
    desc: "Creates Instagram captions and TikTok scripts.",
    skills: ["Instagram", "TikTok", "Visuals"],
    steps: [{ type: "trigger", name: "Image/Idea", icon: "Camera" }, { type: "action", name: "Write Caption", icon: "PenTool" }]
  },
  {
    id: "mkt-3", category: "Marketing", name: "Gordon", role: "SEO Blog Writer", icon: "PenTool", price: "$45/mo",
    desc: "Writes ranking articles with perfect SEO structure.",
    skills: ["SEO", "Blogging", "Keywords"],
    steps: [{ type: "trigger", name: "Keyword", icon: "Search" }, { type: "action", name: "Write Article", icon: "PenTool" }]
  },
  {
    id: "mkt-4", category: "Marketing", name: "Vic", role: "Video Scripter", icon: "Video", price: "$55/mo",
    desc: "Turns blog posts into engaging YouTube scripts.",
    skills: ["YouTube", "Scripting", "Storytelling"],
    steps: [{ type: "trigger", name: "Topic", icon: "Video" }, { type: "action", name: "Write Script", icon: "PenTool" }]
  },

  // SALES
  {
    id: "sales-1", category: "Sales", name: "Sarah", role: "SDR / Outreach", icon: "DollarSign", price: "$59/mo",
    desc: "Finds leads and writes personalized cold emails.",
    skills: ["Cold Email", "Lead Gen", "Sales"],
    steps: [{ type: "trigger", name: "Company", icon: "Search" }, { type: "action", name: "Draft Email", icon: "Mail" }]
  },
  {
    id: "sales-2", category: "Sales", name: "Larry", role: "Lead Enricher", icon: "Target", price: "$49/mo",
    desc: "Finds emails, LinkedIn profiles, and company data.",
    skills: ["Data Mining", "Enrichment", "Research"],
    steps: [{ type: "trigger", name: "Name", icon: "Search" }, { type: "action", name: "Find Info", icon: "Database" }]
  },

  // OPERATIONS & HR
  {
    id: "ops-1", category: "HR", name: "Holly", role: "HR Manager", icon: "Users", price: "$69/mo",
    desc: "Drafts job descriptions, screens resumes, and writes policies.",
    skills: ["Hiring", "Policy", "Culture"],
    steps: [{ type: "trigger", name: "Requirement", icon: "Users" }, { type: "action", name: "Draft Doc", icon: "Clipboard" }]
  },
  {
    id: "ops-2", category: "Finance", name: "Finn", role: "Finance Analyst", icon: "PieChart", price: "$79/mo",
    desc: "Analyzes P&L statements and drafts tax summaries.",
    skills: ["Excel", "Finance", "Accounting"],
    steps: [{ type: "trigger", name: "Data", icon: "PieChart" }, { type: "action", name: "Analyze", icon: "Check" }]
  },
  {
    id: "ops-3", category: "Legal", name: "Lawson", role: "Legal Assistant", icon: "ShieldCheck", price: "$99/mo",
    desc: "Drafts NDAs, contracts, and reviews terms.",
    skills: ["Contracts", "Law", "Compliance"],
    steps: [{ type: "trigger", name: "Request", icon: "ShieldCheck" }, { type: "action", name: "Draft Contract", icon: "PenTool" }]
  },
  {
    id: "ops-4", category: "Ops", name: "Pat", role: "Product Manager", icon: "Clipboard", price: "$65/mo",
    desc: "Writes user stories, specs, and roadmap items.",
    skills: ["Agile", "Specs", "Roadmap"],
    steps: [{ type: "trigger", name: "Feature Idea", icon: "Zap" }, { type: "action", name: "Write Spec", icon: "Clipboard" }]
  },
  
  // SUPPORT
  {
    id: "sup-1", category: "Support", name: "Sam", role: "Customer Support", icon: "Smartphone", price: "$29/mo",
    desc: "Drafts empathetic replies to angry customer emails.",
    skills: ["Support", "Empathy", "Conflict"],
    steps: [{ type: "trigger", name: "Complaint", icon: "Mail" }, { type: "action", name: "Draft Reply", icon: "MessageSquare" }]
  },
];

export default function EmployeesPage() {
  const [hiring, setHiring] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const router = useRouter();

  const handleHire = async (employee: any) => {
    setHiring(employee.id);
    const supabase = createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Please log in to hire employees.");
            router.push("/login");
            return;
        }

        // --- THE FIX: Ensure we save clean data ---
        const { error } = await supabase.from('agents').insert({
            user_id: user.id,
            name: `${employee.name} (${employee.role})`, 
            steps: employee.steps,
            schedule: 'Manual'
        });

        if (error) throw error;

        // Small delay to make it feel real
        setTimeout(() => {
            alert(`${employee.name} has joined your team!`);
            router.push("/");
        }, 500);

    } catch (e: any) {
        alert("Hiring failed: " + e.message);
        setHiring(null);
    }
  };

  const filteredEmployees = filter === "All" 
    ? EMPLOYEES 
    : EMPLOYEES.filter(e => e.category === filter);

  return (
    <div className={`min-h-screen bg-gray-50 text-black ${inter.className}`}>
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft size={20}/></Link>
                  <h1 className={`text-2xl uppercase ${oswald.className}`}>Marketplace</h1>
              </div>
              <div className="hidden md:block text-sm font-bold text-gray-500">
                  {EMPLOYEES.length} Professionals Available
              </div>
          </div>
          
          {/* CATEGORY TABS */}
          <div className="max-w-7xl mx-auto px-6 flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {["All", "Engineering", "Marketing", "Sales", "HR", "Finance", "Legal", "Support"].map((cat) => (
                <button 
                    key={cat} 
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${filter === cat ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                >
                    {cat}
                </button>
            ))}
          </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {filteredEmployees.map((emp) => (
                <div key={emp.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-xl hover:border-black transition-all group flex flex-col justify-between h-full">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-black group-hover:bg-yellow-400 transition-colors border border-gray-100">
                                {getIcon(emp.icon)}
                            </div>
                            <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                                {emp.category}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold leading-tight">{emp.name}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{emp.role}</p>
                        
                        <p className="text-gray-600 text-xs leading-relaxed mb-4 min-h-[40px]">
                            {emp.desc}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-6">
                            {emp.skills.map((skill, i) => (
                                <span key={i} className="text-[10px] font-bold border border-gray-100 px-1.5 py-0.5 rounded bg-gray-50 text-gray-600">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => handleHire(emp)}
                        disabled={hiring === emp.id}
                        className="w-full bg-black text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wide hover:bg-green-500 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        {hiring === emp.id ? "Onboarding..." : <>Hire {emp.price} <Plus size={14} strokeWidth={3} /></>}
                    </button>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
}

// Icon Helper
function getIcon(name: string) {
    switch(name) {
        case "Code": return <Code size={24} />;
        case "Megaphone": return <Megaphone size={24} />;
        case "DollarSign": return <DollarSign size={24} />;
        case "ShieldCheck": return <ShieldCheck size={24} />;
        case "Users": return <Users size={24} />;
        case "PieChart": return <PieChart size={24} />;
        case "Camera": return <Camera size={24} />;
        case "Database": return <Database size={24} />;
        case "Lock": return <Lock size={24} />;
        case "Clipboard": return <Clipboard size={24} />;
        case "Video": return <Video size={24} />;
        case "Target": return <Target size={24} />;
        case "CheckCircle": return <CheckCircle size={24} />;
        case "Smartphone": return <Smartphone size={24} />;
        default: return <Briefcase size={24} />;
    }
}