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
  Users, PieChart, Camera, Lock, Clipboard, Video, CheckCircle, Smartphone, Search, X,
  Menu, ChevronDown, ChevronUp, Cpu, FileText
} from "lucide-react";
import { createClient } from './utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { showToast } from './utils/Toast';
import AgentAvatar from "./components/AgentAvatar";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

const getRegistryIdByName = (name: string): string => {
  const cleanName = name.split('(')[0].trim().toLowerCase();
  const map: Record<string, string> = {
    devon: 'dev-1',
    ruby: 'dev-2',
    quinn: 'dev-3',
    cy: 'dev-4',
    marcus: 'mkt-1',
    stella: 'mkt-2',
    gordon: 'mkt-3',
    vic: 'mkt-4',
    sarah: 'sales-1',
    larry: 'sales-2',
    holly: 'ops-1',
    finn: 'ops-2',
    lawson: 'ops-3',
    pat: 'ops-4',
    sam: 'sup-1'
  };
  return map[cleanName] || 'custom';
};

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiDropdown, setAiDropdown] = useState(false);

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
      
      {/* JSON-LD Structured Data for Brand Indexing */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Pixorva",
            "url": "https://pixorva.com",
            "logo": "https://pixorva.com/favicon.ico",
            "description": "Hire your next AI Employee. Browse, inspect, and provision specialized AI agents for your business team."
          })
        }}
      />

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 sticky top-0 bg-white/95 backdrop-blur-sm z-50 border-b-4 border-black">
        <div className={`text-2xl md:text-3xl tracking-tighter uppercase italic ${oswald.className} flex items-center gap-2 shrink-0`}>
          <Image
            src="/favicon.ico"
            alt="Pixorva Logo"
            width={36}
            height={36}
            className="w-8 h-8 md:w-9 md:h-9 rounded-lg"
          />
          <span>Pixorva</span>
        </div>

        {/* Desktop Links (Hidden on Mobile) */}
        <div className="hidden lg:flex gap-8 items-center justify-center flex-grow mx-6 text-sm font-bold uppercase tracking-wide py-1 relative">
          <Link href="/employees" className="hover:text-yellow-600 transition">Marketplace</Link>
          <Link href="/pricing" className="hover:text-yellow-600 transition">Pricing</Link>
          <Link href="/studio" className="hover:text-yellow-600 transition">Studio</Link>
          <Link href="/workspace" className="hover:text-yellow-600 transition">Workspace</Link>
          <Link href="/governance" className="hover:text-yellow-600 transition">Governance</Link>
          <Link href="/docs" className="hover:text-yellow-600 transition">Docs</Link>
        </div>

        {/* Desktop Right Panel (Hidden on Mobile) */}
        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/settings" className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-black transition">
                <SettingsIcon size={14} />
                {profile?.full_name || user.email?.split('@')[0]}
              </Link>
              <button onClick={handleSignOut} className="text-xs font-bold text-gray-400 hover:text-red-500 ml-2"><LogOut size={16} /></button>
            </div>
          ) : (
            <Link href="/login" className="font-bold text-sm hover:text-yellow-600 transition">Log in</Link>
          )}
          <Link href={user ? "/employees" : "/login"} className="bg-black text-white border-2 border-black px-5 py-2.5 rounded-lg text-xs font-bold uppercase hover:bg-yellow-400 hover:text-black hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-none whitespace-nowrap">
            {user ? "Hire Staff" : "Get Started"}
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setMenuOpen(true)}
          className="lg:hidden p-2.5 border-2 border-black rounded-lg bg-yellow-400 text-black hover:bg-black hover:text-white transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center"
        >
          <Menu size={20} />
        </button>

      </nav>

      {/* Mobile Full Screen Collapse Drawer Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b-4 border-black">
            <div className={`text-2xl tracking-tighter uppercase italic ${oswald.className} flex items-center gap-2 text-black`}>
              <Image
                src="/favicon.ico"
                alt="Pixorva Logo"
                width={36}
                height={36}
                className="w-8 h-8 rounded-lg"
              />
              Pixorva
            </div>
            <button 
              onClick={() => setMenuOpen(false)}
              className="p-2 border-2 border-black rounded-lg hover:bg-gray-100 text-black"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-grow py-8 space-y-6 text-black">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Core Platform</span>
              
              <div className="space-y-4 font-bold uppercase text-sm text-black">
                <Link href="/employees" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-yellow-600 transition">
                  <Briefcase size={16} /> AI Employees Marketplace
                </Link>
                <Link href="/studio" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-yellow-600 transition">
                  <Cpu size={16} /> AI Agent Studio
                </Link>
                <Link href="/docs" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 hover:text-yellow-600 transition">
                  <FileText size={16} /> Developer Specs & Docs
                </Link>
              </div>
            </div>

            {/* General Core links */}
            <div className="space-y-4 pt-4 border-t-2 border-gray-100 font-bold uppercase text-sm text-black">
              <Link href="/pricing" onClick={() => setMenuOpen(false)} className="block hover:text-yellow-600">Pricing Plans</Link>
              <Link href="/governance" onClick={() => setMenuOpen(false)} className="block hover:text-yellow-600">Governance Console</Link>
              <Link href="/workspace" onClick={() => setMenuOpen(false)} className="block hover:text-yellow-600">Open Workspace</Link>
            </div>
          </div>

          {/* Actions at the bottom (matching photo bottom actions layout!) */}
          <div className="pt-6 border-t-4 border-black space-y-3 flex flex-col mt-auto shrink-0">
            {user ? (
              <>
                <Link href="/settings" onClick={() => setMenuOpen(false)} className="w-full text-center bg-white text-black border-4 border-black py-3.5 rounded-xl font-black uppercase text-xs hover:bg-gray-50 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2">
                  <SettingsIcon size={14} /> Profile Settings
                </Link>
                <Link href="/workspace" onClick={() => setMenuOpen(false)} className="w-full text-center bg-yellow-400 text-black border-4 border-black py-3.5 rounded-xl font-black uppercase text-xs hover:bg-black hover:text-white transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2">
                  Go to Workspace
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="w-full text-center bg-white text-black border-4 border-black py-3.5 rounded-xl font-black uppercase text-xs hover:bg-gray-50 transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center">
                  Log In
                </Link>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="w-full text-center bg-yellow-400 text-black border-4 border-black py-3.5 rounded-xl font-black uppercase text-xs hover:bg-black hover:text-white transition shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none flex items-center justify-center">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}

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
                          <AgentAvatar id={getRegistryIdByName(agent.name)} className="w-12 h-12 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" />
                          <button onClick={() => setDeletingAgentId(agent.id)} className="text-gray-300 hover:text-red-600 transition p-1">
                            <Trash2 size={18} />
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
                            Open Workstation <ArrowRight size={14} />
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
                <AgentCard id="dev-1" name="DEVON" role="React Developer" color="bg-blue-600" icon={<Code size={64} className="text-white" />} desc="Builds UI components, fixes React hooks, and Next.js projects." />
                <AgentCard id="dev-2" name="RUBY" role="Backend Architect" color="bg-green-500" icon={<Database size={64} className="text-white" />} desc="Designs database schemas and generates optimal SQL queries." />
                <AgentCard id="mkt-2" name="STELLA" role="Social Media Mgr" color="bg-orange-500" icon={<Camera size={64} className="text-white" />} desc="Drafts viral post descriptions and designs visual captures." />
                <AgentCard id="mkt-3" name="GORDON" role="SEO Blog Writer" color="bg-red-600" icon={<PenTool size={64} className="text-white" />} desc="Ranks your articles #1 on Google search using targeted keywords." />
                <CustomAgentCard />
              </div>
            </>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 bg-black text-white py-16 md:py-20 text-center overflow-hidden border-t-4 border-black">
        <div className={`absolute top-0 left-0 right-0 text-[20vw] opacity-5 font-black leading-none select-none ${oswald.className}`}>PIXORVA</div>
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <h2 className={`text-4xl md:text-7xl uppercase mb-6 ${oswald.className}`}>Ready to Scale?</h2>
          <Link href={user ? "/employees" : "/login"}>
            <button className="bg-yellow-400 text-black border-4 border-black px-10 py-4 rounded-2xl font-black uppercase hover:bg-white transition text-lg shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-y-1 w-full md:w-auto">Start Hiring (Free)</button>
          </Link>

          {/* Legal Links & Contacts */}
          <div className="mt-12 pt-10 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-8 text-left text-xs text-gray-400 font-medium">
            <div>
              <p className="text-white font-black uppercase tracking-wider text-sm mb-3">Compliance & Grievance Redressal</p>
              <p className="leading-relaxed mb-3">
                Grievance Office Email: <a href="mailto:grievance@pixorva.com" className="underline hover:text-white">grievance@pixorva.com</a> / <a href="mailto:privacy@pixorva.com" className="underline hover:text-white">privacy@pixorva.com</a>
              </p>
              <p className="leading-relaxed">
                Support Desk: <a href="mailto:support@pixorva.com" className="underline hover:text-white">support@pixorva.com</a><br />
                Legal Department: <a href="mailto:legal@pixorva.com" className="underline hover:text-white">legal@pixorva.com</a>
              </p>
            </div>
            <div className="md:text-right flex flex-col justify-between">
              <div>
                <p className="text-white font-black uppercase tracking-wider text-sm mb-3">Legal Documents</p>
                <div className="space-x-4">
                  <Link href="/terms" className="underline hover:text-white font-bold uppercase">Terms of Service</Link>
                  <Link href="/privacy" className="underline hover:text-white font-bold uppercase">Privacy Policy</Link>
                </div>
              </div>
              <p className="text-gray-600 mt-6 md:mt-0 font-mono tracking-widest uppercase">© 2026 PIXORVA INC. // SYSTEM OPERATIONAL</p>
            </div>
          </div>
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
  id: string;
  name: string;
  role: string;
  color: string;
  icon: React.ReactNode;
  desc: string;
}

function AgentCard({ id, name, role, color, icon, desc }: AgentCardProps) {
  return (
    <Link href={`/agent-detail/${name.toLowerCase()}`} className="group relative cursor-pointer block">
      <div className={`h-64 rounded-2xl border-4 border-black ${color} flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all group-hover:translate-y-1 group-hover:shadow-none overflow-hidden relative`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_black_1px,_transparent_1px)] bg-[length:10px_10px]"></div>
        <span className="relative z-10 transform transition-transform group-hover:scale-110 duration-300">{icon}</span>
        <div className="absolute bottom-4 left-4 bg-white border-2 border-black px-3 py-1 rounded-md font-black uppercase text-sm transform -rotate-2 group-hover:rotate-0 transition">{name}</div>
      </div>
      <div className="mt-4 text-left px-2">
        <h3 className="text-xl font-black uppercase leading-none">{role}</h3>
        <p className="text-sm font-medium text-gray-500 mt-1">{desc}</p>
      </div>
    </Link>
  );
}