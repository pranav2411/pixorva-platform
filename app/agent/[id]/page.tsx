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
  
  const [agent, setAgent] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [activeTab, setActiveTab] = useState<'terminal' | 'preview' | 'history'>('terminal');
  const [currentResult, setCurrentResult] = useState(""); 
  const logsEndRef = useRef<HTMLDivElement>(null);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) { router.push("/login"); return; }

          // Get Agent
          const { data: agentData } = await supabase.from('agents').select('*').eq('id', params.id).single();
          setAgent(agentData);

          // Get Full History
          const { data: taskData } = await supabase
            .from('tasks')
            .select('*')
            .eq('agent_id', params.id)
            .order('created_at', { ascending: false })
            .limit(50); 

          if (taskData) setTasks(taskData);
          
      } catch (e) {
          console.error("Error loading workstation:", e);
      } finally {
          setLoading(false);
      }
    };
    fetchData();
  }, [params.id, router]);

  // --- 2. SMART CAPABILITIES (THE FIX) ---
  const getSuggestions = () => {
      if (!agent) return [];
      const role = agent.name?.toLowerCase() || "";
      
      // ENGINEERING
      if (role.includes('react') || role.includes('frontend')) return ["Build a Landing Page", "Create a Dashboard", "Fix CSS Bug"];
      if (role.includes('backend') || role.includes('architect')) return ["Design SQL Schema", "Write API Endpoint", "Optimize Database Query"];
      if (role.includes('qa') || role.includes('tester')) return ["Write Unit Tests", "Find Bugs in Code", "Create Test Plan"];
      if (role.includes('security')) return ["Audit this Code", "Write Security Policy", "Check for Vulnerabilities"];

      // MARKETING
      if (role.includes('growth') || role.includes('marketing')) return ["Write Viral Thread", "Create Ad Copy", "Plan Launch Strategy"];
      if (role.includes('social') || role.includes('media')) return ["Write Instagram Caption", "Create TikTok Script", "Generate Hashtags"];
      if (role.includes('seo') || role.includes('writer')) return ["Write SEO Blog Post", "Find Keywords", "Optimize Meta Tags"];
      if (role.includes('video')) return ["Write YouTube Script", "Create Video Outline", "Suggest Video Topics"];

      // SALES
      if (role.includes('sales') || role.includes('sdr')) return ["Draft Cold Email", "Create Sales Script", "Follow-up Message"];
      if (role.includes('lead') || role.includes('enricher')) return ["Find Company Info", "Extract Leads", "Research Prospect"];

      // OPERATIONS / HR / FINANCE / LEGAL
      if (role.includes('hr') || role.includes('manager')) return ["Write Job Description", "Screen Resume", "Draft Offer Letter"];
      if (role.includes('finance') || role.includes('analyst')) return ["Analyze P&L", "Create Budget", "Summarize Tax Rules"];
      if (role.includes('legal') || role.includes('counsel')) return ["Draft NDA", "Review Contract", "Write Terms of Service"];
      if (role.includes('product') || role.includes('manager')) return ["Write User Story", "Create Roadmap", "Define Feature Specs"];
      if (role.includes('support')) return ["Reply to Complaint", "Write FAQ Answer", "Create Help Article"];

      // DEFAULT
      return ["Summarize this text", "Write an Email", "Brainstorm Ideas"];
  }

  // --- 3. RUN AGENT ---
  const handleRun = async (inputText: string = taskInput) => {
    if (!inputText.trim()) return;
    setRunning(true);
    setActiveTab('terminal'); 
    setTaskInput(""); 
    
    // Optimistic Update
    const tempId = Date.now().toString();
    const tempTask = { id: tempId, input: inputText, result: "Thinking...", created_at: new Date().toISOString(), type: 'text' };
    setTasks(prev => [tempTask, ...prev]);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
        const response = await fetch('/api/run-agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                steps: agent.steps || [], 
                input: inputText,
                agentId: agent.id,
                userId: user?.id,
                agentRole: agent.name // Pass Role to API
            })
        });
        
        const data = await response.json();
        const finalResult = data.result || "No response";

        // Update Task
        const isCode = finalResult.includes('<html') || finalResult.includes('<!DOCTYPE') || finalResult.includes('import React');
        setTasks(prev => prev.map(t => t.id === tempId ? { ...t, result: finalResult, type: isCode ? 'code' : 'text' } : t));
        setCurrentResult(finalResult);

        if (isCode) {
            setActiveTab('preview');
        }

    } catch (e) {
        alert("Connection Error.");
    } finally {
        setRunning(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold gap-2"><Loader2 className="animate-spin"/> Loading Workstation...</div>;
  if (!agent) return <div className="h-screen flex items-center justify-center">Agent not found.</div>;

  return (
    <div className={`min-h-screen bg-gray-50 text-black ${inter.className} flex flex-col md:flex-row`}>
      
      {/* SIDEBAR */}
      <div className="w-full md:w-[320px] bg-white border-r border-gray-200 flex flex-col h-auto md:h-screen z-20">
         <div className="p-6 border-b border-gray-100">
             <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 font-bold text-sm"><ArrowLeft size={16}/> Back to HQ</Link>
             
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                    {getIcon(agent.steps?.[0]?.icon || agent.icon || 'Zap')}
                </div>
                <div>
                    <h1 className={`text-xl uppercase leading-none mb-1 ${oswald.className}`}>{agent.name.split('(')[0]}</h1>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">{agent.name.split('(')[1]?.replace(')', '') || 'Agent'}</div>
                    <div className="flex gap-2">
                        <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded uppercase">Online</span>
                    </div>
                </div>
             </div>
         </div>

         {/* CAPABILITIES (FIXED) */}
         <div className="p-6 bg-yellow-50/50 border-b border-yellow-100">
             <h3 className="text-xs font-bold text-yellow-700 uppercase tracking-widest mb-3">Capabilities</h3>
             <div className="flex flex-wrap gap-2">
                 {getSuggestions().map((suggestion, i) => (
                     <button 
                        key={i} 
                        onClick={() => handleRun(suggestion)} // Click to run immediately
                        className="text-xs bg-white border border-yellow-200 text-yellow-800 px-3 py-1.5 rounded-lg hover:bg-yellow-400 hover:text-black hover:border-black transition font-medium text-left"
                     >
                         + {suggestion}
                     </button>
                 ))}
             </div>
         </div>

         {/* HISTORY LIST */}
         <div className="flex-1 overflow-y-auto p-4">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Work History</h3>
             <div className="space-y-2">
                 {tasks.map((t) => (
                     <div key={t.id} onClick={() => { setCurrentResult(t.result); setActiveTab(t.type === 'code' ? 'preview' : 'terminal'); }} className="p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl cursor-pointer transition group">
                         <div className="font-bold text-xs truncate mb-1 text-gray-800">{t.input}</div>
                         <div className="flex justify-between items-center text-[10px] text-gray-400">
                             <span>{new Date(t.created_at).toLocaleTimeString()}</span>
                             <span className={`uppercase font-bold ${t.result.includes('Busy') ? 'text-red-500' : 'text-green-600'}`}>
                                 {t.result === "Thinking..." ? "Running..." : "Success"}
                             </span>
                         </div>
                     </div>
                 ))}
                 {tasks.length === 0 && <div className="text-xs text-gray-400 italic px-2">No history yet. Assign a task.</div>}
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
             </div>
         </div>

         {/* DISPLAY */}
         <div className="flex-1 overflow-auto relative">
             {activeTab === 'terminal' && (
                 <div className="p-8 font-mono text-sm whitespace-pre-wrap">
                     {currentResult ? (
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in">{currentResult}</div>
                     ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                            <Zap size={48} className="mb-4"/>
                            <div>Select a capability or type a command.</div>
                        </div>
                     )}
                     <div ref={logsEndRef} />
                 </div>
             )}

             {activeTab === 'preview' && (
                 <div className="w-full h-full bg-white">
                     {currentResult.includes('<html') || currentResult.includes('<!DOCTYPE') ? (
                         <iframe srcDoc={currentResult} className="w-full h-full border-none" sandbox="allow-scripts" />
                     ) : (
                         <div className="flex flex-col items-center justify-center h-full text-gray-400">
                             <Layout size={48} className="mb-4"/>
                             <div>Visual preview not available for this task.</div>
                         </div>
                     )}
                 </div>
             )}
         </div>

         {/* INPUT */}
         <div className="bg-white border-t border-gray-200 p-6 z-30">
             <div className="relative">
                 <input 
                    type="text" 
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                    placeholder="Describe your task..."
                    className="w-full pl-6 pr-32 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white text-lg transition shadow-sm"
                 />
                 <button 
                    onClick={() => handleRun()}
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

// Icon Helper
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