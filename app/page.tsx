"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Oswald, Inter } from "next/font/google";
import { 
  ArrowRight, Briefcase, Megaphone, PenTool, Target, Plus, Zap, Trash2, 
  Play, MessageSquare, Globe, Mail, Clock, Database, Twitter, 
  Settings as SettingsIcon, LogOut, Send, Code, ShieldCheck, DollarSign, User as UserIcon,
  Users, PieChart, Camera, Lock, Clipboard, Video, CheckCircle, Smartphone, Search, X
} from "lucide-react";
import { createClient } from './utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { showToast } from './utils/Toast';

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

interface Profile {
  full_name?: string;
}

interface Agent {
  id: string;
  name: string;
  goal?: string;
  instructions?: string;
  icon?: string;
  schedule: string;
  steps: { name: string; icon: string; type?: string }[];
  created_at?: string;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        setLoading(true);

        // Check for successful Stripe checkout redirect parameters
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const agentName = urlParams.get('agent_name');
        const icon = urlParams.get('icon');
        const stepsStr = urlParams.get('steps');
        const plan = urlParams.get('plan');
        const sessionId = urlParams.get('session_id');

        if (success === 'true' && sessionId) {
          try {
            // Await the API call to guarantee the fetch completes before page redirect/reload aborts it
            await fetch('/api/checkout/success', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId, userId: user.id })
            });
          } catch (err) {
            console.error("Error triggering receipt email:", err);
          }
        }

        if (success === 'true' && agentName && icon && stepsStr) {
          try {
            const steps = JSON.parse(decodeURIComponent(stepsStr));
            
            // Provision the new agent in Supabase
            const { error: insertError } = await supabase.from('agents').insert({
                user_id: user.id,
                name: agentName,
                icon: icon,
                steps: steps,
                schedule: 'Manual',
                is_paid_individually: true
            });

            if (insertError) {
              console.error("Failed to provision hired agent:", insertError.message);
              showToast("Payment succeeded, but we had trouble provisioning your agent. Please contact support.", "error");
            } else {
              showToast(`🎉 Success! ${agentName} has joined your team.`, "success");
            }
          } catch (err) {
            console.error("Error parsing redirect parameters:", err);
          } finally {
            // Clean url params so refresh doesn't trigger insert again
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }

        if (success === 'true' && plan) {
          try {
            const { error: updateError } = await supabase
              .from('profiles')
              .upsert({
                id: user.id,
                plan: plan
              });

            if (updateError) {
               console.error("Failed to update plan:", updateError.message);
               showToast("Payment succeeded, but we had trouble updating your plan. Please contact support.", "error");
            } else {
               showToast(`🎉 Success! You have upgraded to the ${plan === 'growth_pro' ? 'Growth Pro' : 'Enterprise'} plan!`, "success");
               setTimeout(() => {
                   window.location.href = "/employees";
               }, 1500);
               return;
            }
          } catch (err) {
            console.error("Error upgrading plan:", err);
          } finally {
            window.history.replaceState({}, document.title, window.location.pathname);
            setLoading(false);
          }
        }

        const { data: agents } = await supabase.from('agents').select('*').order('created_at', { ascending: false });
        if (agents) setMyAgents(agents);

        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profileData) setProfile(profileData);
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleSignOut = async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.reload(); 
  }

  const confirmDelete = async () => {
      if (!deletingAgentId) return;
      const supabase = createClient();
      const { error } = await supabase.from('agents').delete().eq('id', deletingAgentId);
      if (error) { 
          showToast("Error deleting agent: " + error.message, "error"); 
      } else { 
          showToast("Agent deleted successfully!", "success");
          setMyAgents(prev => prev.filter(a => a.id !== deletingAgentId)); 
      }
      setDeletingAgentId(null);
  };

  return (
    <div className={`min-h-screen bg-white text-black selection:bg-yellow-400 selection:text-black ${inter.className}`}>
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 sticky top-0 bg-white/95 backdrop-blur-sm z-50 border-b-4 border-black">
        <div className={`text-2xl md:text-3xl tracking-tighter uppercase italic ${oswald.className} flex items-center gap-2`}>
          <Image
            src="/favicon.ico"
            alt="Pixorva Logo"
            width={36}
            height={36}
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg"
          />
        Pixorva
        </div>
        
        <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-wide">
          <Link href="/employees" className="hover:text-yellow-600 transition">Marketplace</Link>
          <Link href="/pricing" className="hover:text-yellow-600 transition">Pricing</Link>
          <Link href="/studio" className="hover:text-yellow-600 transition">Studio</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
             <div className="flex items-center gap-3">
                 <Link href="/settings" className="hidden md:flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black transition">
                    <SettingsIcon size={14} />
                    {profile?.full_name || user.email?.split('@')[0]}
                 </Link>
                 <button onClick={handleSignOut} className="text-xs font-bold text-gray-400 hover:text-red-500 ml-2"><LogOut size={16}/></button>
             </div>
          ) : (
             <Link href="/login" className="hidden md:block font-bold text-sm hover:text-yellow-600 transition">Log in</Link>
          )}
          <Link href={user ? "/employees" : "/login"} className="bg-black text-white border-2 border-black px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold uppercase hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-none whitespace-nowrap">
            {user ? "Hire Staff" : "Get Started"}
          </Link>
        </div>
      </nav>

      {/* HERO / DASHBOARD */}
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

        <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 font-medium">
          {user 
            ? "Your digital workforce is running 24/7. Assign tasks below."
            : <span>Get an AI Team who runs your inbox, socials, SEO, lead generation, calls, and support. <span className="text-black font-bold"> No sick days. No drama.</span></span>
          }
        </p>

        {/* MAIN BUTTONS */}
        <div className="flex justify-center gap-4">
            <Link href={user ? "/employees" : "/login"}>
                <button className="bg-yellow-400 text-black border-4 border-black px-10 py-5 rounded-xl text-xl font-black uppercase tracking-wide hover:bg-yellow-300 transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none flex items-center gap-3">
                {user ? "Hire New Staff" : "Browse Marketplace"} <ArrowRight strokeWidth={3} />
                </button>
            </Link>
            {user && (
                 <Link href="/studio">
                    <button className="bg-white text-black border-4 border-black px-10 py-5 rounded-xl text-xl font-black uppercase tracking-wide hover:bg-gray-50 transition-all hover:translate-y-1">
                    Build Custom
                    </button>
                 </Link>
            )}
        </div>
        
        {/* --- DYNAMIC AGENT GRID --- */}
        <div className="mt-32">
          {user ? (
             <div className="text-left">
                 <div className="flex flex-col md:flex-row justify-between items-end mb-10 px-4 border-b-4 border-black pb-4">
                    <h2 className={`text-4xl md:text-6xl uppercase ${oswald.className}`}>My Active Team</h2>
                    <span className="font-bold text-gray-500">{myAgents.length} Running</span>
                 </div>

                 {loading ? (
                    <div className="text-center py-20 font-bold text-gray-400">Syncing with Mainframe...</div>
                 ) : myAgents.length === 0 ? (
                    
                    /* --- EMPTY STATE PROMPT TO MARKETPLACE --- */
                    <div className="text-center py-24 border-4 border-dashed border-gray-300 rounded-3xl bg-gray-50 flex flex-col items-center">
                        <div className="bg-white p-4 rounded-full border-2 border-gray-200 mb-4">
                            <Users size={48} className="text-gray-400" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-2">Your office is empty!</h3>
                        <p className="text-gray-500 mb-8 max-w-md">You haven&apos;t hired anyone yet. Visit the Marketplace to hire Devon, Ruby, Lawson, and more.</p>
                        <Link href="/employees">
                            <button className="bg-black text-white px-8 py-4 rounded-xl font-bold uppercase hover:bg-yellow-400 hover:text-black transition flex items-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                                <Plus size={20} /> Go to Marketplace
                            </button>
                        </Link>
                    </div>

                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {myAgents.filter(a => a.name !== "Governance Control Tower").map((agent) => (
                             <div key={agent.id} className="group relative h-[300px] border-4 border-black bg-white rounded-2xl p-6 flex flex-col justify-between hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center border-2 border-black">
                                            {getIcon(agent.steps?.[0]?.icon || agent.icon || "Zap")}
                                        </div>
                                         <button onClick={() => setDeletingAgentId(agent.id)} className="text-gray-300 hover:text-red-600 transition p-1">
                                             <Trash2 size={18}/>
                                         </button>
                                    </div>
                                    <h3 className="text-2xl font-black uppercase leading-none mb-1">{agent.name.split('(')[0]}</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-3">{agent.name.split('(')[1]?.replace(')', '') || 'Custom Agent'}</p>
                                    
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200 uppercase flex items-center gap-1">
                                            Online
                                        </span>
                                        <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded border border-gray-200 uppercase">{agent.steps?.length || 0} Skills</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Link href={`/agent/${agent.id}`} className="flex-1">
                                        <button className="w-full bg-black text-white py-3 rounded-lg font-bold text-xs uppercase hover:bg-yellow-400 hover:text-black transition flex items-center justify-center gap-2">
                                            Open Workstation <ArrowRight size={14}/>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                         <CustomAgentCard />
                    </div>
                 )}
             </div>
          ) : (
            /* --- LOGGED OUT VIEW --- */
            <>
              <div className="flex flex-col md:flex-row justify-between items-end mb-10 px-4 text-left md:text-center">
                <h2 className={`text-4xl md:text-6xl uppercase ${oswald.className}`}>Meet Your Team</h2>
                <Link href="/employees" className="font-bold underline decoration-4 decoration-yellow-400 hover:text-yellow-600 mt-4 md:mt-0">View Marketplace</Link>
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

      {/* FOOTER */}
      <footer className="relative z-10 bg-black text-white py-16 md:py-24 text-center overflow-hidden">
        <div className={`absolute top-0 left-0 right-0 text-[20vw] opacity-5 font-black leading-none select-none ${oswald.className}`}>PIXORVA</div>
        <div className="relative z-10 px-4">
            <h2 className={`text-4xl md:text-7xl uppercase mb-8 md:mb-10 ${oswald.className}`}>Ready to Scale?</h2>
            <Link href={user ? "/employees" : "/login"}>
                <button className="bg-yellow-400 text-black border-none px-10 py-4 md:px-12 md:py-5 rounded-2xl font-black uppercase hover:bg-white transition text-lg md:text-xl shadow-[0px_0px_20px_rgba(250,204,21,0.5)] w-full md:w-auto">Start Hiring (Free)</button>
            </Link>
            <p className="text-gray-500 mt-10 md:mt-12 text-xs md:text-sm font-mono tracking-widest">© 2026 PIXORVA INC. // SYSTEM OPERATIONAL</p>
        </div>
      </footer>

      {/* CUSTOM NEOBRUTALIST DELETE CONFIRMATION MODAL */}
      {deletingAgentId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black p-8 rounded-3xl max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200 text-center relative">
                <button 
                  onClick={() => setDeletingAgentId(null)} 
                  className="absolute right-4 top-4 text-gray-400 hover:text-black transition"
                >
                    <X size={24} />
                </button>

                <div className="mb-6 flex justify-center">
                    <div className="bg-red-100 p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-red-600">
                        <Trash2 size={36} />
                    </div>
                </div>

                <h3 className={`text-3xl uppercase mb-3 ${oswald.className}`}>
                    Delete Agent
                </h3>

                <p className="text-sm font-semibold text-gray-600 mb-8 leading-relaxed">
                    Are you sure you want to permanently delete this agent? This action is permanent and cannot be undone.
                </p>

                <div className="flex flex-col gap-3">
                    <button 
                      onClick={confirmDelete}
                      className="w-full bg-red-600 text-white hover:bg-black py-4 rounded-xl border-2 border-black font-black uppercase text-sm tracking-wider transition shadow-md flex items-center justify-center gap-2"
                    >
                        Yes, Delete Agent
                    </button>
                    <button 
                      onClick={() => setDeletingAgentId(null)}
                      className="w-full bg-white text-gray-500 hover:text-black py-2 font-bold uppercase text-xs tracking-wider transition"
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

// HELPERS
function getIcon(name: string) {
    switch (name) {
      case "Code": return <Code size={24} />;
      case "Megaphone": return <Megaphone size={24} />;
      case "DollarSign": return <DollarSign size={24} />;
      case "ShieldCheck": return <ShieldCheck size={24} />;
      case "User": return <UserIcon size={24} />;
      case "Zap": return <Zap size={24} />;
      case "Mail": return <Mail size={24} />;
      case "Send": return <Send size={24} />;
      case "MessageSquare": return <MessageSquare size={24} />;
      case "Play": return <Play size={24} />;
      case "Globe": return <Globe size={24} />;
      case "Clock": return <Clock size={24} />;
      case "Database": return <Database size={24} />;
      case "Twitter": return <Twitter size={24} />;
      case "PenTool": return <PenTool size={24} />;
      case "Target": return <Target size={24} />;
      case "Briefcase": return <Briefcase size={24} />;
      case "Users": return <Users size={24} />;
      case "PieChart": return <PieChart size={24} />;
      case "Camera": return <Camera size={24} />;
      case "Lock": return <Lock size={24} />;
      case "Clipboard": return <Clipboard size={24} />;
      case "Video": return <Video size={24} />;
      case "CheckCircle": return <CheckCircle size={24} />;
      case "Smartphone": return <Smartphone size={24} />;
      case "Search": return <Search size={24} />;
      default: return <Zap size={24} />;
    }
}

function CustomAgentCard() {
  return (
    <Link href="/studio">
      <div className="group relative cursor-pointer h-full min-h-[300px]">
        <div className="h-full rounded-2xl border-4 border-black bg-black flex flex-col items-center justify-center shadow-[8px_8px_0px_0px_rgba(100,100,100,1)] transition-all group-hover:translate-y-1 group-hover:shadow-none relative overflow-hidden">
          <div className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center mb-4 text-white"><Plus size={32} /></div>
          <span className="text-white font-black uppercase tracking-widest text-lg z-10">Build Custom</span>
          <span className="text-gray-500 text-xs font-bold uppercase tracking-wide mt-1 z-10">In the Studio</span>
        </div>
      </div>
    </Link>
  );
}

interface AgentCardProps {
  name: string;
  role: string;
  color: string;
  icon: React.ReactNode;
  desc: string;
}

function AgentCard({ name, role, color, icon, desc }: AgentCardProps) {
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