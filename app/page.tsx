"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Oswald, Inter } from "next/font/google";
import {
  ArrowRight, Briefcase, Megaphone, PenTool, Target, Plus, Zap, Trash2, Play,
  MessageSquare, Globe, Mail, Clock, Database, Twitter, Settings as SettingsIcon,
  LogOut, Send, Code, ShieldCheck, DollarSign, User as UserIcon, Users, PieChart,
  Camera, Lock, Clipboard, Video, CheckCircle, Smartphone, Search, Menu, X
} from "lucide-react";
import { createClient } from "./utils/supabase/client";
import { User } from "@supabase/supabase-js";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [myAgents, setMyAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setLoading(true);
        const { data: agents } = await supabase
          .from("agents")
          .select("*")
          .order("created_at", { ascending: false });
        if (agents) setMyAgents(agents);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
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
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this agent?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("agents").delete().eq("id", id);
    if (error) {
      alert("Error: " + error.message);
    } else {
      setMyAgents((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div className={`${inter.className} min-h-screen bg-black text-white`}>
      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className={`${oswald.className} text-xl sm:text-2xl tracking-widest text-white`}>
            Pixorva
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-6 md:flex">
            <Link href="/marketplace" className="text-sm text-gray-400 transition hover:text-white">
              Marketplace
            </Link>
            <Link href="/pricing" className="text-sm text-gray-400 transition hover:text-white">
              Pricing
            </Link>
            <Link href="/studio" className="text-sm text-gray-400 transition hover:text-white">
              Studio
            </Link>
          </div>

          {/* Desktop right side */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <span className="text-sm text-gray-300">
                  {profile?.full_name || user.email?.split("@")[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 rounded border border-white/20 px-3 py-1.5 text-xs text-gray-400 transition hover:border-white/50 hover:text-white"
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="text-sm text-gray-400 transition hover:text-white">
                Log in
              </Link>
            )}
            <Link
              href={user ? "/marketplace" : "/get-started"}
              className="rounded bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-200"
            >
              {user ? "Hire Staff" : "Get Started"}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="rounded p-2 text-gray-400 transition hover:text-white md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-black/95 px-4 pb-4 pt-2 md:hidden">
            <div className="flex flex-col gap-3">
              <Link href="/marketplace" className="py-2 text-sm text-gray-400" onClick={() => setMobileMenuOpen(false)}>Marketplace</Link>
              <Link href="/pricing" className="py-2 text-sm text-gray-400" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <Link href="/studio" className="py-2 text-sm text-gray-400" onClick={() => setMobileMenuOpen(false)}>Studio</Link>
              <hr className="border-white/10" />
              {user ? (
                <>
                  <span className="py-1 text-sm text-gray-300">{profile?.full_name || user.email?.split("@")[0]}</span>
                  <button onClick={handleSignOut} className="flex items-center gap-2 py-2 text-sm text-red-400">
                    <LogOut size={14} /> Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" className="py-2 text-sm text-gray-400" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
              )}
              <Link
                href={user ? "/marketplace" : "/get-started"}
                className="mt-1 rounded bg-white py-2.5 text-center text-sm font-semibold text-black"
                onClick={() => setMobileMenuOpen(false)}
              >
                {user ? "Hire Staff" : "Get Started"}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO / DASHBOARD ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        {/* Headline */}
        <div className="mb-8 max-w-3xl sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
            {user ? `Welcome Back, ${profile?.full_name?.split(" ")[0] || "Boss"}` : "The Future of Work is Here"}
          </p>
          <h1 className={`${oswald.className} text-4xl leading-none tracking-tight sm:text-5xl lg:text-7xl`}>
            {user ? "Manage Your" : "Hire your next"}{" "}
            <span className="text-white/30">{user ? "Workforce." : "AI Employee."}</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-gray-400 sm:text-base">
            {user
              ? "Your digital workforce is running 24/7. Assign tasks below."
              : "Get an AI Team who runs your inbox, socials, SEO, lead generation, calls, and support. No sick days. No drama."}
          </p>
        </div>

        {/* CTA buttons */}
        <div className="mb-12 flex flex-wrap gap-3 sm:mb-16">
          <Link
            href={user ? "/marketplace" : "/marketplace"}
            className="flex items-center gap-2 rounded bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-100 sm:px-6"
          >
            {user ? "Hire New Staff" : "Browse Marketplace"}
            <ArrowRight size={16} />
          </Link>
          {user && (
            <Link
              href="/studio"
              className="flex items-center gap-2 rounded border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/50 sm:px-6"
            >
              <Plus size={16} />
              Build Custom
            </Link>
          )}
        </div>

        {/* ── DYNAMIC AGENT GRID ── */}
        {user ? (
          <div>
            {/* Section header */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className={`${oswald.className} text-xl tracking-wide sm:text-2xl`}>
                My Active Team
              </h2>
              <span className="flex items-center gap-1.5 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-xs text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                {myAgents.length} Running
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 text-sm text-gray-500">
                Syncing with Mainframe...
              </div>
            ) : myAgents.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-white/10 px-6 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <Users size={20} className="text-gray-500" />
                </div>
                <div>
                  <p className="font-semibold text-white">Your office is empty!</p>
                  <p className="mt-1 text-sm text-gray-500">
                    You haven&apos;t hired anyone yet. Visit the Marketplace to hire Devon, Ruby, Lawson, and more.
                  </p>
                </div>
                <Link
                  href="/marketplace"
                  className="flex items-center gap-2 rounded bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-100"
                >
                  Go to Marketplace <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              /* Agent grid — 1 col mobile, 2 sm, 3 lg */
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className="group relative flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/8"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
                        {getIcon(agent.steps?.[0]?.icon || agent.icon || "Zap")}
                      </div>
                      <button
                        onClick={() => handleDelete(agent.id)}
                        className="rounded p-1 text-gray-600 transition hover:text-red-500"
                        aria-label="Delete agent"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Name */}
                    <div>
                      <p className="font-semibold leading-tight text-white">
                        {agent.name.split("(")[0].trim()}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {agent.name.split("(")[1]?.replace(")", "") || "Custom Agent"}
                      </p>
                    </div>

                    {/* Status + skills */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1 text-green-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> Online
                      </span>
                      <span>{agent.steps?.length || 0} Skills</span>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/agent/${agent.id}`}
                      className="mt-auto flex items-center gap-1 text-xs font-semibold text-white/60 transition hover:text-white"
                    >
                      Open Workstation <ArrowRight size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ── LOGGED OUT VIEW ── */
          <div>
            <div className="mb-8 flex items-center justify-between">
              <h2 className={`${oswald.className} text-xl tracking-wide sm:text-2xl`}>
                Meet Your Team
              </h2>
              <Link href="/marketplace" className="text-xs text-gray-500 underline-offset-2 hover:underline">
                View Marketplace
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AgentCard name="Devon" role="Executive Assistant" color="blue" icon={<Briefcase size={20} />} desc="Manages your calendar & inbox." />
              <AgentCard name="Ruby" role="Social Media Manager" color="pink" icon={<Megaphone size={20} />} desc="Writes & posts viral content." />
              <AgentCard name="Lawson" role="SEO Specialist" color="green" icon={<PenTool size={20} />} desc="Ranks your blog #1 on Google." />
              <AgentCard name="Aria" role="Sales Development Rep" color="orange" icon={<Target size={20} />} desc="Finds & closes new clients." />
            </div>
          </div>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer className="mt-auto border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <span className={`${oswald.className} text-lg tracking-widest text-white`}>PIXORVA</span>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
              <p className="text-xs text-gray-600">Ready to Scale?</p>
              <Link
                href="/get-started"
                className="rounded bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-gray-200"
              >
                Start Hiring (Free)
              </Link>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-gray-700">
            © 2026 PIXORVA INC. // SYSTEM OPERATIONAL
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── HELPERS ──

function getIcon(name: string) {
  const cls = "w-4 h-4";
  switch (name) {
    case "Code": return <Code className={cls} />;
    case "Megaphone": return <Megaphone className={cls} />;
    case "DollarSign": return <DollarSign className={cls} />;
    case "ShieldCheck": return <ShieldCheck className={cls} />;
    case "User": return <UserIcon className={cls} />;
    case "Mail": return <Mail className={cls} />;
    case "Send": return <Send className={cls} />;
    case "MessageSquare": return <MessageSquare className={cls} />;
    case "Play": return <Play className={cls} />;
    case "Globe": return <Globe className={cls} />;
    case "Clock": return <Clock className={cls} />;
    case "Database": return <Database className={cls} />;
    case "Twitter": return <Twitter className={cls} />;
    case "PenTool": return <PenTool className={cls} />;
    case "Target": return <Target className={cls} />;
    case "Briefcase": return <Briefcase className={cls} />;
    case "Users": return <Users className={cls} />;
    case "PieChart": return <PieChart className={cls} />;
    case "Camera": return <Camera className={cls} />;
    case "Lock": return <Lock className={cls} />;
    case "Clipboard": return <Clipboard className={cls} />;
    case "Video": return <Video className={cls} />;
    case "CheckCircle": return <CheckCircle className={cls} />;
    case "Smartphone": return <Smartphone className={cls} />;
    case "Search": return <Search className={cls} />;
    default: return <Zap className={cls} />;
  }
}

function AgentCard({ name, role, color, icon, desc }: {
  name: string; role: string; color: string; icon: React.ReactNode; desc: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };

  return (
    <div className="group flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-white/20">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${colorMap[color] || "bg-white/10 text-white border-white/10"}`}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-white">{name}</p>
        <p className="text-xs text-gray-500">{role}</p>
      </div>
      <p className="text-sm leading-relaxed text-gray-400">{desc}</p>
      <Link
        href="/marketplace"
        className="mt-auto flex items-center gap-1 text-xs font-semibold text-white/40 transition hover:text-white"
      >
        Hire {name} <ArrowRight size={12} />
      </Link>
    </div>
  );
}