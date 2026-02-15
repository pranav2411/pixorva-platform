"use client";

import React, { useState } from "react";
import { Oswald, Inter } from "next/font/google";
import { Send, Zap, MessageSquare, Play, Settings, Save, ArrowLeft, ArrowRight, Layout, MessageCircle, Globe, Mail, Clock, Database, Twitter, Check, Plus, Terminal, X, ChevronDown } from "lucide-react";
import { createClient } from '../utils/supabase/client'; 

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

// --- PRE-BUILT TEMPLATES ---
const TEMPLATES = [
    {
        name: "Viral Tweeter",
        steps: [
            { id: 1, type: "trigger", name: "Topic Trigger", icon: "Play" },
            { id: 2, type: "action", name: "Generate 5 Viral Hooks", icon: "Zap" },
            { id: 3, type: "action", name: "Write Tweet Thread", icon: "Twitter" }
        ]
    },
    {
        name: "Cold Emailer",
        steps: [
            { id: 1, type: "trigger", name: "Company Name", icon: "Play" },
            { id: 2, type: "action", name: "Research Company", icon: "Globe" },
            { id: 3, type: "action", name: "Write Sales Email", icon: "Mail" }
        ]
    },
    {
        name: "Meeting Summarizer",
        steps: [
            { id: 1, type: "trigger", name: "Paste Transcript", icon: "MessageSquare" },
            { id: 2, type: "action", name: "Extract Action Items", icon: "Check" },
            { id: 3, type: "action", name: "Draft Follow-up Email", icon: "Mail" }
        ]
    }
];

