"use client";

import React, { useState } from "react";
import { Oswald, Inter } from "next/font/google";
// FIXED: Added 'Target' to the imports below
import { 
  ArrowLeft, Save, Bot, Zap, Code, Terminal, Shield, 
  Megaphone, DollarSign, PenTool, Brain, Sparkles, CheckCircle, Target, X, Loader2 
} from "lucide-react";
import Link from "next/link";
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { showToast } from '../utils/Toast';
import { triggerRazorpayCheckout } from '../utils/RazorpayCheckout';

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
    <div className={`min-h-screen bg-gray-50 text-black ${inter.className} flex flex-col md:flex-row`}>
      
      {/* LEFT: BUILDER FORM */}
      <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto h-screen bg-white border-r border-gray-200">
          
          <div className="mb-8">
              <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-black font-bold text-sm mb-6"><ArrowLeft size={16}/> Back to Dashboard</Link>
              <h1 className={`text-5xl uppercase leading-none mb-2 ${oswald.className}`}>Agent Studio</h1>
              <p className="text-gray-500 font-medium">Design a custom AI employee from scratch.</p>
          </div>

          {/* PRESETS */}
          <div className="mb-10">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 block">Quick Start Templates</label>
              <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => applyPreset('coder')} 
                    className="p-3 bg-blue-50 text-blue-800 border-2 border-blue-200 rounded-xl text-[10px] font-black uppercase text-left hover:bg-blue-100 hover:border-black transition flex flex-col gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none"
                  >
                    <span>Code Expert</span>
                    <span className="text-[8px] text-blue-600 font-medium normal-case">Write & debug clean code.</span>
                  </button>
                  <button 
                    onClick={() => applyPreset('writer')} 
                    className="p-3 bg-green-50 text-green-800 border-2 border-green-200 rounded-xl text-[10px] font-black uppercase text-left hover:bg-green-100 hover:border-black transition flex flex-col gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none"
                  >
                    <span>Viral Writer</span>
                    <span className="text-[8px] text-green-600 font-medium normal-case">Punchy hook writer.</span>
                  </button>
                  <button 
                    onClick={() => applyPreset('negotiator')} 
                    className="p-3 bg-yellow-50 text-yellow-800 border-2 border-yellow-200 rounded-xl text-[10px] font-black uppercase text-left hover:bg-yellow-100 hover:border-black transition flex flex-col gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none"
                  >
                    <span>Negotiator</span>
                    <span className="text-[8px] text-yellow-600 font-medium normal-case">Tough offer negotiations.</span>
                  </button>
                  <button 
                    onClick={() => applyPreset('github_resolver')} 
                    className="p-3 bg-indigo-50 text-indigo-800 border-2 border-indigo-200 rounded-xl text-[10px] font-black uppercase text-left hover:bg-indigo-100 hover:border-black transition flex flex-col gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none"
                  >
                    <span>QA OctoFixer</span>
                    <span className="text-[8px] text-indigo-600 font-medium normal-case">Resolve repo bugs & PRs.</span>
                  </button>
                  <button 
                    onClick={() => applyPreset('ads_manager')} 
                    className="p-3 bg-orange-50 text-orange-800 border-2 border-orange-200 rounded-xl text-[10px] font-black uppercase text-left hover:bg-orange-100 hover:border-black transition flex flex-col gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none"
                  >
                    <span>AdPulse Marketing</span>
                    <span className="text-[8px] text-orange-600 font-medium normal-case">Ad conversions copy.</span>
                  </button>
                  <button 
                    onClick={() => applyPreset('retention_bot')} 
                    className="p-3 bg-red-50 text-red-800 border-2 border-red-200 rounded-xl text-[10px] font-black uppercase text-left hover:bg-red-100 hover:border-black transition flex flex-col gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none"
                  >
                    <span>LoyaltyGuard CS</span>
                    <span className="text-[8px] text-red-600 font-medium normal-case">Mitigate churn friction.</span>
                  </button>
              </div>
          </div>

          {/* FORM */}
          <div className="space-y-6">
              
              {/* Identity */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-bold mb-2">Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Jarvis" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-black focus:ring-0 transition font-bold"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold mb-2">Role Title</label>
                      <input 
                        type="text" 
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Personal Assistant" 
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-black focus:ring-0 transition font-bold"
                      />
                  </div>
              </div>

              {/* Icon Selection */}
              <div>
                  <label className="block text-sm font-bold mb-2">Select Appearance</label>
                  <div className="flex gap-2 flex-wrap">
                      {["Bot", "Zap", "Code", "Terminal", "Shield", "Megaphone", "DollarSign", "PenTool", "Brain"].map((ic) => (
                          <button 
                            key={ic}
                            onClick={() => setIcon(ic)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition ${icon === ic ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-200 hover:border-black'}`}
                          >
                              {getIcon(ic)}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Goal */}
              <div>
                  <label className="block text-sm font-bold mb-2">Primary Goal</label>
                  <input 
                    type="text" 
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="What is the main purpose of this agent?" 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-black focus:ring-0 transition font-medium text-sm"
                  />
              </div>

              {/* THE BRAIN (System Prompt) */}
              <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold">System Instructions (The Brain)</label>
                    <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold uppercase">Critical</span>
                  </div>
                  <textarea 
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="You are an expert in... Always answer with... Never do..." 
                    className="w-full h-40 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-xl border-none focus:ring-2 focus:ring-yellow-400 resize-none"
                  ></textarea>
                  <p className="text-xs text-gray-400 mt-2">This defines how the AI thinks, speaks, and behaves.</p>
              </div>

          </div>

      </div>

      {/* RIGHT: LIVE PREVIEW */}
      <div className="w-full md:w-1/2 bg-gray-100 flex flex-col items-center justify-center p-8 relative">
          
          <div className="absolute top-8 right-8">
              <div className="bg-white px-4 py-2 rounded-full text-xs font-bold shadow-sm flex items-center gap-2">
                  <Sparkles size={14} className="text-yellow-500"/> Preview Mode
              </div>
          </div>

          {/* CARD PREVIEW */}
          <div className="w-full max-w-sm bg-white border-4 border-black rounded-3xl p-8 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] transform transition hover:-translate-y-1 duration-300">
              <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center border-2 border-black">
                      {getIcon(icon)}
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded border border-green-200 text-[10px] font-bold uppercase">
                      New Hire
                  </div>
              </div>

              <h2 className={`text-3xl uppercase leading-none mb-1 ${oswald.className}`}>{name || "Agent Name"}</h2>
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
                className="w-full bg-yellow-400 text-black border-4 border-black py-4 rounded-xl font-black uppercase tracking-wide hover:bg-white transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                  {loading ? <><Sparkles className="animate-spin"/> Deploying...</> : <><Save size={20}/> Deploy Agent</>}
              </button>
          </div>

          <p className="mt-8 text-gray-400 text-xs font-bold uppercase tracking-widest">
              Ready to bring {name || "this agent"} to life?
          </p>

      </div>

      {/* CUSTOM NEOBRUTALIST CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black p-8 rounded-3xl max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200 text-center relative">
                {confirmModal.type !== 'success' && (
                    <button 
                      disabled={modalLoading}
                      onClick={() => setConfirmModal({ isOpen: false, type: 'trial' })} 
                      className="absolute right-4 top-4 text-gray-400 hover:text-black transition disabled:opacity-50"
                    >
                        <X size={24} />
                    </button>
                )}

                <div className="mb-6 flex justify-center">
                    <div className={`${confirmModal.type === 'success' ? 'bg-green-400' : 'bg-yellow-400'} p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black`}>
                        {confirmModal.type === 'success' ? (
                            <CheckCircle size={36} strokeWidth={3} className="text-black" />
                        ) : (
                            <Zap size={36} fill="black" />
                        )}
                    </div>
                </div>

                <h3 className={`text-3xl uppercase mb-3 ${oswald.className}`}>
                    {confirmModal.type === 'success' 
                        ? 'Deployed Successfully!' 
                        : confirmModal.type === 'trial' 
                        ? 'Start Free Trial' 
                        : 'Deploy Option'}
                </h3>

                <div className="text-sm font-semibold text-gray-600 mb-8 leading-relaxed">
                    {confirmModal.type === 'success' ? (
                        <p className="text-base text-gray-800 font-bold">{confirmModal.successMessage}</p>
                    ) : confirmModal.type === 'trial' ? (
                        <>Would you like to use your one-time <strong>3-day Free Trial</strong> to deploy <strong>{name}</strong> for free?</>
                    ) : (
                        <>
                            Choose how you would like to deploy <strong>{name}</strong>:
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
                          className="w-full bg-black text-white hover:bg-yellow-400 hover:text-black py-4 rounded-xl border-2 border-black font-black uppercase text-sm tracking-wider transition shadow-md"
                        >
                            Go to Dashboard
                        </button>
                    ) : confirmModal.type === 'trial' ? (
                        <>
                            <button 
                              disabled={modalLoading}
                              onClick={handleConfirmTrial}
                              className="w-full bg-black text-white hover:bg-yellow-400 hover:text-black py-4 rounded-xl border-2 border-black font-black uppercase text-sm tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {modalLoading ? <Loader2 className="animate-spin" size={16} /> : 'Deploy using Free Trial'}
                            </button>
                            <button 
                              disabled={modalLoading}
                              onClick={handleConfirmPaidUpgrade}
                              className="w-full bg-yellow-400 text-black hover:bg-black hover:text-white py-4 rounded-xl border-2 border-black font-black uppercase text-sm tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
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
                                  className="w-full bg-black text-white hover:bg-yellow-400 hover:text-black py-4 rounded-xl border-2 border-black font-black uppercase text-sm tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300"
                                >
                                    {modalLoading ? <Loader2 className="animate-spin" size={16} /> : 'Add to Plan (Free Slot)'}
                                </button>
                                <p className="text-[10px] text-gray-500 font-bold mt-1.5 uppercase">
                                    {slotCount >= 4 
                                        ? 'All 4 plan slots used. Upgrade or buy one-off.' 
                                        : `plan slots used: ${slotCount} / 4`}
                                </p>
                            </div>

                            {/* Option 2: Purchase Individually */}
                            <div className="w-full mt-2">
                                <button 
                                  disabled={modalLoading}
                                  onClick={handleConfirmPaidUpgrade}
                                  className="w-full bg-yellow-400 text-black hover:bg-black hover:text-white py-4 rounded-xl border-2 border-black font-black uppercase text-sm tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {modalLoading ? <Loader2 className="animate-spin" size={16} /> : 'Purchase Individually (₹999/mo)'}
                                </button>
                                <p className="text-[10px] text-gray-500 font-bold mt-1.5 uppercase">
                                    Keep your plan slots open for other agents
                                </p>
                            </div>
                        </>
                    )}

                    {confirmModal.type !== 'success' && (
                        <button 
                          disabled={modalLoading}
                          onClick={() => setConfirmModal({ isOpen: false, type: 'trial' })}
                          className="w-full bg-white text-gray-500 hover:text-red-500 py-2 font-bold uppercase text-xs tracking-wider transition disabled:opacity-50 mt-2"
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