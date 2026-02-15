"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Oswald, Inter } from "next/font/google";
import { 
  ArrowLeft, Play, Clock, Terminal, Code, Megaphone, ShieldCheck, 
  DollarSign, User as UserIcon, Layout, History, FileText, Zap, Loader2,
  Users, PieChart, Camera, Database, Lock, Clipboard, Video, Target, CheckCircle, Smartphone 
} from "lucide-react";
import { createClient } from '../../utils/supabase/client';
import Link from "next/link";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function AgentWorkstation() {
  const params = useParams();
  const router = useRouter();
  
  // State
  const [agent, setAgent] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [activeTab, setActiveTab] = useState<'terminal' | 'preview' | 'history'>('terminal');
  const [currentResult, setCurrentResult] = useState(""); 

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) { router.push("/login"); return; }

          // Get Agent Details
          const { data: agentData, error: agentError } = await supabase
            .from('agents')
            .select('*')
            .eq('id', params.id)
            .single();
          
          if (agentError || !agentData) {
            console.error("Agent Error:", agentError);
            // alert("Agent not found."); 
            // router.push("/"); // Optional: redirect if not found
            return;
          }
          setAgent(agentData);

          // Get Work History
          const { data: taskData } = await supabase
            .from('tasks')
            .select('*')
            .eq('agent_id', params.id)
            .order('created_at', { ascending: false });

          if (taskData) setTasks(taskData);
          
      } catch (e) {
          console.error("Crash:", e);
      } finally {
          setLoading(false);
      }
    };
    fetchData();
  }, [params.id, router]);

  // --- 2. DYNAMIC PLACEHOLDER ---
  const getPlaceholder = () => {
      if (!agent) return "Describe task...";
      const role = agent.name?.toLowerCase() || "";
      if (role.includes('dev')) return 'Ex: "Build a Landing Page for a Gym with a dark theme."';
      if (role.includes('legal')) return 'Ex: "Draft a Non-Disclosure Agreement."';
      if (role.includes('market')) return 'Ex: "Write a viral Twitter thread about AI."';
      return 'Describe the task...';
  }

  // --- 3. RUN AGENT ---
  const handleRun = async () => {
    if (!taskInput.trim()) return;
    setRunning(true);
    setActiveTab('terminal'); 
    
    // Save input for optimistic update
    const currentInput = taskInput;
    setTaskInput(""); // Clear immediately for better UX
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
        const response = await fetch('/api/run-agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                steps: agent.steps || [], 
                input: currentInput,
                agentId: agent.id,
                userId: user?.id 
            })
        });
        
        const data = await response.json();
        
        if (data.result) {
            setCurrentResult(data.result);
            
            // Auto-switch to Preview if HTML is detected
            const isCode = data.result.includes('<html') || data.result.includes('<div') || data.result.includes('import React');
            if (isCode) {
                setActiveTab('preview');
            }

            // --- INSTANT HISTORY UPDATE (Optimistic) ---
            const newTask = {
                id: Date.now().toString(), // Temp ID
                input: currentInput,
                result: data.result,
                created_at: new Date().toISOString(),
                type: isCode ? 'code' : 'text'
            };
            setTasks(prev => [newTask, ...prev]); 
            // -------------------------------------------

        } else {
            alert("Agent failed to respond. Check API Key.");
        }
    } catch (e) {
        alert("Connection Error. Check console.");
    } finally {
        setRunning(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold gap-2"><Loader2 className="animate-spin"/> Loading Workstation...</div>;
  if (!agent) return <div className="h-screen flex items-center justify-center">Agent loading...</div>;

  return (
    <div className={`min-h-screen bg-gray-50 text-black ${inter.className} flex flex-col md:flex-row`}>
      
      {/* SIDEBAR */}
      <div className="w-full md:w-[300px] bg-white border-r border-gray-200 p-6 flex flex-col h-auto md:h-screen z-20">
         <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 font-bold text-sm"><ArrowLeft size={16}/> Back to HQ</Link>
         
         <div className="text-center mb-8">
            <div className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                {getIcon(agent.steps?.[0]?.icon || agent.icon || 'Zap')}
            </div>
            <h1 className={`text-2xl uppercase leading-none mb-1 ${oswald.className}`}>{agent.name}</h1>
            <div className="flex justify-center gap-2 mt-2">
                 <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-1 rounded uppercase">Online</span>
                 <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase flex items-center gap-1"><Clock size={10}/> {agent.schedule || 'Manual'}</span>
            </div>
         </div>

         {/* History List */}
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
                            sandbox="allow-scripts" 
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
                     {tasks.length === 0 && <div className="text-center text-gray-400 mt-10">No history found. Run a task first!</div>}
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

// Full Icon Helper
function getIcon(name: string) {
    switch(name) {
        case "Code": return <Code size={32} />;
        case "Megaphone": return <Megaphone size={32} />;
        case "DollarSign": return <DollarSign size={32} />;
        case "ShieldCheck": return <ShieldCheck size={32} />;
        case "User": return <UserIcon size={32} />;
        case "Users": return <Users size={32} />;
        case "PieChart": return <PieChart size={32} />;
        case "Camera": return <Camera size={32} />;
        case "Database": return <Database size={32} />;
        case "Lock": return <Lock size={32} />;
        case "Clipboard": return <Clipboard size={32} />;
        case "Video": return <Video size={32} />;
        case "Target": return <Target size={32} />;
        case "CheckCircle": return <CheckCircle size={32} />;
        case "Smartphone": return <Smartphone size={32} />;
        case "FileText": return <FileText size={32} />;
        default: return <Zap size={32} />;
    }
}