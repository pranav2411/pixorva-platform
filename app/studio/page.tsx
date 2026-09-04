"use client";

import React, { useState } from "react";
import { Oswald, Inter } from "next/font/google";
// FIXED: Added 'Target' to the imports below
import { 
  ArrowLeft, Save, Bot, Zap, Code, Terminal, Shield, 
  Megaphone, DollarSign, PenTool, Brain, CheckCircle, Target, X, Loader2 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { showToast } from '../utils/Toast';
import { triggerRazorpayCheckout } from '../utils/RazorpayCheckout';
import BackButton from '../components/BackButton';

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function StudioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // --- FORM STATE ---
  const [name, setName] = useState("");
  const [role, setRole] = useState(""); // e.g., "Python Expert"
  const [goal, setGoal] = useState(""); // e.g., "Write clean code"
  const [instructions, setInstructions] = useState(""); // The Brain
  const [icon, setIcon] = useState("Bot");

  // Custom Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'trial' | 'hire_option' | 'success';
    successMessage?: string;
  }>({ isOpen: false, type: 'trial' });
  const [modalLoading, setModalLoading] = useState(false);
  const [slotCount, setSlotCount] = useState(0);

  // --- PRESETS ---
  const applyPreset = (preset: string) => {
      if (preset === 'coder') {
          setName("Ruby");
          setRole("Senior Engineer");
          setGoal("Write bug-free code");
          setInstructions("You are a Senior Software Engineer. Always return clean, commented code. If asked for a UI, return HTML/Tailwind.");
          setIcon("Code");
      }
      if (preset === 'writer') {
          setName("Stella");
          setRole("Viral Ghostwriter");
          setGoal("Grow Twitter audience");
          setInstructions("You are a viral content creator. Write punchy, engaging hooks. Use short sentences and no fluff.");
          setIcon("PenTool");
      }
      if (preset === 'negotiator') {
          setName("Marcus");
          setRole("Salary Negotiator");
          setGoal("Maximize offers");
          setInstructions("You are a tough negotiator. Help the user reply to job offers to get a higher salary. Be polite but firm.");
          setIcon("DollarSign");
      }
      if (preset === 'github_resolver') {
          setName("OctoFixer");
          setRole("QA & Bug Fixer");
          setGoal("Resolve repository bugs & draft PRs");
          setInstructions("You are a QA Engineer. Read files, scan repositories, fix bug tickets, write unit tests, and draft code updates/Pull Requests.");
          setIcon("Lock");
      }
      if (preset === 'ads_manager') {
          setName("AdPulse");
          setRole("Marketing Specialist");
          setGoal("Optimize ad conversions");
          setInstructions("You are a Marketing Copywriter. Design audience targeting segments, draft viral headlines, and write conversion-optimized copy.");
          setIcon("Megaphone");
      }
      if (preset === 'retention_bot') {
          setName("LoyaltyGuard");
          setRole("Customer Success");
          setGoal("Minimize customer churn");
          setInstructions("You are a Customer Success Expert. Analyze customer friction points, offer targeted rewards, write email apologies, and resolve retention issues.");
          setIcon("Shield");
      }
  };

  const handleConfirmTrial = async () => {
    setModalLoading(true);
    const supabase = createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }
        
        // Provision the custom agent directly in Supabase
        const { data: newAgent, error: agentError } = await supabase
            .from('agents')
            .insert({
                user_id: user.id,
                name: `${name} (${role})`,
                goal: goal,
                instructions: instructions,
                icon: icon,
                schedule: 'Manual',
                steps: [{ name: "Custom Logic", icon: "Brain" }],
                is_paid_individually: false
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

        setConfirmModal({
            isOpen: true,
            type: 'success',
            successMessage: `🎉 Success! Your custom agent ${name} has been deployed under your 3-day free trial.`
        });
    } catch (e: any) {
        showToast("Activation failed: " + e.message, "error");
    } finally {
        setModalLoading(false);
    }
  };

  const handleConfirmPaidUpgrade = async () => {
    setModalLoading(true);
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        // Price is ₹999/mo (99900 paise)
        const parsedAmount = 999 * 100;

        await triggerRazorpayCheckout({
          userId: user.id,
          agentName: `${name} (${role})`,
          icon: icon,
          steps: [{ name: "Custom Logic", icon: "Brain" }],
          amount: parsedAmount,
          email: user.email || "",
          isSubscription: true,
          onSuccess: () => {
            setConfirmModal({ isOpen: false, type: 'trial' });
            router.push("/workspace");
          },
          onFailure: () => {
            setModalLoading(false);
          }
        });
    } catch (e: any) {
        showToast("Deploy failed: " + e.message, "error");
        setModalLoading(false);
    }
  };

  const handleConfirmPlanHire = async () => {
    setModalLoading(true);
    const supabase = createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        // Check count
        const { count, error: countError } = await supabase
            .from('agents')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_paid_individually', false);

        if (countError) throw countError;

        if (count !== null && count >= 4) {
            showToast("Your 4 subscription slots are full. Please purchase individually or upgrade.", "error");
            return;
        }

        const { error: agentError } = await supabase
            .from('agents')
            .insert({
                user_id: user.id,
                name: `${name} (${role})`,
                goal: goal,
                instructions: instructions,
                icon: icon,
                schedule: 'Manual',
                steps: [{ name: "Custom Logic", icon: "Brain" }],
                is_paid_individually: false
            });

        if (agentError) throw agentError;
        
        setConfirmModal({
            isOpen: true,
            type: 'success',
            successMessage: `🎉 Success! Your custom agent ${name} has been deployed under your Growth Pro Plan.`
        });
    } catch (e: any) {
        showToast("Deploy failed: " + e.message, "error");
    } finally {
        setModalLoading(false);
    }
  };

  // --- DEPLOY AGENT ---
  const handleDeploy = async () => {
    if (!name || !role || !instructions) {
        showToast("Please give your agent a Name, Role, and Instructions.", "error");
        return;
    }

    const supabase = createClient();
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        // Check plan and trial status
        const { data: profile } = await supabase
            .from('profiles')
            .select('trial_started_at, trial_ends_at, trial_agent_id, plan')
            .eq('id', user.id)
            .single();

        const plan = profile?.plan || 'free';

        // 1. Enterprise: Free deploy immediately
        if (plan === 'enterprise') {
            setLoading(true);
            const { error: agentError } = await supabase
                .from('agents')
                .insert({
                    user_id: user.id,
                    name: `${name} (${role})`,
                    goal: goal,
                    instructions: instructions,
                    icon: icon,
                    schedule: 'Manual',
                    steps: [{ name: "Custom Logic", icon: "Brain" }],
                    is_paid_individually: false
                });

            if (agentError) throw agentError;

            setConfirmModal({
                isOpen: true,
                type: 'success',
                successMessage: `🎉 Success! Your custom agent ${name} has been deployed under your Enterprise Plan.`
            });
            setLoading(false);
            return;
        }

        // 2. Growth Pro Plan: Show Hire Options Modal
        if (plan === 'growth_pro') {
            const { count, error: countError } = await supabase
                .from('agents')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_paid_individually', false);

            if (countError) throw countError;
            
            setSlotCount(count || 0);
            setConfirmModal({ isOpen: true, type: 'hire_option' });
            return;
        }

        // 3. Free Tier (Check Trial Status)
        const isTrialActive = profile?.trial_ends_at && new Date() < new Date(profile.trial_ends_at);
        const hasChosenTrialAgent = profile?.trial_agent_id !== null;

        if (isTrialActive && !hasChosenTrialAgent) {
            setConfirmModal({ isOpen: true, type: 'trial' });
            return;
        }

        // Otherwise, redirect to Razorpay checkout directly for standard paid purchase of 999 INR
        setLoading(true);
        const parsedAmount = 999 * 100;

        await triggerRazorpayCheckout({
          userId: user.id,
          agentName: `${name} (${role})`,
          icon: icon,
          steps: [{ name: "Custom Logic", icon: "Brain" }],
          amount: parsedAmount,
          email: user.email || "",
          isSubscription: true,
          onSuccess: () => {
            setLoading(false);
            router.push("/workspace");
          },
          onFailure: () => {
            setLoading(false);
          }
        });

    } catch (e: any) {
        showToast("Deploy failed: " + e.message, "error");
        setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#0e0f12] text-white ${inter.className} flex flex-col selection:bg-[#ffc700] selection:text-black`}>
      
      {/* EXPANDED MARGINAL NAVBAR */}
      <header className="bg-[#141519]/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-md">
        <div className="w-full px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton
              fallback="/workspace"
              iconSize={18}
              className="bg-black text-white p-2.5 rounded-xl border border-white/20 hover:bg-[#ffc700] hover:text-black hover:border-black transition shadow-sm flex items-center justify-center shrink-0"
            />
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/favicon.ico"
                alt="Pixorva Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg group-hover:scale-105 transition"
              />
              <span className={`text-2xl md:text-3xl font-black uppercase tracking-wider text-white ${oswald.className}`}>
                Pixorva
              </span>
            </Link>
            <span className="text-neutral-600 text-xl hidden sm:inline">/</span>
            <span className={`text-lg md:text-xl uppercase tracking-wide text-neutral-200 hidden sm:inline ${oswald.className}`}>
              Agent Studio
            </span>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href="/workspace"
              className="text-xs md:text-sm font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition px-3.5 py-2 rounded-xl hover:bg-white/5"
            >
              Workspace
            </Link>
            <Link
              href="/employees"
              className="text-xs md:text-sm font-black uppercase tracking-wider bg-[#ffc700] text-black px-5 py-2.5 rounded-xl hover:bg-white transition shadow-md"
            >
              Marketplace
            </Link>
          </div>
        </div>
      </header>

      {/* BODY SPLIT: BUILDER & LIVE PREVIEW */}
      <div className="flex-grow flex flex-col md:flex-row">
        
        {/* LEFT: BUILDER FORM */}
        <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto md:h-[calc(100vh-73px)] bg-[#141519] border-r border-white/10 text-white">
            
            <div className="mb-8">
                <h1 className={`text-4xl md:text-5xl uppercase leading-none text-white ${oswald.className}`}>Agent Studio</h1>
                <p className="text-neutral-400 font-medium text-sm mt-2">Design and configure a custom AI employee from scratch.</p>
            </div>

            {/* PRESETS */}
            <div className="mb-10">
                <label className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-3 block">Quick Start Templates</label>
                <div className="grid grid-cols-2 gap-3.5">
                    <button 
                      onClick={() => applyPreset('coder')} 
                      className="p-4 bg-[#181a24] hover:bg-[#1e2130] text-left border-2 border-blue-500/40 hover:border-blue-400 rounded-2xl transition flex flex-col gap-1.5 shadow-sm group"
                    >
                      <span className="text-xs font-black uppercase tracking-wider text-blue-400 group-hover:text-blue-300">Code Expert</span>
                      <span className="text-xs font-semibold text-neutral-200 normal-case leading-snug">Write & debug clean code.</span>
                    </button>
                    <button 
                      onClick={() => applyPreset('writer')} 
                      className="p-4 bg-[#14231c] hover:bg-[#192f24] text-left border-2 border-emerald-500/40 hover:border-emerald-400 rounded-2xl transition flex flex-col gap-1.5 shadow-sm group"
                    >
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-400 group-hover:text-emerald-300">Viral Writer</span>
                      <span className="text-xs font-semibold text-neutral-200 normal-case leading-snug">Punchy hook writer.</span>
                    </button>
                    <button 
                      onClick={() => applyPreset('negotiator')} 
                      className="p-4 bg-[#231f14] hover:bg-[#2e2819] text-left border-2 border-amber-500/40 hover:border-amber-400 rounded-2xl transition flex flex-col gap-1.5 shadow-sm group"
                    >
                      <span className="text-xs font-black uppercase tracking-wider text-[#ffc700] group-hover:text-yellow-300">Negotiator</span>
                      <span className="text-xs font-semibold text-neutral-200 normal-case leading-snug">Tough offer negotiations.</span>
                    </button>
                    <button 
                      onClick={() => applyPreset('github_resolver')} 
                      className="p-4 bg-[#191928] hover:bg-[#202035] text-left border-2 border-indigo-500/40 hover:border-indigo-400 rounded-2xl transition flex flex-col gap-1.5 shadow-sm group"
                    >
                      <span className="text-xs font-black uppercase tracking-wider text-indigo-400 group-hover:text-indigo-300">QA OctoFixer</span>
                      <span className="text-xs font-semibold text-neutral-200 normal-case leading-snug">Resolve repo bugs & PRs.</span>
                    </button>
                    <button 
                      onClick={() => applyPreset('ads_manager')} 
                      className="p-4 bg-[#241a14] hover:bg-[#302219] text-left border-2 border-orange-500/40 hover:border-orange-400 rounded-2xl transition flex flex-col gap-1.5 shadow-sm group"
                    >
                      <span className="text-xs font-black uppercase tracking-wider text-orange-400 group-hover:text-orange-300">AdPulse Marketing</span>
                      <span className="text-xs font-semibold text-neutral-200 normal-case leading-snug">Ad conversions copy.</span>
                    </button>
                    <button 
                      onClick={() => applyPreset('retention_bot')} 
                      className="p-4 bg-[#25151a] hover:bg-[#321c23] text-left border-2 border-rose-500/40 hover:border-rose-400 rounded-2xl transition flex flex-col gap-1.5 shadow-sm group"
                    >
                      <span className="text-xs font-black uppercase tracking-wider text-rose-400 group-hover:text-rose-300">LoyaltyGuard CS</span>
                      <span className="text-xs font-semibold text-neutral-200 normal-case leading-snug">Mitigate churn friction.</span>
                    </button>
                </div>
            </div>

            {/* FORM */}
            <div className="space-y-6">
                
                {/* Identity */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-2">Name</label>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Jarvis" 
                          className="w-full p-3 bg-[#1a1b22] border border-white/15 rounded-xl text-white placeholder-neutral-500 focus:border-[#ffc700] focus:ring-0 transition font-bold text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-2">Role Title</label>
                        <input 
                          type="text" 
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          placeholder="e.g. Personal Assistant" 
                          className="w-full p-3 bg-[#1a1b22] border border-white/15 rounded-xl text-white placeholder-neutral-500 focus:border-[#ffc700] focus:ring-0 transition font-bold text-sm"
                        />
                    </div>
                </div>

                {/* Icon Selection */}
                <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-2">Select Appearance</label>
                    <div className="flex gap-2.5 flex-wrap">
                        {["Bot", "Zap", "Code", "Terminal", "Shield", "Megaphone", "DollarSign", "PenTool", "Brain"].map((ic) => (
                            <button 
                              key={ic}
                              onClick={() => setIcon(ic)}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                                icon === ic 
                                  ? 'bg-[#ffc700] text-black border-2 border-[#ffc700] shadow-[2px_2px_0px_0px_rgba(255,199,0,0.4)]' 
                                  : 'bg-[#1a1b22] text-neutral-400 border border-white/15 hover:border-white/40 hover:text-white'
                              }`}
                            >
                                {getIcon(ic)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Goal */}
                <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-2">Primary Goal</label>
                    <input 
                      type="text" 
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="What is the main purpose of this agent?" 
                      className="w-full p-3 bg-[#1a1b22] border border-white/15 rounded-xl text-white placeholder-neutral-500 focus:border-[#ffc700] focus:ring-0 transition font-medium text-sm"
                    />
                </div>

                {/* THE BRAIN (System Prompt) */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-neutral-300">System Instructions (The Brain)</label>
                      <span className="text-[10px] bg-[#ffc700]/15 text-[#ffc700] border border-[#ffc700]/30 px-2.5 py-0.5 rounded-full font-bold uppercase">Critical</span>
                    </div>
                    <textarea 
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="You are an expert in... Always answer with... Never do..." 
                      className="w-full h-40 p-4 bg-black text-green-400 font-mono text-sm rounded-xl border border-white/15 focus:border-[#ffc700] focus:ring-1 focus:ring-[#ffc700] resize-none"
                    ></textarea>
                    <p className="text-xs text-neutral-500 mt-2">This defines how the AI agent thinks, processes context, and executes workflows.</p>
                </div>

            </div>

        </div>

        {/* RIGHT: LIVE PREVIEW WITH SUBTLE CINEMATIC VIDEO BACKGROUND */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 relative overflow-hidden min-h-[600px] md:min-h-0 md:h-[calc(100vh-73px)] bg-[#0a0a0c]">
            
            {/* Background Video with decreased intensity */}
            <video 
              src="/studio-bg.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-30"
            />
            {/* Deep dark gradient overlay so video is ambient and atmospheric */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0e0f12]/80 via-[#0e0f12]/60 to-[#0e0f12]/90 backdrop-blur-[1px] z-0" />

            {/* Preview Mode Pill */}
            <div className="absolute top-6 right-6 z-10">
                <div className="bg-[#141519]/80 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ffc700] animate-pulse"></span>
                    Preview Mode
                </div>
            </div>

            {/* CARD PREVIEW */}
            <div className="relative z-10 w-full max-w-sm bg-white border-4 border-black rounded-3xl p-8 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] transform transition hover:-translate-y-1 duration-300">
                <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center border-2 border-black">
                        {getIcon(icon)}
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded border border-green-200 text-[10px] font-bold uppercase">
                        New Hire
                    </div>
                </div>

                <h2 className={`text-3xl uppercase leading-none mb-1 text-black ${oswald.className}`}>{name || "Agent Name"}</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">{role || "Role Title"}</p>

                <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                        <Target size={18} className="text-black"/> 
                        {goal || "Define a goal..."}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                        <Zap size={18} className="text-black"/> 
                        Manual Schedule
                    </div>
                </div>

                <button 
                  onClick={handleDeploy}
                  disabled={loading}
                  className="w-full bg-[#ffc700] text-black border-4 border-black py-4 rounded-xl font-black uppercase tracking-wide hover:bg-black hover:text-white transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1"
                >
                    {loading ? <><Loader2 className="animate-spin" size={18}/> Deploying...</> : <><Save size={20}/> Deploy Agent</>}
                </button>
            </div>

            <p className="relative z-10 mt-8 text-white/90 text-xs font-black uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Ready to bring {name || "this agent"} to life?
            </p>

        </div>

      </div>

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#141519] border border-white/20 p-8 rounded-3xl max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center relative text-white">
                {confirmModal.type !== 'success' && (
                    <button 
                      disabled={modalLoading}
                      onClick={() => setConfirmModal({ isOpen: false, type: 'trial' })} 
                      className="absolute right-4 top-4 text-neutral-400 hover:text-white transition disabled:opacity-50"
                    >
                        <X size={24} />
                    </button>
                )}

                <div className="mb-6 flex justify-center">
                    <div className={`${confirmModal.type === 'success' ? 'bg-emerald-400' : 'bg-[#ffc700]'} p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black`}>
                        {confirmModal.type === 'success' ? (
                            <CheckCircle size={36} strokeWidth={3} className="text-black" />
                        ) : (
                            <Zap size={36} fill="black" />
                        )}
                    </div>
                </div>

                <h3 className={`text-3xl uppercase mb-3 text-white ${oswald.className}`}>
                    {confirmModal.type === 'success' 
                        ? 'Deployed Successfully!' 
                        : confirmModal.type === 'trial' 
                        ? 'Start Free Trial' 
                        : 'Deploy Option'}
                </h3>

                <div className="text-sm font-semibold text-neutral-300 mb-8 leading-relaxed">
                    {confirmModal.type === 'success' ? (
                        <p className="text-base text-white font-bold">{confirmModal.successMessage}</p>
                    ) : confirmModal.type === 'trial' ? (
                        <>Would you like to use your one-time <strong className="text-[#ffc700]">3-day Free Trial</strong> to deploy <strong className="text-white">{name}</strong> for free?</>
                    ) : (
                        <>
                            Choose how you would like to deploy <strong className="text-white">{name}</strong>:
                        </>
                    )}
                </div>

                <div className="flex flex-col gap-3">
                    {confirmModal.type === 'success' ? (
                        <button 
                          onClick={() => {
                              setConfirmModal({ isOpen: false, type: 'trial' });
                              router.push("/");
                          }}
                          className="w-full bg-[#ffc700] text-black hover:bg-white py-4 rounded-xl font-black uppercase text-sm tracking-wider transition shadow-md"
                        >
                            Go to Dashboard
                        </button>
                    ) : confirmModal.type === 'trial' ? (
                        <>
                            <button 
                              disabled={modalLoading}
                              onClick={handleConfirmTrial}
                              className="w-full bg-[#ffc700] text-black hover:bg-white py-4 rounded-xl font-black uppercase text-sm tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {modalLoading ? <Loader2 className="animate-spin" size={16} /> : 'Deploy using Free Trial'}
                            </button>
                            <button 
                              disabled={modalLoading}
                              onClick={handleConfirmPaidUpgrade}
                              className="w-full bg-white text-black hover:bg-[#ffc700] py-4 rounded-xl font-black uppercase text-sm tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {modalLoading ? <Loader2 className="animate-spin" size={16} /> : 'Purchase Individually (₹999/mo)'}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Option 1: Use Plan Slot */}
                            <div className="w-full">
                                <button 
                                  disabled={modalLoading || slotCount >= 4}
                                  onClick={handleConfirmPlanHire}
                                  className="w-full bg-[#ffc700] text-black hover:bg-white py-4 rounded-xl font-black uppercase text-sm tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-40 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:border-neutral-700"
                                >
                                    {modalLoading ? <Loader2 className="animate-spin" size={16} /> : 'Add to Plan (Free Slot)'}
                                </button>
                                <p className="text-[10px] text-neutral-400 font-bold mt-1.5 uppercase">
                                    {slotCount >= 4 
                                        ? 'All 4 plan slots used. Upgrade or buy one-off.' 
                                        : `Plan slots used: ${slotCount} / 4`}
                                </p>
                            </div>

                            {/* Option 2: Purchase Individually */}
                            <div className="w-full mt-2">
                                <button 
                                  disabled={modalLoading}
                                  onClick={handleConfirmPaidUpgrade}
                                  className="w-full bg-white text-black hover:bg-[#ffc700] py-4 rounded-xl font-black uppercase text-sm tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {modalLoading ? <Loader2 className="animate-spin" size={16} /> : 'Purchase Individually (₹999/mo)'}
                                </button>
                                <p className="text-[10px] text-neutral-500 font-bold mt-1.5 uppercase">
                                    Keep your plan slots open for other agents
                                </p>
                            </div>
                        </>
                    )}

                    {confirmModal.type !== 'success' && (
                        <button 
                          disabled={modalLoading}
                          onClick={() => setConfirmModal({ isOpen: false, type: 'trial' })}
                          className="w-full text-neutral-400 hover:text-rose-400 py-2 font-bold uppercase text-xs tracking-wider transition disabled:opacity-50 mt-2"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

// Icon Helper
function getIcon(name: string) {
    const props = { size: 24, strokeWidth: 2.5 };
    switch(name) {
        case "Code": return <Code {...props} />;
        case "Megaphone": return <Megaphone {...props} />;
        case "DollarSign": return <DollarSign {...props} />;
        case "Shield": return <Shield {...props} />;
        case "Terminal": return <Terminal {...props} />;
        case "PenTool": return <PenTool {...props} />;
        case "Brain": return <Brain {...props} />;
        case "Zap": return <Zap {...props} />;
        default: return <Bot {...props} />;
    }
}