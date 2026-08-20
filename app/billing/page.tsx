"use client";

import React, { useState, useEffect } from "react";
import { Oswald, Inter } from "next/font/google";
import { 
  ArrowLeft, CreditCard, Sparkles, XCircle, Trash, RefreshCw,
  Code, Megaphone, DollarSign, ShieldCheck, User as UserIcon, Zap, 
  Mail, Send, MessageSquare, Play, Globe, Clock, Database, Twitter, 
  PenTool, Target, Briefcase, Users, PieChart, Camera, Lock, Clipboard, 
  Video, CheckCircle, Smartphone, Search
} from 'lucide-react';
import Link from "next/link";
import { createClient } from "../utils/supabase/client";
import { useRouter } from "next/navigation";
import { showToast } from "../utils/Toast";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

interface Subscription {
  id: string;
  name: string;
  type: "Employee Salary" | "Utility Subscription";
  price: string;
  icon: string;
}

function getIcon(name: string) {
  switch (name) {
    case "Code": return <Code size={20} />;
    case "Megaphone": return <Megaphone size={20} />;
    case "DollarSign": return <DollarSign size={20} />;
    case "ShieldCheck": return <ShieldCheck size={20} />;
    case "User": return <UserIcon size={20} />;
    case "Zap": return <Zap size={20} />;
    case "Mail": return <Mail size={20} />;
    case "Send": return <Send size={20} />;
    case "MessageSquare": return <MessageSquare size={20} />;
    case "Play": return <Play size={20} />;
    case "Globe": return <Globe size={20} />;
    case "Clock": return <Clock size={20} />;
    case "Database": return <Database size={20} />;
    case "Twitter": return <Twitter size={20} />;
    case "PenTool": return <PenTool size={20} />;
    case "Target": return <Target size={20} />;
    case "Briefcase": return <Briefcase size={20} />;
    case "Users": return <Users size={20} />;
    case "PieChart": return <PieChart size={20} />;
    case "Camera": return <Camera size={20} />;
    case "Lock": return <Lock size={20} />;
    case "Clipboard": return <Clipboard size={20} />;
    case "Video": return <Video size={20} />;
    case "CheckCircle": return <CheckCircle size={20} />;
    case "Smartphone": return <Smartphone size={20} />;
    case "Search": return <Search size={20} />;
    default: return <Zap size={20} />;
  }
}

