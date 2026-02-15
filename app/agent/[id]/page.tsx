"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Oswald, Inter } from "next/font/google";
import { ArrowLeft, Play, Clock, Terminal, Code, Megaphone, ShieldCheck, DollarSign, User as UserIcon, Layout, History, FileText, Zap } from "lucide-react";
import { createClient } from '../../utils/supabase/client';
import Link from "next/link";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function AgentWorkstation() {
  const params = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]); // HISTORY
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [activeTab, setActiveTab] = useState<'terminal' | 'preview' | 'history'>('terminal');
  const [currentResult, setCurrentResult] = useState(""); // Holds the Live Output

  // 1. Fetch Agent & History
  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) { router.push("/login"); return; }

      // Get Agent
      const { data: agentData } = await supabase.from('agents').select('*').eq('id', params.id).single();
      if (agentData) setAgent(agentData);

      // Get History
      const { data: taskData } = await supabase.from('tasks').select('*').eq('agent_id', params.id).order('created_at', { ascending: false });
      if (taskData) setTasks(taskData);

      setLoading(false);
    };
    fetchData();
  }, [params.id, router, running]); // Re-fetch when running changes

  // 2. Dynamic Placeholders
  const getPlaceholder = () => {
      if (!agent) return "Describe task...";
      const role = agent.name.toLowerCase();
      if (role.includes('dev')) return 'Ex: "Build a Landing Page for a Gym with a dark theme and pricing section."';
      if (role.includes('legal')) return 'Ex: "Draft a Non-Disclosure Agreement for a contractor."';
      if (role.includes('market')) return 'Ex: "Write a Twitter thread about AI trends."';
      return 'Describe the task...';
  }

  // 3. Run Agent
  const handleRun = async () => {
    if (!taskInput.trim()) return;
    setRunning(true);
    setActiveTab('terminal'); // Switch to logs
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
        const response = await fetch('/api/run-agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                steps: agent.steps, 
                input: taskInput,
                agentId: agent.id,   // Send IDs so we can save
                userId: user?.id 
            })
        });
        
        const data = await response.json();
        if (data.result) {
            setCurrentResult(data.result);
            // If it looks like HTML code, switch to Preview automatically
            if (data.result.includes('<html') || data.result.includes('<div')) {
                setActiveTab('preview');
            }
        }
    } catch (e) {
        alert("Connection Error");
    } finally {
        setRunning(false);
        setTaskInput(""); // Clear input
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold">Loading Workstation...</div>;

  return (
    <div className={`min-h-screen bg-gray-50 text-black ${inter.className} flex flex-col md:flex-row`}>
      
      {/* SIDEBAR */}
      <div className="w-full md:w-[300px] bg-white border-r border-gray-200 p-6 flex flex-col h-auto md:h-screen z-20">
         <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 font-bold text-sm"><ArrowLeft size={16}/> Back to HQ</Link>
         
         <div className="text-center mb-8">
            <div className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">{getIcon(agent.steps[0].icon)}</div>
            <h1 className={`text-2xl uppercase leading-none mb-1 ${oswald.className}`}>{agent.name}</h1>
            <div className="flex justify-center gap-2 mt-2">
                 <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-1 rounded uppercase">Online</span>
                 <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase flex items-center gap-1"><Clock size={10}/> {agent.schedule || 'Manual'}</span>
            </div>
         </div>

         {/* History List (Mini) */}
         <div className="flex-1 overflow-y-auto">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recent Memory</h3>
             <div className="space-y-2">
                 {tasks.map((t) => (
                     <div key={t.id} onClick={() => { setCurrentResult(t.result); setActiveTab(t.type === 'code' ? 'preview' : 'terminal'); }} className="p-3 bg-gray-50 hover:bg-yellow-50 border border-gray-100 rounded-lg cursor-pointer text-xs transition">
                         <div className="font-bold truncate mb-1">{t.input}</div>
                         <div className="text-gray-400">{new Date(t.created_at).toLocaleDateString()}</div>
                     </div>
                 ))}
                 {tasks.length === 0 && <div className="text-xs text-gray-400 italic">No tasks yet.</div>}
             </div>
         </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-100 relative">
         
         {/* TABS */}
         <div className="bg-white border-b border-gray-200 px-6 pt-4 flex items-end justify-between">
             <div className="flex gap-6">
                 <button onClick={() => setActiveTab('terminal')} className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === 'terminal' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>
                    <Terminal size={16}/> Output Log
                 </button>
                 <button onClick={() => setActiveTab('preview')} className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === 'preview' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>
                    <Layout size={16}/> Live Preview
                 </button>
                 <button onClick={() => setActiveTab('history')} className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === 'history' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>
                    <History size={16}/> Full History
                 </button>
             </div>
         </div>

         {/* MAIN DISPLAY AREA */}
         <div className="flex-1 overflow-auto relative">
             
             {/* 1. TERMINAL VIEW (Text) */}
             {activeTab === 'terminal' && (
                 <div className="p-8 font-mono text-sm whitespace-pre-wrap">
                     {running ? (
                         <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
                             <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-black rounded-full"></div>
                             Processing Request...
                         </div>
                     ) : currentResult ? (
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">{currentResult}</div>
                     ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                            <Terminal size={48} className="mb-4"/>
                            <div>Ready to work.</div>
                        </div>
                     )}
                 </div>
             )}

             {/* 2. PREVIEW VIEW (Visual/HTML) */}
             {activeTab === 'preview' && (
                 <div className="w-full h-full bg-white">
                     {currentResult.includes('<html') || currentResult.includes('<div') ? (
                         <iframe 
                            srcDoc={currentResult} 
                            className="w-full h-full border-none" 
                            title="Preview"
                            sandbox="allow-scripts" // Security
                         />
                     ) : (
                         <div className="flex flex-col items-center justify-center h-full text-gray-400">
                             <Layout size={48} className="mb-4"/>
                             <div>No visual output generated.</div>
                         </div>
                     )}
                 </div>
             )}
             
             {/* 3. HISTORY VIEW (List) */}
             {activeTab === 'history' && (
                 <div className="p-8 space-y-4">
                     {tasks.map((t) => (
                         <div key={t.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                             <div className="font-bold text-lg mb-2">{t.input}</div>
                             <div className="bg-gray-50 p-4 rounded-lg font-mono text-xs text-gray-600 max-h-40 overflow-hidden text-ellipsis">{t.result.substring(0,300)}...</div>
                             <div className="mt-4 flex gap-2">
                                 <button onClick={() => { setCurrentResult(t.result); setActiveTab('preview'); }} className="text-xs font-bold bg-black text-white px-3 py-2 rounded">Load Preview</button>
                             </div>
                         </div>
                     ))}
                 </div>
             )}

         </div>

         {/* INPUT AREA (Sticky Bottom) */}
         <div className="bg-white border-t border-gray-200 p-6 z-30">
             <div className="relative">
                 <input 
                    type="text" 
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                    placeholder={getPlaceholder()}
                    className="w-full pl-6 pr-32 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white text-lg transition shadow-sm"
                 />
                 <button 
                    onClick={handleRun}
                    disabled={running}
                    className="absolute right-2 top-2 bottom-2 bg-black text-white px-6 rounded-lg font-bold uppercase tracking-wide hover:bg-yellow-400 hover:text-black transition flex items-center gap-2 disabled:opacity-50"
                 >
                    {running ? "..." : <><Play size={16} fill="white" className="text-current"/> Run</>}
                 </button>
             </div>
         </div>

      </div>
    </div>
  );
}

// Simple Icon Helper
function getIcon(name: string) {
    switch(name) {
        case "Code": return <Code size={32} />;
        case "Megaphone": return <Megaphone size={32} />;
        case "DollarSign": return <DollarSign size={32} />;
        case "ShieldCheck": return <ShieldCheck size={32} />;
        case "User": return <UserIcon size={32} />;
        default: return <Zap size={32} />;
    }
}