export default function StudioPage() {
  const [messages, setMessages] = useState([
    { role: "ai", content: "I am the PIXORVA Architect. Describe the agent you want to build, or select a template." }
  ]);
  const [input, setInput] = useState("");
  const [mobileTab, setMobileTab] = useState<'chat' | 'blueprint'>('chat'); 
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // --- LOGS STATE ---
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const [blueprintSteps, setBlueprintSteps] = useState<any[]>([
    { id: 1, type: "trigger", name: "Manual Trigger", icon: "Play" },
  ]);

  // --- 1. THE BRAIN (Gemini Architect) ---
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    
    try {
        const response = await fetch('/api/architect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });
        const data = await response.json();
        if (data.reply) setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
        
        if (data.step) {
            setBlueprintSteps(prev => [
                ...prev,
                { 
                    id: Date.now(), 
                    type: data.step.type, 
                    name: data.step.name, 
                    icon: data.step.icon 
                }
            ]);
            setMobileTab('blueprint');
        }
    } catch (e) {
        setMessages(prev => [...prev, { role: "ai", content: "Error connecting to Architect." }]);
    }
  };

  // --- 2. LOAD TEMPLATE ---
  const loadTemplate = (template: any) => {
      setBlueprintSteps(template.steps);
      setShowTemplates(false);
      setMessages(prev => [...prev, { role: "ai", content: `Loaded the "${template.name}" template. Click 'Test Run' to try it.` }]);
  };

  // --- 3. THE MEMORY (Supabase Save) ---
  const handleDeploy = async () => {
    setIsSaving(true);
    const supabase = createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("You must be logged in to deploy!");
            setIsSaving(false);
            return;
        }

        // --- FIX: SANITIZE STEPS ---
        // We ensure "icon" is just a string name, not a React component
        const cleanSteps = blueprintSteps.map(step => ({
            id: step.id,
            type: step.type,
            name: step.name,
            icon: typeof step.icon === 'string' ? step.icon : 'Zap' // Force string
        }));

        const { error } = await supabase.from('agents').insert({
            user_id: user.id,
            name: "My New Agent", 
            steps: cleanSteps 
        });

        if (error) throw error;
        alert("Agent Deployed Successfully! 🚀");

    } catch (e: any) {
        // Show the actual error message to help debug
        alert("Deploy Failed: " + e.message);
    } finally {
        setIsSaving(false);
    }
  };

  // --- 4. THE REAL ENGINE (Run Agent) ---
  const handleRun = async () => {
    // 1. Ask for Input
    const userInput = prompt("Enter input for this agent (e.g. Topic, Company Name, Text):");
    if (!userInput) return;

    setIsRunning(true);
    setShowLogs(true);
    setLogs([`Initializing Agent with input: "${userInput}"...`]);

    try {
        const response = await fetch('/api/run-agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ steps: blueprintSteps, input: userInput })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show logs one by one
            data.logs.forEach((log: string, i: number) => {
                setTimeout(() => {
                    setLogs(prev => [...prev, log]);
                }, i * 50); // Fast stream
            });
        } else {
            setLogs(prev => [...prev, "❌ Error: Engine Failed."]);
        }

    } catch (e) {
        setLogs(prev => [...prev, "❌ Error: Connection Failed."]);
    } finally {
        setIsRunning(false);
    }
  };

  return (
    <div className={`flex flex-col md:flex-row h-screen bg-gray-50 text-black ${inter.className} overflow-hidden`}>
      
      {/* Mobile Toggle */}
      <div className="md:hidden shrink-0 bg-white border-b border-gray-200 p-2 flex gap-2 z-50 shadow-sm">
        <button onClick={() => setMobileTab('chat')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-all ${mobileTab === 'chat' ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}><MessageCircle size={16} /> Chat</button>
        <button onClick={() => setMobileTab('blueprint')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-all ${mobileTab === 'blueprint' ? 'bg-yellow-400 text-black shadow-md' : 'bg-gray-100 text-gray-400'}`}><Layout size={16} /> Blueprint</button>
      </div>

      {/* Left Chat */}
      <div className={`w-full md:w-[400px] bg-white border-r border-gray-200 flex flex-col h-full shadow-xl z-20 transition-all ${mobileTab === 'blueprint' ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 md:p-6 border-b border-gray-100 flex items-center gap-4">
            <a href="/" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-black"><ArrowLeft size={20} /></a>
            <div>
                <h1 className={`text-xl md:text-2xl uppercase tracking-tighter leading-none ${oswald.className}`}>Studio</h1>
                <div className="flex items-center gap-2 text-xs font-bold text-green-600 mt-1">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span> Architect Online
                </div>
            </div>
        </div>
        
        {/* TEMPLATE BUTTON */}
        <div className="px-4 pt-4">
            <button onClick={() => setShowTemplates(!showTemplates)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-between px-4 transition">
                <span>📂 Load Template</span>
                <ChevronDown size={16} className={`transform transition ${showTemplates ? 'rotate-180' : ''}`} />
            </button>
            {showTemplates && (
                <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-2">
                    {TEMPLATES.map((t, i) => (
                        <button key={i} onClick={() => loadTemplate(t)} className="w-full text-left p-3 hover:bg-yellow-50 hover:text-yellow-700 rounded-lg text-sm font-bold border border-transparent hover:border-yellow-200 transition">
                            {t.name}
                        </button>
                    ))}
                </div>
            )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-white pb-24 md:pb-6">
            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>{msg.content}</div>
                </div>
            ))}
        </div>
        <div className="p-4 border-t border-gray-100 bg-white">
            <div className="relative">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Describe your workflow..." className="w-full pl-4 pr-12 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition" />
                <button onClick={handleSend} className="absolute right-2 top-2 bottom-2 aspect-square bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition shadow-sm flex items-center justify-center"><ArrowRight size={20} /></button>
            </div>
        </div>
      </div>

      {/* Right Blueprint */}
      <div className={`flex-1 bg-gray-50 flex flex-col relative overflow-hidden transition-all ${mobileTab === 'chat' ? 'hidden md:flex' : 'flex'}`}>
        <div className="absolute inset-0 opacity-[0.4]" style={{ backgroundImage: "radial-gradient(#94a3b8 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }}></div>
        
        {/* ACTION TOOLBAR */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex gap-2 md:gap-3 z-10">
            <button 
                onClick={handleRun}
                className="bg-white border-2 border-black px-3 py-2 md:px-4 rounded-lg font-bold text-xs md:text-sm hover:bg-gray-50 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all"
            >
                <Play size={14} /> <span className="hidden md:inline">Test Run</span>
            </button>
            <button 
                onClick={handleDeploy} 
                disabled={isSaving}
                className="bg-black text-white px-4 py-2 md:px-6 rounded-lg font-bold text-xs md:text-sm hover:bg-gray-800 flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50"
            >
                {isSaving ? "Saving..." : <><Save size={14} /> <span className="hidden md:inline">Deploy</span></>}
            </button>
        </div>

        {/* LOGS CONSOLE (Pop up) */}
        {showLogs && (
            <div className="absolute bottom-0 left-0 right-0 bg-black text-green-400 p-6 font-mono text-sm h-96 overflow-y-auto z-20 border-t-4 border-yellow-400 shadow-2xl">
                <div className="flex justify-between items-center mb-4 border-b border-white/20 pb-2">
                    <span className="flex items-center gap-2 font-bold text-white"><Terminal size={16}/> AGENT EXECUTION LOGS</span>
                    <button onClick={() => setShowLogs(false)}><X size={16} className="text-white hover:text-red-500"/></button>
                </div>
                <div className="space-y-4">
                    {logs.map((log, i) => (
                        <div key={i} className={`
                             ${log.includes('✅') ? 'text-white bg-green-900/30 p-2 rounded' : ''}
                             ${log.includes('❌') ? 'text-red-400' : ''}
                             ${log.includes('⚡') ? 'text-yellow-400 mt-4' : ''}
                        `}>
                            {log}
                        </div>
                    ))}
                    {isRunning && <div className="animate-pulse">_</div>}
                </div>
            </div>
        )}

        <div className="flex-1 flex items-center justify-center relative z-0 overflow-auto py-20 pb-20 md:pb-20">
            <div className="flex flex-col items-center space-y-2 w-full px-4">
                {blueprintSteps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center w-full max-w-sm">
                        {index > 0 && <div className="h-8 w-0.5 bg-gray-300"></div>}
                        <div className="w-full bg-white border-2 border-gray-200 p-4 rounded-xl shadow-sm flex items-center justify-between hover:border-black hover:shadow-md transition cursor-pointer group hover:scale-105 duration-200">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center border-2 border-transparent group-hover:border-black/10 transition ${step.type === 'trigger' ? 'bg-black text-white' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {getIcon(step.icon)}
                                </div>
                                <div><div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{step.type}</div><div className="font-bold text-base md:text-lg leading-none">{step.name}</div></div>
                            </div>
                            <Settings size={16} className="text-gray-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>
                ))}
                <div className="h-8 w-0.5 bg-gray-300"></div>
                <button className="w-12 h-12 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-black hover:text-black hover:rotate-90 transition-all duration-300 shadow-sm hover:shadow-md"><Plus size={24} /></button>
            </div>
        </div>
      </div>
    </div>
  );
}

function getIcon(name: string) {
    switch (name) {
      case "Zap": return <Zap size={16} />;
      case "Send": return <Send size={16} />;
      case "MessageSquare": return <MessageSquare size={16} />;
      case "Play": return <Play size={16} />;
      case "Globe": return <Globe size={16} />;
      case "Mail": return <Mail size={16} />;
      case "Clock": return <Clock size={16} />;
      case "Database": return <Database size={16} />;
      case "Twitter": return <Twitter size={16} />;
      case "Check": return <Check size={16} />;
      default: return <Zap size={16} />;
    }
}