export default function BillingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<string>("Starter Plan");
  
  // List of active monthly salary subscriptions
  const [salaries, setSalaries] = useState<Subscription[]>([]);
  const [terminatingId, setTerminatingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          router.push("/login");
          return;
        }
        setUser(currentUser);

        // Fetch User profile tier
        const { data: profile } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', currentUser.id)
          .single();

        if (profile?.plan) {
          setPlan(profile.plan === 'growth_pro' ? "Growth Pro Plan" : "Enterprise Plan");
        }

        // Fetch active salaries/subscriptions from agents table
        const { data: activeAgents } = await supabase
          .from('agents')
          .select('id, name, icon')
          .eq('user_id', currentUser.id);

        if (activeAgents) {
          const salaryList: Subscription[] = activeAgents.map(agent => {
            const isGov = agent.name === "Governance Control Tower";
            
            // Map price levels
            let price = "₹999/mo";
            const lowerName = agent.name.toLowerCase();
            if (isGov) price = "₹1,999/mo";
            else if (lowerName.includes("ruby")) price = "₹1,299/mo";
            else if (lowerName.includes("quinn")) price = "₹799/mo";
            else if (lowerName.includes("cy")) price = "₹1,499/mo";
            else if (lowerName.includes("marcus")) price = "₹899/mo";
            else if (lowerName.includes("stella")) price = "₹699/mo";

            return {
              id: agent.id,
              name: agent.name,
              type: isGov ? "Utility Subscription" : "Employee Salary",
              price: price,
              icon: agent.icon || "🤖"
            };
          });
          setSalaries(salaryList);
        }

      } catch (err) {
        console.error("Billing load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBillingData();
  }, [router]);

  const handleCancelSalary = async (id: string, name: string) => {
    setTerminatingId(id);
    try {
      const supabase = createClient();
      
      // Delete from agents table (which cancels their active hire slot)
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSalaries(prev => prev.filter(s => s.id !== id));
      showToast(`Cancelled salary subscription for ${name}`, "success");
    } catch (err: any) {
      console.error(err);
      showToast("Error cancelling subscription: " + err.message, "error");
    } finally {
      setTerminatingId(null);
    }
  };

  const handleCancelPlan = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ plan: null })
        .eq('id', user.id);

      if (error) throw error;
      setPlan("Starter Plan");
      showToast("Downgraded to Starter Plan successfully", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Downgrade plan failed: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${inter.className}`}>
        <div className="bg-white border-4 border-black p-8 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center max-w-sm">
          <RefreshCw className="animate-spin mx-auto text-black mb-4" size={32} />
          <h3 className={`text-xl uppercase ${oswald.className}`}>Loading Billing Details...</h3>
          <p className="text-xs text-gray-500 font-bold uppercase mt-2">Workspace Payment Portal</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 text-black ${inter.className} pb-16`}>
      
      {/* HEADER */}
      <nav className="bg-white border-b-4 border-black sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="bg-black text-white p-2 rounded hover:bg-yellow-400 hover:text-black transition border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-y-1">
              <ArrowLeft size={20}/>
            </Link>
            <div>
              <h1 className={`text-2xl md:text-3xl uppercase ${oswald.className} tracking-tighter leading-none`}>Billing Portal</h1>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Manage Salaries & Subscriptions</span>
            </div>
          </div>
          <div className="bg-yellow-400 text-black border-2 border-black px-3 py-1.5 rounded font-black text-xs uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5">
            <CreditCard size={14}/> Secure Portal
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 mt-10">
        
        {/* ACTIVE PLAN COVER */}
        <div className="bg-black text-white border-4 border-black rounded-2xl p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest block mb-1">Active Plan Level</span>
            <h2 className={`text-3xl uppercase ${oswald.className} tracking-tight`}>{plan}</h2>
            <p className="text-gray-400 text-xs mt-1">Gives you workspace quotas, templates, and agent deployment limits.</p>
          </div>
          {plan !== "Starter Plan" ? (
            <button 
              onClick={handleCancelPlan}
              className="bg-white text-black hover:bg-red-500 hover:text-white transition font-bold uppercase text-xs px-5 py-3 rounded-lg border-2 border-white shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)]"
            >
              Downgrade Plan
            </button>
          ) : (
            <Link href="/pricing">
              <button className="bg-yellow-400 text-black hover:bg-white transition font-black uppercase text-xs px-5 py-3 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(250,204,21,0.3)]">
                Upgrade Workspace
              </button>
            </Link>
          )}
        </div>

        {/* ACTIVE SUBSCRIPTIONS GRID */}
        <h3 className={`text-2xl uppercase mb-4 ${oswald.className}`}>Active Salary & Utility Contracts</h3>
        
        {salaries.length === 0 ? (
          <div className="bg-white border-4 border-black p-8 rounded-2xl text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles size={32} className="mx-auto text-gray-400 mb-3" />
            <h4 className="font-bold text-sm uppercase">No Active Salary Subscriptions</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              You haven&apos;t hired any individual employees or unlocked governance control centers yet. Visit the Marketplace to hire workers.
            </p>
            <Link href="/employees">
              <button className="bg-black text-white hover:bg-yellow-400 hover:text-black transition px-6 py-2.5 rounded-lg border-2 border-black font-bold uppercase text-xs mt-4">Browse Marketplace</button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
            {salaries.map((sub) => (
              <div 
                key={sub.id}
                className="bg-white border-4 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-black text-white border-2 border-black rounded-lg flex items-center justify-center">
                    {getIcon(sub.icon)}
                  </div>
                  <div>
                    <h4 className="font-black text-sm uppercase leading-none">{sub.name.split('(')[0]}</h4>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide block mt-1.5">{sub.type}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs font-black uppercase tracking-wider">{sub.price}</span>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">Recurring Salary</span>
                  </div>
                  
                  <button 
                    disabled={terminatingId === sub.id}
                    onClick={() => handleCancelSalary(sub.id, sub.name)}
                    className="bg-red-100 text-red-700 hover:bg-red-600 hover:text-white transition p-2.5 border-2 border-black rounded-xl"
                  >
                    <Trash size={16}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

    </div>
  );
}
