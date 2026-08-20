"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Oswald, Inter } from "next/font/google";
import { 
  ArrowLeft, Play, Terminal, Code, Megaphone, ShieldCheck, 
  DollarSign, User as UserIcon, Layout, FileText, Zap, Loader2,
  Users, PieChart, Camera, Database, Lock, Clipboard, Video, Target, 
  CheckCircle, Smartphone, Paperclip, X, Download, Mail, Send, Plus
} from "lucide-react";
import { createClient } from '../../utils/supabase/client';
import Link from "next/link";
import { showToast } from '../../utils/Toast';

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
  const [activeTab, setActiveTab] = useState<'terminal' | 'preview'>('terminal');
  const [currentResult, setCurrentResult] = useState(""); 
  
  // --- FILE & ACTION STATE ---
  const [selectedFile, setSelectedFile] = useState<{ name: string, type: string, base64: string } | null>(null);
  const [pendingAction, setPendingAction] = useState<any>(null); // For Approval Card
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pendingAction && pendingAction.body) {
      // Find matches for bracketed content [Placeholder Name]
      const regex = /\[([^\]]+)\]/g;
      let match;
      const foundPlaceholders: string[] = [];
      while ((match = regex.exec(pendingAction.body)) !== null) {
        // Only add unique placeholder names
        const placeholderName = match[1];
        if (!foundPlaceholders.includes(placeholderName)) {
          foundPlaceholders.push(placeholderName);
        }
      }

      // Initialize state for each found placeholder
      const initialValues: Record<string, string> = {};
      foundPlaceholders.forEach(placeholder => {
        initialValues[placeholder] = "";
      });
      setPlaceholderValues(initialValues);
    } else {
      setPlaceholderValues({});
    }
  }, [pendingAction]);

  // --- TRIAL STATE ---
  const [isTrial, setIsTrial] = useState(false);
  const [trialExpired, setTrialExpired] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) { router.push("/login"); return; }

          const { data: agentData } = await supabase.from('agents').select('*').eq('id', params.id).single();
          setAgent(agentData);

          const { data: taskData } = await supabase
            .from('tasks')
            .select('*')
            .eq('agent_id', params.id)
            .order('created_at', { ascending: false })
            .limit(50); 

          if (taskData) setTasks(taskData);

          // Check trial state
          const { data: profile } = await supabase
            .from('profiles')
            .select('trial_agent_id, trial_ends_at')
            .eq('id', user.id)
            .single();

          if (profile) {
              const isAgentTrial = profile.trial_agent_id === params.id;
              setIsTrial(isAgentTrial);
              const expired = isAgentTrial && profile.trial_ends_at && new Date() > new Date(profile.trial_ends_at);
              setTrialExpired(!!expired);
              setTrialEndsAt(profile.trial_ends_at || null);
          }
      } catch (e) {
          console.error("Error loading workstation:", e);
      } finally {
          setLoading(false);
      }
    };
    fetchData();
  }, [params.id, router]);

  const getTrialBannerText = () => {
    if (!trialEndsAt) return "";
    const msLeft = new Date(trialEndsAt).getTime() - Date.now();
    const totalHoursLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60)));
    const daysLeft = Math.floor(totalHoursLeft / 24);
    const hoursLeft = totalHoursLeft % 24;
    
    if (daysLeft > 0) {
      return `⏳ Free Trial Active: ${daysLeft} day${daysLeft > 1 ? 's' : ''} and ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} left`;
    }
    return `⏳ Free Trial Active: ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} left`;
  };

  const handlePurchase = async () => {
    setLoading(true);
    const supabase = createClient();
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/login"); return; }
        if (!agent) return;

        let price = "₹999/mo"; // Default
        const lowerName = agent.name.toLowerCase();
        if (lowerName.includes("devon")) price = "₹999/mo";
        else if (lowerName.includes("ruby")) price = "₹1,299/mo";
        else if (lowerName.includes("quinn")) price = "₹799/mo";
        else if (lowerName.includes("cy")) price = "₹1,499/mo";
        else if (lowerName.includes("marcus")) price = "₹899/mo";
        else if (lowerName.includes("stella")) price = "₹699/mo";
        else if (lowerName.includes("gordon")) price = "₹799/mo";
        else if (lowerName.includes("vic")) price = "₹899/mo";
        else if (lowerName.includes("sarah")) price = "₹999/mo";
        else if (lowerName.includes("larry")) price = "₹899/mo";
        else if (lowerName.includes("holly")) price = "₹1,199/mo";
        else if (lowerName.includes("finn")) price = "₹1,499/mo";
        else if (lowerName.includes("lawson")) price = "₹1,999/mo";
        else if (lowerName.includes("pat")) price = "₹1,099/mo";
        else if (lowerName.includes("sam")) price = "₹499/mo";
        
        const parsedAmount = parseInt(price.replace(/[^\d]/g, ""), 10) * 100;

        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                agentName: agent.name,
                icon: agent.icon,
                steps: agent.steps,
                amount: parsedAmount
            })
        });

        const data = await response.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error(data.error || "Failed to create checkout session");
        }
    } catch (err: unknown) {
        showToast("Failed to initiate purchase: " + (err as Error).message, "error");
        setLoading(false);
    }
  };

  // --- 2. RUN AGENT ---
  const handleRun = async (inputText: string = taskInput) => {
    if (!inputText.trim() && !selectedFile) return;
    setRunning(true);
    setPendingAction(null); // Clear previous actions
    setActiveTab('terminal'); 
    setTaskInput(""); 
    
    const tempId = Date.now().toString();
    const displayInput = selectedFile ? `[Attachment: ${selectedFile.name}] ${inputText}` : inputText;
    
    const tempTask = { id: tempId, input: displayInput, result: "Thinking...", created_at: new Date().toISOString(), type: 'text' };
    setTasks(prev => [tempTask, ...prev]);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
        const response = await fetch('/api/run-agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                input: inputText,
                agentId: agent.id,
                userId: user?.id,
                agentRole: agent.name,
                fileData: selectedFile 
            })
        });
        
        const data = await response.json();
        const finalResult = data.result || "No response";

        // --- NEW: CHECK FOR ACTION JSON ---
        try {
            const parsedAction = JSON.parse(finalResult);
            if (parsedAction.tool === "email") {
                setPendingAction(parsedAction); // Trigger the Approval Card
            }
        } catch (e) {
            // Not JSON, ignore
        }

        const isCode = finalResult.includes('<html') || finalResult.includes('<!DOCTYPE') || finalResult.includes('import React');
        setTasks(prev => prev.map(t => t.id === tempId ? { ...t, result: finalResult, type: isCode ? 'code' : 'text' } : t));
        setCurrentResult(finalResult);

        if (isCode) setActiveTab('preview');
        removeFile();

    } catch (e) {
        showToast("Connection Error.", "error");
    } finally {
        setRunning(false);
    }
  };

  // --- 3. EXECUTE ACTION (THE HAND) ---
  const executeAction = async () => {
      if (!pendingAction) return;
      
      // Visual Feedback
      const btn = document.getElementById('approve-btn');
      if(btn) btn.innerText = "Sending...";

      // Replace placeholders in the body
      let updatedBody = pendingAction.body;
      Object.entries(placeholderValues).forEach(([placeholder, val]) => {
          const escaped = placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          updatedBody = updatedBody.replace(new RegExp('\\[' + escaped + '\\]', 'g'), val);
      });

      const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              to: pendingAction.to,
              subject: pendingAction.subject,
              html: updatedBody
          })
      });
      const res = await response.json();
      if (res.success) {
          showToast("Email Sent Successfully!", "success");
          setPendingAction(null); // Close card
      } else {
          showToast("Failed: " + res.error, "error");
          if(btn) btn.innerText = "Try Again";
      }
  };

  // --- 4. UNIVERSAL SMART DOWNLOADER (FIXED) 🧠 ---
  const handleDownload = () => {
      if (!currentResult) return;

      let content = currentResult;
      let filename = "agent-output.txt";
      let mimeType = "text/plain";

      // --- DETECTION LOGIC ---

      // 1. WEB & UI
      if (content.includes('<!DOCTYPE html') || content.includes('<html')) {
          filename = "index.html";
          mimeType = "text/html";
          content = content.replace(/```html/g, "").replace(/```/g, "");
      } 
      else if (content.includes('import React') || content.includes('export default function')) {
          filename = "Component.jsx";
          mimeType = "text/javascript";
          content = content.replace(/```jsx/g, "").replace(/```javascript/g, "").replace(/```/g, "");
      }
      else if (content.includes('{') && content.includes('}') && content.includes(':') && !content.includes('function')) {
          try {
              JSON.parse(content); 
              filename = "data.json";
              mimeType = "application/json";
              content = content.replace(/```json/g, "").replace(/```/g, "");
          } catch (e) { /* Not JSON */ }
      }
      else if (content.includes('body {') || content.includes('margin:')) {
          filename = "styles.css";
          mimeType = "text/css";
          content = content.replace(/```css/g, "").replace(/```/g, "");
      }

      // 2. BACKEND & SCRIPTS
      else if (content.includes('def ') && content.includes('import ')) {
          filename = "script.py";
          mimeType = "text/x-python";
          content = content.replace(/```python/g, "").replace(/```/g, "");
      }
      else if (content.includes('public class') && content.includes('static void main')) {
          filename = "Main.java";
          mimeType = "text/x-java-source";
          content = content.replace(/```java/g, "").replace(/```/g, "");
      }
      // FIX: Escaped ++ for C++
      else if (content.includes('#include <iostream>')) {
          filename = "main.cpp";
          mimeType = "text/plain"; 
          content = content.replace(/```cpp/g, "").replace(/```c\+\+/g, "").replace(/```/g, "");
      }
      else if (content.includes('package main') && content.includes('func main')) {
          filename = "main.go";
          mimeType = "text/plain"; 
          content = content.replace(/```go/g, "").replace(/```/g, "");
      }
      else if (content.includes('fn main()')) {
          filename = "main.rs";
          mimeType = "text/plain"; 
          content = content.replace(/```rust/g, "").replace(/```/g, "");
      }

      // 3. DATABASE
      else if (content.includes('CREATE TABLE') || content.includes('SELECT') || content.includes('INSERT INTO')) {
          filename = "query.sql";
          mimeType = "application/sql";
          content = content.replace(/```sql/g, "").replace(/```/g, "");
      }

      // 4. DATA TABLES (Excel/CSV)
      else if (content.includes('|') && content.includes('---')) {
          filename = "data.csv";
          mimeType = "text/csv";
          const lines = content.split('\n');
          const csvLines = lines
            .filter(line => line.trim().startsWith('|') && !line.includes('---'))
            .map(line => {
                return line.split('|')
                    .slice(1, -1)
                    .map(cell => `"${cell.trim()}"`)
                    .join(',');
            });
          content = csvLines.join('\n');
      }

      // 5. DEFAULT
      else {
          filename = "document.md";
          mimeType = "text/markdown";
      }

      // --- TRIGGER DOWNLOAD ---
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  // --- 5. RENDER CONTENT SWITCHER ---
  const renderContent = () => {
      // A. SHOW ACTION APPROVAL CARD
      if (pendingAction) {
          return (
              <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-100">
                  <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full animate-in zoom-in-95">
                      <div className="flex items-center gap-3 mb-4 border-b-2 border-gray-100 pb-3">
                          <div className="bg-yellow-400 p-2 rounded-lg border-2 border-black"><Mail size={24}/></div>
                          <div>
                              <h3 className="font-black uppercase text-lg">Action Required</h3>
                              <p className="text-xs text-gray-500 font-bold uppercase">Agent wants to send an email</p>
                          </div>
                      </div>
                      
                      <div className="space-y-4 mb-6">
                          <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">To:</span>
                              <div className="font-mono text-sm font-bold bg-gray-50 p-2 rounded border border-gray-200">{pendingAction.to}</div>
                          </div>
                          <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject:</span>
                              <div className="font-mono text-sm font-medium bg-gray-50 p-2 rounded border border-gray-200">{pendingAction.subject}</div>
                          </div>

                          {/* Placeholder Form Fields */}
                          {Object.keys(placeholderValues).length > 0 && (
                              <div className="bg-yellow-50 border-2 border-black p-4 rounded-xl space-y-3">
                                  <span className="text-[10px] font-bold text-yellow-800 uppercase tracking-widest block">Complete details before sending:</span>
                                  {Object.keys(placeholderValues).map((placeholder) => (
                                      <div key={placeholder}>
                                          <label className="block text-[9px] font-black text-gray-700 uppercase mb-1 leading-none">{placeholder}</label>
                                          <input 
                                              type="text" 
                                              value={placeholderValues[placeholder]}
                                              onChange={(e) => setPlaceholderValues(prev => ({ ...prev, [placeholder]: e.target.value }))}
                                              placeholder={`Fill in: ${placeholder.split('/')[0]}`}
                                              className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none focus:ring-0"
                                          />
                                      </div>
                                  ))}
                              </div>
                          )}

                          <div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Body:</span>
                              <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs text-gray-600 max-h-32 overflow-y-auto" dangerouslySetInnerHTML={{ __html: pendingAction.body }} />
                          </div>
                      </div>

                      <button id="approve-btn" onClick={executeAction} className="w-full bg-black text-white py-3 rounded-lg font-bold uppercase hover:bg-green-600 transition flex items-center justify-center gap-2 mb-2">
                          <Send size={16} /> Approve & Send
                      </button>
                      <button onClick={() => setPendingAction(null)} className="w-full text-gray-400 text-xs font-bold uppercase hover:text-red-500 py-2">
                          Deny Request
                      </button>
                  </div>
              </div>
          )
      }

      // B. TERMINAL VIEW (CHAT LOG)
      if (activeTab === 'terminal') {
          const chatMessages = getActiveChatMessages();
          return (
             <div className="flex flex-col h-full bg-gray-50 overflow-y-auto p-6 md:p-8">
                 {chatMessages.length === 0 ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-50 h-full">
                         <Zap size={48} className="mb-4 text-black animate-bounce"/>
                         <div className="font-bold uppercase tracking-wider text-xs">Start a conversation with {agent.name.split('(')[0]}</div>
                     </div>
                 ) : (
                     <div className="space-y-6">
                         {chatMessages.map((msg) => (
                             <div key={msg.id} className="space-y-3">
                                 {/* User Message Bubble */}
                                 <div className="flex justify-end">
                                     <div className="bg-black text-white px-4 py-3 rounded-2xl border-2 border-black max-w-[80%] font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                         {msg.input}
                                     </div>
                                 </div>
                                 
                                 {/* Agent Response Bubble */}
                                 <div className="flex justify-start">
                                     <div className="bg-white border-4 border-black p-4 rounded-2xl max-w-[90%] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs text-gray-800 relative">
                                         {msg.result === "Thinking..." ? (
                                             <div className="flex items-center gap-2 font-black uppercase text-gray-500">
                                                 <Loader2 className="animate-spin" size={14} /> thinking...
                                             </div>
                                         ) : msg.type === 'code' ? (
                                             <div className="space-y-3">
                                                 <div className="font-mono bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto max-h-48">
                                                     {msg.result}
                                                 </div>
                                                 <button 
                                                     onClick={() => {
                                                         setCurrentResult(msg.result);
                                                         setActiveTab('preview');
                                                     }}
                                                     className="bg-yellow-400 text-black border-2 border-black px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-black hover:text-white transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5 flex items-center gap-1.5"
                                                 >
                                                     <Layout size={12}/> Open Visual Preview
                                                 </button>
                                             </div>
                                         ) : (
                                             <div className="whitespace-pre-wrap leading-relaxed">{msg.result}</div>
                                         )}
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
                 <div ref={logsEndRef} className="h-4" />
             </div>
          );
      }
      
      // C. PREVIEW VIEW
      if (activeTab === 'preview') {
          return (
             <div className="w-full h-full bg-white">
                 {currentResult.includes('<html') || currentResult.includes('<!DOCTYPE') ? (
                     <iframe srcDoc={currentResult} className="w-full h-full border-none" sandbox="allow-scripts" />
                 ) : (
                     <div className="flex flex-col items-center justify-center h-full text-gray-400">
                         <Layout size={48} className="mb-4"/>
                         <div>Visual preview not available.</div>
                     </div>
                 )}
             </div>
          );
      }
  };

  const getActiveChatMessages = () => {
      if (typeof window === 'undefined') return [];
      const clearTime = localStorage.getItem('chat_clear_at_' + params.id);
      let messages = [...tasks];
      if (clearTime) {
          messages = messages.filter(t => new Date(t.created_at) > new Date(clearTime));
      }
      return messages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const handleNewChat = () => {
      if (typeof window !== 'undefined') {
          localStorage.setItem('chat_clear_at_' + params.id, new Date().toISOString());
      }
      setCurrentResult("");
      setTasks(prev => [...prev]);
      showToast("Started a new chat session.", "success");
  };

  // Scroll to bottom of chat
  useEffect(() => {
      if (activeTab === 'terminal') {
          logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
  }, [tasks, activeTab]);

  // --- 6. HELPERS ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = reader.result as string;
          setSelectedFile({ name: file.name, type: file.type, base64: base64String.split(',')[1] });
      };
      reader.readAsDataURL(file);
  };
  const removeFile = () => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  const getSuggestions = () => {
      if (!agent) return [];
      const role = agent.name?.toLowerCase() || "";
      if (role.includes('backend')) return ["Design SQL Schema", "Write Node.js API"];
      if (role.includes('react')) return ["Build Landing Page", "Create React Component"];
      if (role.includes('marketing')) return ["Write Email Campaign", "Draft Tweet Thread"];
      return ["Write an Email", "Analyze Data", "Summarize File"];
  }

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

         {/* NEW CHAT BUTTON */}
         <div className="p-4 border-b border-gray-150 bg-gray-50/50">
             <button 
                 onClick={handleNewChat}
                 className="w-full bg-black hover:bg-yellow-400 text-white hover:text-black py-3 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5 flex items-center justify-center gap-2"
             >
                 <Plus size={16} /> New Chat
             </button>
         </div>

         {/* CAPABILITIES */}
         <div className="p-6 bg-yellow-50/50 border-b border-yellow-100">
             <h3 className="text-xs font-bold text-yellow-700 uppercase tracking-widest mb-3">Capabilities</h3>
             <div className="flex flex-wrap gap-2">
                 {getSuggestions().map((suggestion, i) => (
                     <button key={i} onClick={() => setTaskInput(suggestion)} className="text-xs bg-white border border-yellow-200 text-yellow-800 px-3 py-1.5 rounded-lg hover:bg-yellow-400 hover:text-black transition font-medium text-left">
                         + {suggestion}
                     </button>
                 ))}
             </div>
         </div>

         {/* HISTORY */}
         <div className="flex-1 overflow-y-auto p-4">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Work History</h3>
             <div className="space-y-2">
                 {tasks.map((t) => (
                     <div key={t.id} onClick={() => { setCurrentResult(t.result); setActiveTab(t.type === 'code' ? 'preview' : 'terminal'); setPendingAction(null); }} className="p-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl cursor-pointer transition group">
                         <div className="font-bold text-xs truncate mb-1 text-gray-800">{t.input}</div>
                         <div className="flex justify-between items-center text-[10px] text-gray-400">
                             <span>{new Date(t.created_at).toLocaleTimeString()}</span>
                             <span className={`uppercase font-bold ${t.result.includes('Busy') ? 'text-red-500' : 'text-green-600'}`}>
                                 {t.result === "Thinking..." ? "Running..." : "Success"}
                             </span>
                         </div>
                     </div>
                 ))}
             </div>
         </div>
      </div>

      {/* WORKSPACE */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-100 relative">
         {/* TABS & DOWNLOAD BAR */}
         <div className="bg-white border-b border-gray-200 px-6 pt-4 flex items-end justify-between">
             <div className="flex gap-6">
                 <button onClick={() => setActiveTab('terminal')} className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === 'terminal' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>
                    <Terminal size={16}/> Log
                 </button>
                 <button onClick={() => setActiveTab('preview')} className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition ${activeTab === 'preview' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'}`}>
                    <Layout size={16}/> Preview
                 </button>
             </div>
             
             {/* THE SMART DOWNLOAD BUTTON */}
             {currentResult && !pendingAction && (
                 <button 
                    onClick={handleDownload}
                    className="mb-3 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:bg-yellow-400 hover:text-black transition shadow-md"
                 >
                     <Download size={16}/> Download Output
                 </button>
             )}
         </div>

         {isTrial && !trialExpired && (
             <div className="bg-yellow-100 border-b border-yellow-200 px-6 py-3 text-xs font-bold text-yellow-800 flex justify-between items-center z-10 animate-in slide-in-from-top">
                 <span>{getTrialBannerText()}</span>
                 <button onClick={handlePurchase} className="bg-black text-white hover:bg-yellow-400 hover:text-black transition-all px-3 py-1.5 rounded font-black uppercase text-[10px] border border-black shadow">
                     Hire Permanent
                 </button>
             </div>
         )}
 
          {/* DISPLAY CONTENT (Action Card or Logs) */}
          <div className="flex-1 overflow-auto relative">
              {renderContent()}
          </div>
 
          {/* INPUT AREA */}
          {trialExpired ? (
              <div className="bg-yellow-50 border-t-4 border-yellow-400 p-6 z-30 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                      <h4 className="text-lg font-black uppercase text-black flex items-center gap-2">
                          🔒 Workstation Locked
                      </h4>
                      <p className="text-sm font-semibold text-gray-600 mt-1">
                          Your 3-day free trial for this agent has expired. Upgrade now to unlock and keep working.
                      </p>
                  </div>
                  <button 
                    onClick={handlePurchase} 
                    className="bg-black text-white hover:bg-yellow-400 hover:text-black transition px-6 py-3 rounded-xl font-bold uppercase text-sm border-2 border-black tracking-wide shrink-0 shadow-lg"
                  >
                      Upgrade to Hired
                  </button>
              </div>
          ) : (
              <div className="bg-white border-t border-gray-200 p-6 z-30">
                  {selectedFile && (
                      <div className="mb-2 inline-flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-xs font-bold border border-gray-300">
                          <Paperclip size={12}/> {selectedFile.name}
                          <button onClick={removeFile} className="hover:text-red-500"><X size={12}/></button>
                      </div>
                  )}
                  <div className="relative">
                      <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,.pdf,.txt,.js,.py,.html,.css,.json,.md" />
                      <button onClick={() => fileInputRef.current?.click()} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition p-2" title="Attach File">
                         <Paperclip size={20} />
                      </button>
                      <input 
                         type="text" 
                         value={taskInput}
                         onChange={(e) => setTaskInput(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleRun()}
                         placeholder={selectedFile ? "What should I do with this file?" : "Describe your task (e.g. 'Send email to...')"}
                         className="w-full pl-12 pr-32 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white text-lg transition shadow-sm"
                      />
                      <button onClick={() => handleRun()} disabled={running} className="absolute right-2 top-2 bottom-2 bg-black text-white px-6 rounded-lg font-bold uppercase tracking-wide hover:bg-yellow-400 hover:text-black transition flex items-center gap-2 disabled:opacity-50">
                         {running ? "..." : <><Play size={16} fill="white" className="text-current"/> Run</>}
                      </button>
                  </div>
              </div>
          )}
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