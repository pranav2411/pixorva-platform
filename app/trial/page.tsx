"use client";

import React, { useEffect, useState } from "react";
import { Oswald, Inter } from "next/font/google";
import { 
  Loader2, CheckCircle, Zap, X, Code, Megaphone, PenTool, Target, Plus, 
  Mail, Clock, Database, Twitter, Send, ShieldCheck, DollarSign, Users, 
  PieChart, Camera, Lock, Clipboard, Video, Smartphone, Search
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../utils/supabase/client";
import { EMPLOYEES } from "../employees/page";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

// Icon Helper for the agent list
function getIcon(name: string) {
    const props = { size: 24, className: "text-black" };
    switch(name) {
        case "Code": return <Code {...props} />;
        case "Megaphone": return <Megaphone {...props} />;
        case "DollarSign": return <DollarSign {...props} />;
        case "ShieldCheck": return <ShieldCheck {...props} />;
        case "Users": return <Users {...props} />;
        case "PieChart": return <PieChart {...props} />;
        case "Camera": return <Camera {...props} />;
        case "Database": return <Database {...props} />;
        case "Lock": return <Lock {...props} />;
        case "Clipboard": return <Clipboard {...props} />;
        case "Video": return <Video {...props} />;
        case "CheckCircle": return <CheckCircle {...props} />;
        case "Smartphone": return <Smartphone {...props} />;
        case "Search": return <Search {...props} />;
        case "Mail": return <Mail {...props} />;
        case "Clock": return <Clock {...props} />;
        case "Twitter": return <Twitter {...props} />;
        case "PenTool": return <PenTool {...props} />;
        case "Target": return <Target {...props} />;
        default: return <Zap {...props} />;
    }
}

export default function TrialPage() {
  const [step, setStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activatingAgent, setActivatingAgent] = useState<string | null>(null);
  const [selectedAgentName, setSelectedAgentName] = useState("");
  const router = useRouter();

  // Run initial checks and connection animation
  useEffect(() => {
    const checkEligibility = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login?redirect=/trial");
        return;
      }

      // Check if they've already used the trial
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_used_trial')
        .eq('id', user.id)
        .single();

      if (profile?.has_used_trial) {
        setErrorMsg("You have already used your free trial. Only one free trial is allowed per account.");
        return;
      }

      // Play initial animations
      setTimeout(() => setStep(1), 1000); // Connecting to Mainframe
      setTimeout(() => setStep(2), 2200); // Provisioning AI workforce
      setTimeout(() => setStep(3), 3500); // Ready to choose agent
    };

    checkEligibility();
  }, [router]);

  // Handle choosing a free trial agent
  const handleSelectAgent = async (employee: any) => {
    setActivatingAgent(employee.id);
    const supabase = createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        // 1. Provision the agent directly in Supabase
        const { data: newAgent, error: agentError } = await supabase
            .from('agents')
            .insert({
                user_id: user.id,
                name: `${employee.name} (${employee.role})`,
                steps: employee.steps,
                schedule: 'Manual',
                icon: employee.icon
            })
            .select('id')
            .single();

        if (agentError) throw agentError;

        // 2. Set trial ends 3 days from now, set has_used_trial = true, and set the trial_agent_id
        const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                trial_started_at: new Date().toISOString(),
                trial_ends_at: trialEndsAt,
                trial_agent_id: newAgent.id,
                has_used_trial: true
            });

        if (profileError) throw profileError;

        setSelectedAgentName(`${employee.name} (${employee.role})`);
        setStep(4); // Trigger success screen

    } catch (e: any) {
        alert("Failed to activate agent trial: " + e.message);
        setActivatingAgent(null);
    }
  };

  return (
    <div className={`min-h-screen bg-yellow-400 flex flex-col items-center justify-center p-6 ${inter.className}`}>
      
      {/* ERROR LOCK SCREEN */}
      {errorMsg && (
          <div className="bg-white border-4 border-black p-8 md:p-12 rounded-3xl shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full text-center animate-in zoom-in duration-300">
              <div className="mb-6 flex justify-center">
                <div className="bg-red-500 text-white p-4 rounded-full border-4 border-black">
                    <X size={48} />
                </div>
              </div>
              <h1 className={`text-4xl uppercase mb-2 ${oswald.className}`}>Cannot Activate Trial</h1>
              <p className="text-gray-600 font-bold mb-8">{errorMsg}</p>
              
              <Link href="/">
                <button className="w-full bg-black text-white text-xl py-4 rounded-xl font-bold uppercase hover:bg-yellow-400 hover:text-black hover:border-black border-4 border-transparent hover:border-black transition shadow-lg">
                    Go to Dashboard
                </button>
              </Link>
          </div>
      )}

      {/* LOADING ANIMATIONS */}
      {!errorMsg && step < 3 && (
          <div className="bg-white border-4 border-black p-8 md:p-12 rounded-3xl shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full text-center">
              <div className="mb-6 flex justify-center">
                  <Loader2 size={64} className="animate-spin text-black" />
              </div>
              <h1 className={`text-4xl uppercase mb-4 ${oswald.className}`}>Activating Trial...</h1>
              
              <div className="space-y-4 text-left font-bold text-gray-500 bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
                  <div className={`flex items-center gap-3 transition ${step >= 1 ? 'text-black' : 'opacity-30'}`}>
                      {step >= 1 ? <CheckCircle size={20} className="text-green-500"/> : <div className="w-5 h-5 rounded-full border-2 border-gray-300"/>}
                      Connecting to Pixorva Mainframe
                  </div>
                  <div className={`flex items-center gap-3 transition ${step >= 2 ? 'text-black' : 'opacity-30'}`}>
                      {step >= 2 ? <CheckCircle size={20} className="text-green-500"/> : <div className="w-5 h-5 rounded-full border-2 border-gray-300"/>}
                      Provisioning AI Workforce
                  </div>
                  <div className={`flex items-center gap-3 opacity-30`}>
                      <div className="w-5 h-5 rounded-full border-2 border-gray-300"/>
                      Unlocking Free Workspace Selection
                  </div>
              </div>
          </div>
      )}

      {/* STEP 3: CHOOSE TRIAL AGENT GRID */}
      {!errorMsg && step === 3 && (
          <div className="w-full max-w-6xl animate-in fade-in duration-500">
              <div className="text-center mb-12">
                  <h1 className={`text-5xl md:text-7xl uppercase text-black italic tracking-tighter ${oswald.className}`}>
                      Choose Your Free Trial Agent
                  </h1>
                  <p className="text-lg text-black font-bold uppercase tracking-wide mt-2">
                      Select 1 agent of your choice for a 3-day free trial. Your selection cannot be changed.
                  </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {EMPLOYEES.map((employee) => (
                      <div 
                        key={employee.id} 
                        className={`border-4 border-black bg-white rounded-3xl p-6 flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1`}
                      >
                          <div>
                              <div className="flex justify-between items-start mb-4">
                                  <div className="w-12 h-12 bg-yellow-400 border-2 border-black rounded-lg flex items-center justify-center">
                                      {getIcon(employee.icon)}
                                  </div>
                                  <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 rounded">
                                      Free Trial
                                  </span>
                              </div>
                              <h3 className={`text-2xl uppercase leading-none mb-1 ${oswald.className}`}>{employee.name}</h3>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{employee.role}</p>
                              
                              <p className="text-xs font-semibold text-gray-600 mb-6 leading-relaxed">{employee.desc}</p>
                              
                              <div className="flex flex-wrap gap-1.5 mb-6">
                                  {employee.skills.map((skill, sIdx) => (
                                      <span key={sIdx} className="text-[9px] font-bold bg-gray-100 border border-gray-200 px-2 py-0.5 rounded text-gray-500 uppercase">
                                          {skill}
                                      </span>
                                  ))}
                              </div>
                          </div>

                          <button 
                            disabled={activatingAgent !== null}
                            onClick={() => handleSelectAgent(employee)}
                            className="w-full bg-black text-white hover:bg-yellow-400 hover:text-black py-3 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                              {activatingAgent === employee.id ? (
                                  <Loader2 className="animate-spin" size={14} />
                              ) : (
                                  `Activate ${employee.name}`
                              )}
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* STEP 4: SUCCESS LIVE SCREEN */}
      {!errorMsg && step === 4 && (
          <div className="bg-white border-4 border-black p-8 md:p-12 rounded-3xl shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full text-center animate-in zoom-in duration-300">
              <div className="mb-6 flex justify-center">
                <div className="bg-green-500 text-white p-4 rounded-full border-4 border-black">
                    <Zap size={48} fill="white" />
                </div>
              </div>
              <h1 className={`text-4xl uppercase mb-2 ${oswald.className}`}>You are Live!</h1>
              <p className="text-gray-600 font-bold mb-8">
                  <strong>{selectedAgentName}</strong> is activated and ready for commands.
              </p>
              
              <Link href="/">
                <button className="w-full bg-black text-white text-xl py-4 rounded-xl font-bold uppercase hover:bg-yellow-400 hover:text-black hover:border-black border-4 border-transparent hover:border-black transition shadow-lg">
                    Enter Dashboard
                </button>
              </Link>
              <p className="mt-4 text-xs font-bold text-gray-400 uppercase">Trial expires in 3 days</p>
          </div>
      )}

    </div>
  );
}