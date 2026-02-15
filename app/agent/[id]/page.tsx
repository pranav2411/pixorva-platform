"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Oswald, Inter } from "next/font/google";
import { ArrowLeft, Play, Clock, Save, Terminal, Check, MessageSquare, Zap, Globe, Mail, Code, Megaphone, ShieldCheck, DollarSign, User as UserIcon } from "lucide-react";
import { createClient } from '../../utils/supabase/client';
import Link from "next/link";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function AgentWorkstation() {
  const params = useParams();
  const router = useRouter();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  
  // Auto-scroll for logs
  const logsEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [logs]);

  // 1. Fetch the Agent Data
  useEffect(() => {
    const fetchAgent = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        alert("Agent not found!");
        router.push("/");
      } else {
        setAgent(data);
      }
      setLoading(false);
    };
    fetchAgent();
  }, [params.id, router]);

  // 2. The Engine Connection (Give them work)
  const handleRun = async () => {
    if (!taskInput.trim()) {
        alert("Please describe the task first.");
        return;
    }

    setRunning(true);
    setLogs([`🚀 Assigning task to ${agent.name.split(' ')[0]}...`, `📋 Task: "${taskInput}"`]);

    try {
        const response = await fetch('/api/run-agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                steps: agent.steps, 
                input: taskInput 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Stream logs for "Working" effect
            data.logs.forEach((log: string, i: number) => {
                setTimeout(() => {
                    setLogs(prev => [...prev, log]);
                }, i * 300); // Slower read speed for realism
            });
        } else {
            setLogs(prev => [...prev, "❌ Error: Employee crashed."]);
        }

    } catch (e) {
        setLogs(prev => [...prev, "❌ Error: Connection lost."]);
    } finally {
        setTimeout(() => setRunning(false), 2000); // Keep loading state briefly
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold">Loading Employee File...</div>;

  return (
    <div className={`min-h-screen bg-gray-50 text-black ${inter.className} flex flex-col md:flex-row`}>
      
      {/* LEFT SIDEBAR: Employee Card */}
      <div className="w-full md:w-[350px] bg-white border-r border-gray-200 p-6 flex flex-col h-auto md:h-screen">
         <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 font-bold text-sm">
            <ArrowLeft size={16}/> Back to HQ
         </Link>

         <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-black text-white rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                {getIcon(agent.steps[0].icon)}
            </div>
            <h1 className={`text-3xl uppercase leading-none mb-2 ${oswald.className}`}>{agent.name}</h1>
            
            <div className="flex flex-wrap gap-2 justify-center mt-2">
                <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200 uppercase">Online</span>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-200 uppercase flex items-center gap-1">
                    <Clock size={10} /> {agent.schedule || 'Manual'}
                </span>
            </div>
         </div>

         <div className="mt-10">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Workflow Steps</h3>
            <div className="space-y-3 relative">
                {/* Connector Line */}
                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100 -z-10"></div>
                
                {agent.steps.map((step: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-gray-400 z-10 text-xs font-bold">
                            {i + 1}
                        </div>
                        <div className="text-sm font-bold">{step.name}</div>
                    </div>
                ))}
            </div>
         </div>
      </div>

      {/* RIGHT SIDE: The Workspace */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
         
         {/* Header */}
         <div className="bg-white border-b border-gray-200 p-6 flex justify-between items-center z-10">
             <div>
                 <h2 className="text-xl font-bold">Current Task</h2>
                 <p className="text-gray-500 text-sm">Assign work to {agent.name.split(' ')[0]}</p>
             </div>
             <button 
                onClick={handleRun}
                disabled={running}
                className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-bold uppercase tracking-wide hover:bg-yellow-300 transition shadow-[4px_4px_0px_0px_black] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
             >
                {running ? "Working..." : <><Play size={18} fill="black"/> Run Task</>}
             </button>
         </div>

         {/* Task Input */}
         <div className="p-6 bg-gray-50">
             <textarea 
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                placeholder={`E.g., "Build a landing page for a coffee shop" or "Find leads for a SaaS company"...`}
                className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-black focus:outline-none h-24 resize-none text-lg font-medium shadow-sm transition"
             ></textarea>
         </div>

         {/* Output / Terminal */}
         <div className="flex-1 bg-black p-6 overflow-y-auto font-mono text-sm relative">
             <div className="text-gray-500 mb-4 flex items-center gap-2 sticky top-0 bg-black py-2 border-b border-gray-800">
                <Terminal size={14}/> WORKSTATION LOGS
             </div>
             
             {logs.length === 0 ? (
                 <div className="text-gray-600 italic mt-10 text-center">
                     Waiting for command... <br/>
                     Enter a task above and click 'Run Task'
                 </div>
             ) : (
                 <div className="space-y-4 pb-20">
                    {logs.map((log, i) => (
                        <div key={i} className={`
                             p-3 rounded-lg border-l-2 animate-in slide-in-from-left-2
                             ${log.includes('✅') ? 'border-green-500 bg-green-900/10 text-green-400' : ''}
                             ${log.includes('❌') ? 'border-red-500 bg-red-900/10 text-red-400' : ''}
                             ${log.includes('🚀') ? 'border-yellow-500 bg-yellow-900/10 text-yellow-200 font-bold' : ''}
                             ${!log.includes('✅') && !log.includes('❌') && !log.includes('🚀') ? 'border-gray-700 text-gray-300' : ''}
                        `}>
                            {/* Format the output nicely */}
                            {log.split('\n').map((line, j) => (
                                <div key={j}>{line}</div>
                            ))}
                        </div>
                    ))}
                    {running && <div className="text-green-500 animate-pulse">_</div>}
                    <div ref={logsEndRef} />
                 </div>
             )}
         </div>

      </div>
    </div>
  );
}

// Icon Helper
function getIcon(name: string) {
    // Basic mapping, adding more for the employees
    switch(name) {
        case "Code": return <Code size={32} />;
        case "Megaphone": return <Megaphone size={32} />;
        case "DollarSign": return <DollarSign size={32} />;
        case "ShieldCheck": return <ShieldCheck size={32} />;
        case "User": return <UserIcon size={32} />;
        case "FileText": return <Zap size={32} />; // fallback
        default: return <Zap size={32} />;
    }
}