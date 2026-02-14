"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Oswald, Inter } from "next/font/google";
// Added Trash2 for deleting agents and other icons for the dashboard
import { ArrowRight, Briefcase, Megaphone, PenTool, Target, Plus, Zap, Trash2, Play, MessageSquare, Globe, Mail, Clock, Database, Twitter } from "lucide-react";

// --- AUTH IMPORTS ---
import { createClient } from './utils/supabase/client';
import { User } from '@supabase/supabase-js';

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  // --- STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [myAgents, setMyAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // --- 1. CHECK AUTH & LOAD AGENTS ---
  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      
      // A. Check User
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // B. If User exists, Fetch Agents from Database
      if (user) {
        setLoading(true);
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data) setMyAgents(data);
        setLoading(false);
      }
    };
    init();
  }, []);

  // --- 2. LOGIN LOGIC ---
  const handleLogin = async () => {
    try {
      const supabase = createClient();
      const email = prompt("Enter your email to login:");
      if (!email) return;
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) alert(error.message);
      else alert("Check your email for the login link!");
    } catch (e) {
      alert("Error: Check .env.local file");
    }
  };

  const handleSignOut = async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setMyAgents([]); // Clear local list
  }

  // --- 3. DELETE AGENT LOGIC ---
  const handleDelete = async (id: string) => {
      if(!confirm("Are you sure you want to delete this agent?")) return;
      const supabase = createClient();
      await supabase.from('agents').delete().eq('id', id);
      // Remove from screen immediately
      setMyAgents(prev => prev.filter(a => a.id !== id));
  }

  return (
    <div className={`min-h-screen bg-white text-black selection:bg-yellow-400 selection:text-black ${inter.className}`}>
      
      {/* --- NAVBAR --- */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 sticky top-0 bg-white/95 backdrop-blur-sm z-50 border-b border-black/5">
        <div className={`text-2xl md:text-3xl tracking-tighter uppercase italic ${oswald.className} flex items-center gap-2`}>
          <div className="bg-black text-white w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-lg md:text-xl not-italic font-bold">P</div>
          Pixorva
        </div>
        
        {/* Restored Tabs */}
        <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-wide">
          <Link href="#" className="hover:text-yellow-600 transition">AI Employees</Link>
          <Link href="#" className="hover:text-yellow-600 transition">Pricing</Link>
          <Link href="/studio" className="hover:text-yellow-600 transition">Studio</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
             <div className="flex items-center gap-3">
                 <span className="hidden md:inline text-xs font-bold text-gray-500">Hi, {user.email?.split('@')[0]}</span>
                 <button onClick={handleSignOut} className="text-xs font-bold underline hover:text-red-500">Sign Out</button>
             </div>
          ) : (
             <button onClick={handleLogin} className="hidden md:block font-bold text-sm hover:text-yellow-600 transition">
                Log in
             </button>
          )}
          
          <Link 
            href={user ? "/studio" : "#"} 
            onClick={() => !user && handleLogin()} 
            className="bg-black text-white border-2 border-black px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold uppercase hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-none whitespace-nowrap"
          >
            {user ? "Open Studio" : "Get Started"}
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        
        {/* Dynamic Header */}
        <div className="inline-block bg-yellow-100 border-2 border-black px-4 py-1 rounded-full text-[10px] md:text-xs font-black uppercase mb-8 transform -rotate-2 hover:rotate-0 transition-transform cursor-default">
          {user ? "Welcome Back, Boss" : "The Future of Work is Here"}
        </div>
        
        <h1 className={`text-6xl md:text-9xl uppercase leading-[0.9] mb-8 ${oswald.className}`}>
          {user ? "Manage Your" : "Hire your next"} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">
             {user ? "Workforce." : "AI Employee."}
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 font-medium">
          {user 
            ? "Your agents are running 24/7. Check their status below or build a new one."
            : <span>Get an AI Team who runs your inbox, socials, SEO, lead generation, calls, and support. <span className="text-black font-bold"> No sick days. No drama.</span></span>
          }
        </p>

        <div className="flex justify-center gap-4">
            <Link href="/studio">
                <button className="bg-yellow-400 text-black border-4 border-black px-10 py-5 rounded-xl text-xl font-black uppercase tracking-wide hover:bg-yellow-300 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none flex items-center gap-3">
                {user ? "Build New Agent" : "Get Started"} <ArrowRight strokeWidth={3} />
                </button>
            </Link>
            {/* Payment / Upgrade Button (Placeholder for Phase C) */}
            {user && (
                <button className="bg-white text-black border-4 border-black px-10 py-5 rounded-xl text-xl font-black uppercase tracking-wide hover:bg-gray-100 transition-all hover:translate-y-1">
                 Manage Billing
                </button>
            )}
        </div>

        {/* --- DYNAMIC AGENT GRID --- */}
        <div className="mt-32">
          
          {/* 1. IF LOGGED IN: SHOW REAL AGENTS */}
          {user ? (
             <div className="text-left">
                 <div className="flex flex-col md:flex-row justify-between items-end mb-10 px-4 border-b-4 border-black pb-4">
                    <h2 className={`text-4xl md:text-6xl uppercase ${oswald.className}`}>My Active Agents</h2>
                    <span className="font-bold text-gray-500">{myAgents.length} Running</span>
                 </div>

                 {loading ? (
                    <div className="text-center py-20 font-bold text-gray-400">Syncing with Mainframe...</div>
                 ) : myAgents.length === 0 ? (
                    <div className="text-center py-20 border-4 border-dashed border-gray-300 rounded-3xl">
                        <h3 className="text-2xl font-bold text-gray-400">No agents hired yet.</h3>
                        <Link href="/studio" className="text-black underline font-bold mt-2 inline-block">Go to Studio to hire one.</Link>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {myAgents.map((agent) => (
                             <div key={agent.id} className="group relative h-[300px] border-4 border-black bg-white rounded-2xl p-6 flex flex-col justify-between hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center border-2 border-black">
                                            {getIcon(agent.steps?.[0]?.icon || "Zap")}
                                        </div>
                                        {/* DELETE BUTTON */}
                                        <button onClick={() => handleDelete(agent.id)} className="text-gray-300 hover:text-red-600 transition p-1">
                                            <Trash2 size={18}/>
                                        </button>
                                    </div>
                                    <h3 className="text-2xl font-black uppercase leading-none mb-2">{agent.name}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200 uppercase">Active</span>
                                        <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded border border-gray-200 uppercase">{agent.steps?.length || 0} Steps</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 bg-black text-white py-2 rounded-lg font-bold text-xs uppercase hover:bg-yellow-400 hover:text-black transition">View</button>
                                </div>
                            </div>
                        ))}
                         <CustomAgentCard />
                    </div>
                 )}
             </div>
          ) : (
            
          /* 2. IF LOGGED OUT: SHOW DEMO AGENTS */
            <>
              <div className="flex flex-col md:flex-row justify-between items-end mb-10 px-4 text-left md:text-center">
                <h2 className={`text-4xl md:text-6xl uppercase ${oswald.className}`}>Meet Your Team</h2>
                <Link href="#" className="font-bold underline decoration-4 decoration-yellow-400 hover:text-yellow-600 mt-4 md:mt-0">View all Agents</Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <AgentCard name="EVA" role="Exec. Assistant" color="bg-orange-500" icon={<Briefcase size={64} className="text-white" />} desc="Manages your calendar & inbox." />
                <AgentCard name="SONNY" role="Social Media" color="bg-green-500" icon={<Megaphone size={64} className="text-white" />} desc="Writes & posts viral content." />
                <AgentCard name="PENNY" role="SEO Writer" color="bg-blue-600" icon={<PenTool size={64} className="text-white" />} desc="Ranks your blog #1 on Google." />
                <AgentCard name="STAN" role="Lead Gen" color="bg-red-600" icon={<Target size={64} className="text-white" />} desc="Finds & closes new clients." />
                <CustomAgentCard />
              </div>
            </>
          )}

        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 bg-black text-white py-16 md:py-24 text-center overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 text-[20vw] opacity-5 font-black leading-none select-none ${oswald.className}`}>PIXORVA</div>
        <div className="relative z-10 px-4">
            <h2 className={`text-4xl md:text-7xl uppercase mb-8 md:mb-10 ${oswald.className}`}>Ready to Scale?</h2>
            <button onClick={() => !user && handleLogin()} className="bg-yellow-400 text-black border-none px-10 py-4 md:px-12 md:py-5 rounded-2xl font-black uppercase hover:bg-white transition text-lg md:text-xl shadow-[0px_0px_20px_rgba(250,204,21,0.5)] w-full md:w-auto">Start Free Trial</button>
            <p className="text-gray-500 mt-10 md:mt-12 text-xs md:text-sm font-mono tracking-widest">© 2026 PIXORVA INC. // SYSTEM OPERATIONAL</p>
        </div>
      </footer>
    </div>
  );
}

// --- HELPERS ---
function getIcon(name: string) {
    switch (name) {
      case "Zap": return <Zap size={24} />;
      case "Send": return <Zap size={24} />;
      case "MessageSquare": return <MessageSquare size={24} />;
      case "Play": return <Play size={24} />;
      case "Globe": return <Globe size={24} />;
      case "Mail": return <Mail size={24} />;
      case "Clock": return <Clock size={24} />;
      case "Database": return <Database size={24} />;
      case "Twitter": return <Twitter size={24} />;
      default: return <Zap size={24} />;
    }
}

function AgentCard({ name, role, color, icon, desc }: any) {
  return (
    <div className="group relative cursor-pointer">
      <div className={`h-64 rounded-2xl border-4 border-black ${color} flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group-hover:translate-y-1 group-hover:shadow-none overflow-hidden relative`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_black_1px,_transparent_1px)] bg-[length:10px_10px]"></div>
        <span className="relative z-10 transform transition-transform group-hover:scale-110 duration-300">{icon}</span>
        <div className="absolute bottom-4 left-4 bg-white border-2 border-black px-3 py-1 rounded-md font-black uppercase text-sm transform -rotate-2 group-hover:rotate-0 transition">{name}</div>
      </div>
      <div className="mt-4 text-left px-2">
        <h3 className="text-xl font-black uppercase leading-none">{role}</h3>
        <p className="text-sm font-medium text-gray-500 mt-1">{desc}</p>
      </div>
    </div>
  );
}

function CustomAgentCard() {
  return (
    <Link href="/studio">
      <div className="group relative cursor-pointer">
        <div className="h-64 rounded-2xl border-4 border-black bg-black flex flex-col items-center justify-center shadow-[8px_8px_0px_0px_rgba(100,100,100,1)] transition-all group-hover:translate-y-1 group-hover:shadow-none relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-black transition-colors text-white"><Plus size={32} strokeWidth={3} /></div>
          <span className="text-white font-black uppercase tracking-widest text-lg z-10">Build Custom</span>
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wide mt-1 z-10">In the Studio</span>
        </div>
        <div className="mt-4 text-left px-2 opacity-50 group-hover:opacity-100 transition-opacity">
          <h3 className="text-xl font-black uppercase leading-none">Your Agent</h3>
          <p className="text-sm font-medium text-gray-500 mt-1">Design it yourself.</p>
        </div>
      </div>
    </Link>
  );
}