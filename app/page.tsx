"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Oswald, Inter } from "next/font/google";
import { ArrowRight, Briefcase, Megaphone, PenTool, Target, Plus, Zap, Trash2, Play, MessageSquare, Globe, Mail, Clock, Database, Twitter, Settings as SettingsIcon, LogOut } from "lucide-react";
import { createClient } from './utils/supabase/client';
import { User } from '@supabase/supabase-js';

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null); // New Profile State
  const [myAgents, setMyAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        setLoading(true);
        // Fetch Agents
        const { data: agents } = await supabase.from('agents').select('*').order('created_at', { ascending: false });
        if (agents) setMyAgents(agents);

        // Fetch Profile Name
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) setProfile(profile);

        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSignOut = async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.reload(); // Refresh to clear state
  }

  const handleDelete = async (id: string) => {
      if(!confirm("Delete this agent?")) return;
      const supabase = createClient();
      await supabase.from('agents').delete().eq('id', id);
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
        
        <div className="flex items-center gap-4">
          {user ? (
             <div className="flex items-center gap-3">
                 {/* SETTINGS LINK */}
                 <Link href="/settings" className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black transition">
                    <SettingsIcon size={14} />
                    {profile?.full_name || user.email?.split('@')[0]}
                 </Link>
                 <button onClick={handleSignOut} className="text-xs font-bold text-red-500 hover:text-red-700 ml-2"><LogOut size={16}/></button>
             </div>
          ) : (
             // LOGIN LINK
             <Link href="/login" className="hidden md:block font-bold text-sm hover:text-yellow-600 transition">
                Log in
             </Link>
          )}
          
          <Link href={user ? "/studio" : "/login"} className="bg-black text-white border-2 border-black px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold uppercase hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-none whitespace-nowrap">
            {user ? "Open Studio" : "Get Started"}
          </Link>
        </div>
      </nav>

      {/* --- DASHBOARD --- */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        
        <div className="inline-block bg-yellow-100 border-2 border-black px-4 py-1 rounded-full text-[10px] md:text-xs font-black uppercase mb-8 transform -rotate-2 hover:rotate-0 transition-transform cursor-default">
          {user ? `Welcome Back, ${profile?.full_name?.split(' ')[0] || 'Boss'}` : "The Future of Work is Here"}
        </div>
        
        <h1 className={`text-6xl md:text-9xl uppercase leading-[0.9] mb-8 ${oswald.className}`}>
          {user ? "Manage Your" : "Hire your next"} <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">
             {user ? "Workforce." : "AI Employee."}
          </span>
        </h1>
        
        {/* ... (The rest of your Grid code remains the same as before) ... */}
         {/* Just ensure you copy the grid logic from the previous working version if needed, or I can paste it if you lost it. */}
         
         {/* Simple version of grid for brevity: */}
         {user && (
             <div className="mt-16 text-left">
                 <h2 className={`text-4xl uppercase mb-8 ${oswald.className}`}>My Agents</h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {myAgents.map(agent => (
                        <div key={agent.id} className="border-4 border-black p-6 rounded-xl relative group hover:shadow-[8px_8px_0px_0px_black] transition-all">
                             <div className="flex justify-between">
                                <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-lg">{getIcon(agent.steps?.[0]?.icon || 'Zap')}</div>
                                <button onClick={() => handleDelete(agent.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
                             </div>
                             <h3 className="font-black text-2xl uppercase mt-4">{agent.name}</h3>
                             <p className="text-gray-500 text-sm font-bold mt-1">{agent.steps.length} Steps</p>
                        </div>
                    ))}
                    <Link href="/studio" className="border-4 border-dashed border-gray-300 p-6 rounded-xl flex flex-col items-center justify-center hover:border-black hover:bg-gray-50 transition cursor-pointer">
                        <Plus size={32} className="text-gray-400 mb-2"/>
                        <span className="font-bold text-gray-500">Hire New Agent</span>
                    </Link>
                 </div>
             </div>
         )}

      </main>
    </div>
  );
}

function getIcon(name: string) {
    // ... keep your getIcon helper ...
     switch (name) {
      case "Zap": return <Zap size={24} />;
      default: return <Zap size={24} />;
    }
}