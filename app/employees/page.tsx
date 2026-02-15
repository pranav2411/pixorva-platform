"use client";

import React, { useState } from "react";
import { Oswald, Inter } from "next/font/google";
import { ArrowLeft, Plus, Check, Briefcase, Code, Megaphone, PenTool, Search, ShieldCheck, DollarSign, User } from "lucide-react";
import Link from "next/link";
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

// --- THE PRE-TRAINED EMPLOYEES ---
const EMPLOYEES = [
  {
    id: "dev-1",
    name: "Devon",
    role: "Senior React Developer",
    category: "Engineering",
    icon: "Code",
    price: "$49/mo",
    description: "Writes clean React/Next.js code. Can debug errors, refactor components, and set up Tailwind layouts instantly.",
    skills: ["React", "Next.js", "Tailwind", "Supabase"],
    steps: [
      { id: 1, type: "trigger", name: "Code Request", icon: "MessageSquare" },
      { id: 2, type: "action", name: "Analyze Requirement", icon: "Search" },
      { id: 3, type: "action", name: "Write Code", icon: "Code" }
    ]
  },
  {
    id: "mark-1",
    name: "Marcus",
    role: "Growth Marketer",
    category: "Marketing",
    icon: "Megaphone",
    price: "$39/mo",
    description: "Generates viral tweet threads, LinkedIn posts, and cold emails. Knows the latest hooks and engagement strategies.",
    skills: ["Copywriting", "SEO", "Viral Hooks", "Email Marketing"],
    steps: [
      { id: 1, type: "trigger", name: "Topic Input", icon: "Play" },
      { id: 2, type: "action", name: "Generate Hooks", icon: "Zap" },
      { id: 3, type: "action", name: "Draft Content", icon: "Megaphone" }
    ]
  },
  {
    id: "sales-1",
    name: "Sarah",
    role: "Outbound Sales Rep",
    category: "Sales",
    icon: "DollarSign",
    price: "$59/mo",
    description: "Finds leads, enriches data, and drafts personalized outreach emails. Never sleeps, never complains.",
    skills: ["Lead Gen", "Enrichment", "Cold Email", "CRM"],
    steps: [
      { id: 1, type: "trigger", name: "Company Name", icon: "Search" },
      { id: 2, type: "action", name: "Find Decision Maker", icon: "User" },
      { id: 3, type: "action", name: "Draft Cold Email", icon: "Mail" }
    ]
  },
  {
    id: "legal-1",
    name: "Lawson",
    role: "Legal Assistant",
    category: "Legal",
    icon: "ShieldCheck",
    price: "$99/mo",
    description: "Drafts NDAs, privacy policies, and contracts. Reviews documents for risks and compliance issues.",
    skills: ["Contracts", "Compliance", "Research", "Drafting"],
    steps: [
      { id: 1, type: "trigger", name: "Document Upload", icon: "FileText" },
      { id: 2, type: "action", name: "Analyze Risk", icon: "Search" },
      { id: 3, type: "action", name: "Draft Terms", icon: "PenTool" }
    ]
  }
];

export default function EmployeesPage() {
  const [hiring, setHiring] = useState<string | null>(null);
  const router = useRouter();

  const handleHire = async (employee: any) => {
    setHiring(employee.id);
    const supabase = createClient();

    try {
        // 1. Check Login
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("Please log in to hire employees.");
            router.push("/login");
            return;
        }

        // 2. Save to Database
        const { error } = await supabase.from('agents').insert({
            user_id: user.id,
            name: `${employee.name} (${employee.role})`, 
            steps: employee.steps 
        });

        if (error) throw error;

        // 3. Success
        alert(`Successfully hired ${employee.name}! They are now in your dashboard.`);
        router.push("/"); // Go back to dashboard to see them

    } catch (e: any) {
        alert("Hiring failed: " + e.message);
    } finally {
        setHiring(null);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 text-black ${inter.className}`}>
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft size={20}/></Link>
                  <h1 className={`text-2xl uppercase ${oswald.className}`}>Marketplace</h1>
              </div>
              <div className="text-sm font-bold text-gray-500">
                  Find your next star employee.
              </div>
          </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Categories (Visual only for now) */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-4">
            {["All Roles", "Engineering", "Marketing", "Sales", "Legal", "HR", "Finance"].map((cat, i) => (
                <button key={i} className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${i===0 ? 'bg-black text-white' : 'bg-white border border-gray-200 hover:border-black'}`}>
                    {cat}
                </button>
            ))}
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EMPLOYEES.map((emp) => (
                <div key={emp.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-black transition-all group flex flex-col justify-between h-full">
                    
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-black group-hover:bg-yellow-400 transition-colors">
                                {getIcon(emp.icon)}
                            </div>
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                {emp.category}
                            </span>
                        </div>

                        <h3 className="text-2xl font-bold mb-1">{emp.name}</h3>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{emp.role}</p>
                        
                        <p className="text-gray-600 text-sm leading-relaxed mb-6">
                            {emp.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {emp.skills.map((skill, i) => (
                                <span key={i} className="text-[10px] font-bold border border-gray-200 px-2 py-1 rounded bg-gray-50">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    <button 
                        onClick={() => handleHire(emp)}
                        disabled={hiring === emp.id}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-wide hover:bg-green-500 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                        {hiring === emp.id ? "Onboarding..." : <>Hire for {emp.price} <Plus size={18} strokeWidth={3} /></>}
                    </button>
                </div>
            ))}

            {/* CUSTOM CARD */}
            <Link href="/studio" className="border-4 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-gray-400 hover:bg-gray-50 transition cursor-pointer min-h-[400px]">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <Plus size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-500">Build Custom Agent</h3>
                <p className="text-sm text-gray-400 mt-2">Design a specific workflow from scratch.</p>
            </Link>

        </div>

      </main>
    </div>
  );
}

// Icon Helper
function getIcon(name: string) {
    switch(name) {
        case "Code": return <Code size={28} />;
        case "Megaphone": return <Megaphone size={28} />;
        case "DollarSign": return <DollarSign size={28} />;
        case "ShieldCheck": return <ShieldCheck size={28} />;
        default: return <Briefcase size={28} />;
    }
}