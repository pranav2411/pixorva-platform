"use client";

import React, { useState } from "react";
import { Oswald, Inter } from "next/font/google";
// FIXED: Added 'Target' to the imports below
import { 
  ArrowLeft, Save, Bot, Zap, Code, Terminal, Shield, 
  Megaphone, DollarSign, PenTool, Brain, Sparkles, CheckCircle, Target 
} from "lucide-react";
import Link from "next/link";
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';

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

  // --- PRESETS ---
  const applyPreset = (preset: string) => {
      if (preset === 'coder') {
          setRole("Senior Engineer");
          setGoal("Write bug-free code");
          setInstructions("You are a Senior Software Engineer. Always return clean, commented code. If asked for a UI, return HTML/Tailwind.");
          setIcon("Code");
      }
      if (preset === 'writer') {
          setRole("Viral Ghostwriter");
          setGoal("Grow Twitter audience");
          setInstructions("You are a viral content creator. Write punchy, engaging hooks. Use short sentences and no fluff.");
          setIcon("PenTool");
      }
      if (preset === 'negotiator') {
          setRole("Salary Negotiator");
          setGoal("Maximize offers");
          setInstructions("You are a tough negotiator. Help the user reply to job offers to get a higher salary. Be polite but firm.");
          setIcon("DollarSign");
      }
  };

  // --- DEPLOY AGENT ---
  const handleDeploy = async () => {
    if (!name || !role || !instructions) {
        alert("Please give your agent a Name, Role, and Instructions.");
        return;
    }

    setLoading(true);
    const supabase = createClient();
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }

        // Save to DB
        const { error } = await supabase.from('agents').insert({
            user_id: user.id,
            name: `${name} (${role})`, // Format: Jarvis (Assistant)
            goal: goal,
            instructions: instructions, // The Custom Brain
            icon: icon,
            schedule: 'Manual',
            steps: [{ name: "Custom Logic", icon: "Brain" }] // Visual placeholder
        });

        if (error) throw error;

        // Success Animation
        setTimeout(() => {
            router.push("/");
        }, 1000);

    } catch (e: any) {
        alert("Deploy failed: " + e.message);
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
          <div className="mb-8">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">Quick Start Templates</label>
              <div className="flex gap-2">
                  <button onClick={() => applyPreset('coder')} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-100 transition">Code Expert</button>
                  <button onClick={() => applyPreset('writer')} className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition">Viral Writer</button>
                  <button onClick={() => applyPreset('negotiator')} className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-xs font-bold hover:bg-yellow-100 transition">Negotiator</button>
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