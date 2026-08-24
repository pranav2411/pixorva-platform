"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Oswald, Inter } from "next/font/google";
import { 
  ArrowLeft, Plus, Zap, Trash2, LogOut, Send, 
  Users, Activity, Lock, FileCode, CheckCircle, RefreshCw, X, Folder, HelpCircle, Layout,
  Megaphone, DollarSign, ShieldCheck, User as UserIcon, Mail, MessageSquare, Play, Globe, Clock, Database, Twitter, PenTool, Target, Briefcase, PieChart, Camera, Clipboard, Video, Smartphone, Search
} from "lucide-react";
import { createClient } from '../utils/supabase/client';
import { useRouter } from "next/navigation";
import { showToast } from '../utils/Toast';
import { getVaultFiles, saveVaultFile, deleteVaultFile, VaultFile } from "../utils/VaultStorage";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

interface Agent {
  id: string;
  name: string;
  goal?: string;
  instructions?: string;
  icon?: string;
  schedule: string;
  steps: { name: string; icon: string; type?: string }[];
  created_at?: string;
}

interface Channel {
  id: string;
  name: string;
  agents: string[]; // List of agent IDs
}

function getIcon(name: string) {
  switch (name) {
    case "Code": return <FileCode size={20} />;
    case "Megaphone": return <Megaphone size={20} />;
    case "DollarSign": return <DollarSign size={20} />;
    case "ShieldCheck": return <ShieldCheck size={20} />;
    case "User": return <UserIcon size={20} />;
    case "Zap": return <Zap size={20} />;
    case "Mail": return <Mail size={20} />;
    case "Send": return <Send size={20} />;
    case "MessageSquare": return <MessageSquare size={20} />;
    case "Play": return <Play size={20} />;
    case "Globe": return <Globe size={20} />;
    case "Clock": return <Clock size={20} />;
    case "Database": return <Database size={20} />;
    case "Twitter": return <Twitter size={20} />;
    case "PenTool": return <PenTool size={20} />;
    case "Target": return <Target size={20} />;
    case "Briefcase": return <Briefcase size={20} />;
    case "Users": return <Users size={20} />;
    case "PieChart": return <PieChart size={20} />;
    case "Camera": return <Camera size={20} />;
    case "Lock": return <Lock size={20} />;
    case "Clipboard": return <Clipboard size={20} />;
    case "Video": return <Video size={20} />;
    case "CheckCircle": return <CheckCircle size={20} />;
    case "Smartphone": return <Smartphone size={20} />;
    case "Search": return <Search size={20} />;
    default: return <Zap size={20} />;
  }
}

function ChatMessage({ text }: { text: string }) {
  if (!text) return null;

  // Split text by code blocks ```
  const parts = text.split("```");
  
  const handleCopy = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    showToast("Code copied to clipboard!", "success");
  };

  return (
    <div className="space-y-2 leading-relaxed">
      {parts.map((part, index) => {
        const isCodeBlock = index % 2 === 1;
        if (isCodeBlock) {
          // The first line might contain the language name (e.g. javascript)
          const lines = part.split("\n");
          let language = "";
          let codeContent = part;
          if (lines.length > 0 && lines[0].trim().match(/^[a-zA-Z0-9_-]+$/)) {
            language = lines[0].trim();
            codeContent = lines.slice(1).join("\n");
          }
          
          return (
            <div key={index} className="relative group border-2 border-black rounded-lg my-3 overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-gray-950 text-gray-100 font-mono text-[11px]">
              <div className="bg-black text-gray-400 px-4 py-1.5 text-[9px] font-black uppercase flex justify-between items-center border-b border-gray-800">
                <span>{language || "code"}</span>
                <button
                  onClick={() => handleCopy(codeContent)}
                  className="bg-yellow-400 text-black border border-black px-2 py-0.5 rounded text-[8px] font-black hover:bg-white transition"
                >
                  Copy
                </button>
              </div>
              <pre className="p-4 overflow-x-auto select-text">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        } else {
          // Render standard text, splitting by lines
          return (
            <div key={index} className="space-y-1.5">
              {part.split("\n").map((line, lIdx) => {
                if (!line.trim()) return <div key={lIdx} className="h-2" />;
                // Handle bold formatting **bold**
                const boldRegex = /\*\*([^*]+)\*\*/g;
                const boldParts = [];
                let lastIndex = 0;
                let match;
                while ((match = boldRegex.exec(line)) !== null) {
                  if (match.index > lastIndex) {
                    boldParts.push(line.substring(lastIndex, match.index));
                  }
                  boldParts.push(<strong key={match.index} className="font-black text-black">{match[1]}</strong>);
                  lastIndex = boldRegex.lastIndex;
                }
                if (lastIndex < line.length) {
                  boldParts.push(line.substring(lastIndex));
                }
                
                return (
                  <p key={lIdx} className="m-0 leading-relaxed">
                    {boldParts.length > 0 ? boldParts : line}
                  </p>
                );
              })}
            </div>
          );
        }
      })}
    </div>
  );
}

export default function WorkspacePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);

  // --- WORKSPACE TABS ---
  const [activeTab, setActiveTab] = useState<"office" | "channels" | "vault">("office");

  // --- MULTI-AGENT CHANNELS ---
  const [channels, setChannels] = useState<Channel[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pixorva_channels");
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return [
      { id: "ch-general", name: "general", agents: [] },
      { id: "ch-engineering", name: "engineering", agents: [] }
    ];
  });
  const [selectedChId, setSelectedChId] = useState<string>("ch-general");
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  
  const [typingAgentName, setTypingAgentName] = useState<string | null>(null);
  const [channelViewMode, setChannelViewMode] = useState<"chat" | "preview">("chat");

  const getLatestCodeInChannel = () => {
    const msgs = channelMessages[selectedChId] || [];
    for (let i = msgs.length - 1; i >= 0; i--) {
      const msg = msgs[i];
      if (msg.text && msg.text.includes("```")) {
        const parts = msg.text.split("```");
        for (let j = parts.length - 1; j >= 0; j--) {
          if (j % 2 === 1) {
            const part = parts[j];
            const lines = part.split("\n");
            let codeContent = part;
            if (lines.length > 0 && lines[0].trim().match(/^[a-zA-Z0-9_-]+$/)) {
              codeContent = lines.slice(1).join("\n");
            }
            if (codeContent.includes("<html") || codeContent.includes("<!DOCTYPE") || codeContent.includes("React") || codeContent.includes("const") || codeContent.includes("function")) {
              return codeContent;
            }
          }
        }
      }
    }
    return null;
  };

  const getCleanedPreviewHtml = (rawCode: string) => {
    if (!rawCode) return "";
    let clean = rawCode;
    if (clean.startsWith("```")) {
        const lines = clean.split("\n");
        clean = lines.slice(1, lines.length - 1).join("\n");
    }
    if (clean.includes('<html') || clean.includes('<!DOCTYPE')) {
        return clean;
    }
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { font-family: system-ui, sans-serif; padding: 20px; background: #f9fafb; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script>
          try {
            ${clean}
          } catch (e) {
            document.body.innerHTML = '<div style="color: red; font-weight: bold; border: 2px solid red; padding: 15px; border-radius: 8px; background: #fef2f2;">Sandbox runtime error: ' + e.message + '</div>';
          }
        </script>
      </body>
      </html>
    `;
  };
  const [channelMessages, setChannelMessages] = useState<Record<string, any[]>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pixorva_channel_messages");
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
    }
    return {
      "ch-general": [
        { sender: "System", text: "Welcome to #general. Toggle which hired employees are active in this channel to collaborate.", time: "12:00 PM" }
      ],
      "ch-engineering": [
        { sender: "System", text: "Welcome to #engineering. Enable agents in the right panel and send a prompt to watch them collaborate.", time: "12:00 PM" }
      ]
    };
  });
  const [channelPrompt, setChannelPrompt] = useState("");
  const [sendingChannelMsg, setSendingChannelMsg] = useState(false);

  // --- KNOWLEDGE VAULT ---
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  const [vaultToggle, setVaultToggle] = useState(false);
  const [showAddFile, setShowAddFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");

  const activeChannel = channels.find(c => c.id === selectedChId) || channels[0];

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          router.push("/login");
          return;
        }
        setUser(currentUser);

        // Fetch hired agents from Supabase
        const { data: agents } = await supabase
          .from('agents')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (agents) {
          setMyAgents(agents);
          // Channels start with empty active agents selection by default
        }

        // Load Vault Files
        const files = getVaultFiles(currentUser.id);
        setVaultFiles(files);

      } catch (err) {
        console.error("Workspace load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspaceData();
  }, [router]);

  // Save channels to localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && channels.length > 0) {
      localStorage.setItem("pixorva_channels", JSON.stringify(channels));
    }
  }, [channels]);

  // Save channelMessages to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pixorva_channel_messages", JSON.stringify(channelMessages));
    }
  }, [channelMessages]);

  const confirmDelete = async () => {
    if (!deletingAgentId) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from('agents').delete().eq('id', deletingAgentId);
      if (error) throw error;
      
      showToast("Agent deleted successfully!", "success");
      setMyAgents(prev => prev.filter(a => a.id !== deletingAgentId));
    } catch (err: any) {
      showToast("Error deleting agent: " + err.message, "error");
    } finally {
      setDeletingAgentId(null);
    }
  };

  // --- MULTI-AGENT CHANNELS TRIGGERS ---
  const handleAddChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    const cleanName = newChannelName.toLowerCase().replace(/\s+/g, '-');
    const newChan: Channel = {
      id: `ch-${Date.now()}`,
      name: cleanName,
      agents: [] // No agents selected by default
    };
    setChannels(prev => [...prev, newChan]);
    setSelectedChId(newChan.id);
    setChannelMessages(prev => ({
      ...prev,
      [newChan.id]: [{ sender: "System", text: `Welcome to #${cleanName}. Select agents in the right panel to begin collaboration.`, time: "Just now" }]
    }));
    setNewChannelName("");
    setShowAddChannel(false);
    showToast(`Channel #${cleanName} created!`, "success");
  };

  const handleDeleteChannel = (chId: string) => {
    if (chId === "ch-general") return; // Prevent deleting default channel
    setChannels(prev => prev.filter(c => c.id !== chId));
    setChannelMessages(prev => {
      const copy = { ...prev };
      delete copy[chId];
      return copy;
    });
    setSelectedChId("ch-general");
    showToast("Channel deleted successfully", "success");
  };

  const handleSendChannelMessage = async () => {
    if (!channelPrompt.trim() || !user) return;
    setSendingChannelMsg(true);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      sender: "You",
      text: channelPrompt,
      time: nowStr
    };

    const currentMsgs = channelMessages[activeChannel.id] || [];
    const updatedMsgs = [...currentMsgs, userMsg];
    setChannelMessages(prev => ({ ...prev, [activeChannel.id]: updatedMsgs }));

    const userPrompt = channelPrompt;
    const channelAgents = myAgents.filter(a => activeChannel.agents.includes(a.id));
    if (channelAgents.length === 0) {
      showToast("Please check at least one agent on the right to participate.", "error");
      setSendingChannelMsg(false);
      return;
    }
    setChannelPrompt("");

    try {
      // Build RAG prompt context
      let vaultContext = "";
      if (vaultToggle && vaultFiles.length > 0) {
        vaultContext = "\n\n[CONTEXT FILES FROM KNOWLEDGE BASE]:\n" + 
          vaultFiles.map(f => `--- File: ${f.name} ---\n${f.content}`).join("\n\n");
      }

      let lastResponse = "";

      for (let i = 0; i < channelAgents.length; i++) {
        const agent = channelAgents[i];
        const shortName = agent.name.split('(')[0].trim();
        
        // Set typing indicator
        setTypingAgentName(shortName);

        // Brief delay for visual response sequencing
        await new Promise(res => setTimeout(res, 850));

        let queryInput = userPrompt;
        if (i > 0) {
          queryInput = `User's prompt: "${userPrompt}"\n\nPrevious Agent (${channelAgents[i-1].name}) responded: "${lastResponse}"\n\nPlease reply or build on their answer.`;
        }

        if (vaultContext) {
          queryInput += vaultContext;
        }

        const res = await fetch('/api/run-agent', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: queryInput,
            agentId: agent.id,
            userId: user.id,
            agentRole: agent.name
          })
        });

        const data = await res.json();
        if (data.result) {
          lastResponse = data.result;
          const agentMsg = {
            sender: shortName,
            icon: agent.icon || "Zap",
            text: data.result,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setChannelMessages(prev => {
            const list = prev[activeChannel.id] || [];
            return { ...prev, [activeChannel.id]: [...list, agentMsg] };
          });
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Collaboration relay failed.", "error");
    } finally {
      setTypingAgentName(null);
      setSendingChannelMsg(false);
    }
  };

  // --- FILE VAULT TRIGGERS ---
  const handleAddFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim() || !newFileContent.trim() || !user) return;

    const updated = saveVaultFile(user.id, {
      name: newFileName,
      size: `${(newFileContent.length / 1024).toFixed(1)} KB`,
      content: newFileContent
    });

    setVaultFiles(updated);
    setNewFileName("");
    setNewFileContent("");
    setShowAddFile(false);
    showToast("File integrated into Vault!", "success");
  };

  const handleDeleteFile = (id: string) => {
    if (!user) return;
    const updated = deleteVaultFile(user.id, id);
    setVaultFiles(updated);
    showToast("File deleted from Vault.", "success");
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${inter.className}`}>
        <div className="bg-white border-4 border-black p-8 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center max-w-sm">
          <RefreshCw className="animate-spin mx-auto text-black mb-4" size={32} />
          <h3 className={`text-xl uppercase ${oswald.className}`}>Loading Workspace...</h3>
          <p className="text-xs text-gray-500 font-bold uppercase mt-2">Connecting Workspace Context</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen max-h-screen bg-gray-50 text-black flex flex-col justify-between overflow-hidden ${inter.className}`}>
      
      {/* HEADER */}
      <nav className="bg-white border-b-4 border-black z-20 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="bg-black text-white p-2 rounded hover:bg-yellow-400 hover:text-black transition border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-y-1">
              <ArrowLeft size={20}/>
            </Link>
            <div>
              <h1 className={`text-2xl md:text-3xl uppercase ${oswald.className} tracking-tighter leading-none`}>Workspace Dashboard</h1>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Multi-Agent & Resource Vault</span>
            </div>
          </div>
          <div className="bg-yellow-400 text-black border-2 border-black px-3 py-1.5 rounded font-black text-xs uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            Active Office Session
          </div>
        </div>
      </nav>

      {/* WORKSPACE LAYOUT CONTAINER */}
      <main className="flex-grow p-4 lg:p-6 overflow-hidden flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 border-4 border-black rounded-3xl overflow-hidden bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex-grow h-[calc(100vh-220px)] lg:h-[calc(100vh-160px)]">
          
          {/* SIDEBAR NAVIGATION PANEL (3 COLS) */}
          <div className="lg:col-span-3 bg-gray-50 border-b-4 lg:border-b-0 lg:border-r-4 border-black p-4 lg:p-6 flex flex-col justify-between overflow-hidden shrink-0">
            <div className="flex-grow overflow-y-auto space-y-4 lg:space-y-6 pr-1">
              <div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Workspace Hub</span>
                <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible no-scrollbar pb-2 lg:pb-0">
                  <button 
                    onClick={() => setActiveTab("office")}
                    className={`shrink-0 text-center p-2.5 lg:p-3 rounded-xl border-2 border-black font-black uppercase text-[10px] lg:text-xs transition ${activeTab === 'office' ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]' : 'bg-white hover:bg-yellow-50 text-black'}`}
                  >
                    Hired Office
                  </button>
                  <button 
                    onClick={() => setActiveTab("channels")}
                    className={`shrink-0 text-center p-2.5 lg:p-3 rounded-xl border-2 border-black font-black uppercase text-[10px] lg:text-xs transition ${activeTab === 'channels' ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]' : 'bg-white hover:bg-yellow-50 text-black'}`}
                  >
                    Active Channels
                  </button>
                  <button 
                    onClick={() => setActiveTab("vault")}
                    className={`shrink-0 text-center p-2.5 lg:p-3 rounded-xl border-2 border-black font-black uppercase text-[10px] lg:text-xs transition ${activeTab === 'vault' ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]' : 'bg-white hover:bg-yellow-50 text-black'}`}
                  >
                    File Vault
                  </button>
                </div>
              </div>

              {activeTab === "channels" && (
                <div className="flex flex-col flex-grow overflow-hidden">
                  <div className="flex justify-between items-center mb-2 flex-shrink-0">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Channels</span>
                    <button onClick={() => setShowAddChannel(!showAddChannel)} className="bg-black text-white text-[9px] font-black uppercase px-2 py-0.5 rounded border border-black hover:bg-yellow-400 hover:text-black">
                      + New
                    </button>
                  </div>

                  {showAddChannel && (
                    <form onSubmit={handleAddChannelSubmit} className="bg-yellow-50 border-2 border-black p-3 rounded-xl mb-3 space-y-2 text-black flex-shrink-0">
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. database-design" 
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        className="w-full text-xs p-1.5 bg-white border-2 border-black rounded focus:outline-none"
                      />
                      <button type="submit" className="w-full bg-black text-white text-[10px] font-black uppercase py-1.5 rounded hover:bg-yellow-400 hover:text-black">Create</button>
                    </form>
                  )}

                  <div className="space-y-1 overflow-y-auto pr-1 flex-grow max-h-[140px] lg:max-h-[220px]">
                    {channels.map((ch) => (
                      <div key={ch.id} className="group flex items-center justify-between gap-1 w-full">
                        <button 
                          onClick={() => setSelectedChId(ch.id)}
                          className={`flex-grow text-left text-xs font-bold px-3 py-2 rounded-lg border-2 transition ${ch.id === selectedChId ? 'bg-yellow-400 border-black text-black' : 'border-transparent text-gray-600 hover:bg-gray-100'}`}
                        >
                          # {ch.name}
                        </button>
                        {ch.id !== "ch-general" && (
                          <button 
                            onClick={() => handleDeleteChannel(ch.id)}
                            className="text-gray-300 hover:text-red-600 transition p-1.5 flex-shrink-0"
                            title="Delete Channel"
                          >
                            <Trash2 size={14}/>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t-2 border-gray-200 flex flex-row lg:flex-col gap-2 flex-shrink-0 text-center overflow-x-auto no-scrollbar">
              <Link href="/governance" className="shrink-0 px-4 py-2 bg-black text-white hover:bg-yellow-400 hover:text-black transition rounded-xl border-2 border-black text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]">
                Control Tower
              </Link>
              <Link href="/billing" className="shrink-0 px-4 py-2 bg-white text-black hover:bg-gray-100 transition rounded-xl border-2 border-black text-[10px] font-black uppercase">
                Manage Salaries
              </Link>
              <Link href="/settings" className="shrink-0 px-4 py-2 bg-white text-black hover:bg-gray-100 transition rounded-xl border-2 border-black text-[10px] font-black uppercase">
                Settings
              </Link>
            </div>
          </div>

          {/* MAIN PANELS CONTAINER (9 COLS) */}
          <div className="lg:col-span-9 p-8 flex flex-col h-full overflow-hidden">
            
            {/* TAB 1: HIRED OFFICE PANEL */}
            {activeTab === "office" && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-end mb-6 border-b-4 border-black pb-4 flex-shrink-0">
                  <h2 className={`text-4xl uppercase ${oswald.className}`}>Hired Employees</h2>
                  <span className="font-bold text-gray-500 text-xs">{myAgents.filter(a => a.name !== "Governance Control Tower").length} Online</span>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 pb-6">
                  {myAgents.filter(a => a.name !== "Governance Control Tower").length === 0 ? (
                    <div className="text-center py-20 border-4 border-dashed border-gray-300 rounded-3xl bg-gray-50 flex flex-col items-center">
                      <Users size={36} className="text-gray-400 mb-3" />
                      <h3 className="text-lg font-bold text-gray-800">Your office is empty!</h3>
                      <p className="text-xs text-gray-500 mb-4 max-w-xs leading-normal">You haven&apos;t hired any individual employees yet. Visit the Marketplace to hire Devon or Ruby.</p>
                      <Link href="/employees">
                        <button className="bg-black text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase hover:bg-yellow-400 hover:text-black transition border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.15)]">
                          Go to Marketplace
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myAgents.filter(a => a.name !== "Governance Control Tower").map((agent) => (
                        <div key={agent.id} className="border-4 border-black bg-white rounded-2xl p-5 flex flex-col justify-between hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition">
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <div className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center border-2 border-black">
                                {getIcon(agent.steps?.[0]?.icon || agent.icon || "Zap")}
                              </div>
                              <button onClick={() => setDeletingAgentId(agent.id)} className="text-gray-300 hover:text-red-600 transition">
                                <Trash2 size={16}/>
                              </button>
                            </div>
                            <h4 className="font-black text-sm uppercase leading-none">{agent.name.split('(')[0]}</h4>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mt-1.5 block">{agent.name.split('(')[1]?.replace(')', '') || 'Custom Employee'}</p>
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Link href={`/agent/${agent.id}`} className="flex-1">
                              <button className="w-full bg-black text-white py-2 rounded-lg font-bold text-[10px] uppercase hover:bg-yellow-400 hover:text-black transition">
                                Connect Chat
                              </button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: ACTIVE COLLABORATION CHANNELS PANEL */}
            {activeTab === "channels" && (
              <div className="flex-grow flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
                
                {/* Chat window panel */}
                <div className="flex-grow flex flex-col justify-between bg-white border-4 border-black rounded-2xl overflow-hidden shadow h-full">
                  
                  {/* Header with Visual Preview mode switch */}
                  <div className="bg-black text-white p-3 flex flex-col sm:flex-row justify-between items-center gap-2 flex-shrink-0 border-b-4 border-black">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <h3 className="font-black uppercase text-xs"># {activeChannel.name}</h3>
                      <div className="flex border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
                        <button
                          onClick={() => setChannelViewMode("chat")}
                          className={`px-3 py-1 text-[9px] font-black uppercase transition ${channelViewMode === 'chat' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                          💬 Chat Feed
                        </button>
                        <button
                          onClick={() => setChannelViewMode("preview")}
                          className={`px-3 py-1 text-[9px] font-black uppercase transition ${channelViewMode === 'preview' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                          🖥️ Live Sandbox
                        </button>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-yellow-400 uppercase">{activeChannel.agents.length} active agents</span>
                  </div>

                  {/* Toggle Content Pane: Chat or Preview Sandbox */}
                  {channelViewMode === 'chat' ? (
                    <div className="p-4 flex-grow space-y-4 overflow-y-auto bg-gray-50/50 h-[calc(100vh-420px)] lg:h-[calc(100vh-380px)]">
                      {activeChannel.agents.length === 0 && (
                        <div className="bg-yellow-50 border-4 border-black p-6 rounded-2xl text-center max-w-sm mx-auto my-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <Users className="mx-auto text-yellow-600 mb-3" size={32}/>
                          <h4 className="font-black text-xs uppercase text-yellow-800">No Active Agents</h4>
                          <p className="text-[10px] text-yellow-700 leading-normal mt-2">
                            Select which of your hired employees should participate in this channel by checking them in the sidebar on the right.
                          </p>
                        </div>
                      )}
                      {(channelMessages[activeChannel.id] || []).map((msg, idx) => {
                        const isYou = msg.sender === "You";
                        const isSys = msg.sender === "System";
                        return (
                          <div key={idx} className={`flex flex-col ${isYou ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-1.5 mb-1">
                              {!isYou && !isSys && <span className="text-xs">{msg.icon}</span>}
                              <span className="text-[9px] font-bold text-gray-400 uppercase">{msg.sender}</span>
                              <span className="text-[8px] text-gray-400">{msg.time}</span>
                            </div>
                            <div className={`p-3 rounded-xl border-2 border-black text-xs max-w-md ${isYou ? 'bg-yellow-100 text-black' : isSys ? 'bg-gray-100 text-gray-500 border-dashed' : 'bg-white text-black'}`}>
                              <ChatMessage text={msg.text} />
                            </div>
                          </div>
                        );
                      })}

                      {/* Animated Typing Indicator */}
                      {typingAgentName && (
                        <div className="flex items-center gap-3 bg-yellow-50 border-2 border-black p-3.5 rounded-xl text-xs font-bold text-black w-fit animate-pulse shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mt-2">
                          <div className="flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce delay-200"></span>
                          </div>
                          <span>{typingAgentName} is thinking...</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-grow bg-white h-[calc(100vh-420px)] lg:h-[calc(100vh-380px)]">
                      {getLatestCodeInChannel() ? (
                        <iframe 
                          srcDoc={getCleanedPreviewHtml(getLatestCodeInChannel()!)} 
                          className="w-full h-full border-none" 
                          sandbox="allow-scripts" 
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400 bg-gray-50/50">
                          <Layout size={40} className="mb-2 text-black" />
                          <p className="text-xs font-black uppercase text-black">No Preview Available</p>
                          <p className="text-[10px] text-gray-500 mt-1 max-w-xs leading-normal">
                            Ask active developers in the chat feed to create webpages or interfaces, and they will compile visually right here!
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chat Input panel */}
                  <div className="p-3 bg-white border-t-4 border-black flex gap-2 items-center flex-shrink-0">
                    
                    {/* RAG Context switch */}
                    <button 
                      onClick={() => setVaultToggle(!vaultToggle)}
                      className={`px-3 py-2 border-2 border-black rounded-lg text-[9px] font-black uppercase transition whitespace-nowrap ${vaultToggle ? 'bg-green-400 text-black border-black' : 'bg-gray-100 text-gray-400'}`}
                    >
                      RAG Vault: {vaultToggle ? 'ON' : 'OFF'}
                    </button>

                    <input 
                      type="text" 
                      disabled={sendingChannelMsg}
                      value={channelPrompt}
                      onChange={(e) => setChannelPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChannelMessage()}
                      placeholder={`Message #${activeChannel.name}...`}
                      className="flex-grow text-xs p-2.5 bg-gray-50 border-2 border-black rounded-lg focus:outline-none text-black"
                    />
                    <button 
                      disabled={sendingChannelMsg || !channelPrompt.trim()}
                      onClick={handleSendChannelMessage}
                      className="bg-black text-white hover:bg-yellow-400 hover:text-black p-2.5 rounded-lg border-2 border-black transition disabled:opacity-50"
                    >
                      <Send size={14}/>
                    </button>
                  </div>

                </div>

                {/* Checked agents in channel settings */}
                <div className="border-4 border-black p-4 w-full lg:w-56 bg-yellow-50 rounded-2xl h-full overflow-y-auto">
                  <h4 className="font-black text-[10px] uppercase mb-3 text-yellow-800 pb-1.5 border-b border-yellow-200">Agents in Channel</h4>
                  <div className="space-y-2">
                    {myAgents.filter(a => a.name !== "Governance Control Tower").map((agent) => {
                      const inChannel = activeChannel.agents.includes(agent.id);
                      return (
                        <label key={agent.id} className="flex items-center gap-2 cursor-pointer p-1.5 border-2 border-black rounded-lg text-[10px] font-bold bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition">
                          <input 
                            type="checkbox"
                            checked={inChannel}
                            onChange={() => {
                              setChannels(prev => prev.map(c => {
                                if (c.id === selectedChId) {
                                  const updatedAgents = inChannel 
                                    ? c.agents.filter(aid => aid !== agent.id)
                                    : [...c.agents, agent.id];
                                  return { ...c, agents: updatedAgents };
                                }
                                return c;
                              }));
                            }}
                            className="accent-black"
                          />
                          <span>{agent.name.split('(')[0]}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: FILE VAULT KNOWLEDGE BASE PANEL */}
            {activeTab === "vault" && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-end mb-6 border-b-4 border-black pb-4 flex-shrink-0">
                  <div>
                    <h2 className={`text-4xl uppercase ${oswald.className}`}>Workspace File Vault</h2>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">RAG Document Storage</span>
                  </div>
                  <button 
                    onClick={() => setShowAddFile(!showAddFile)}
                    className="bg-black text-white hover:bg-yellow-400 hover:text-black transition text-xs font-bold uppercase px-3 py-1.5 rounded border border-black"
                  >
                    + Integrate File
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 pb-6">
                  {showAddFile ? (
                    <form onSubmit={handleAddFileSubmit} className="bg-yellow-50 border-2 border-black p-5 rounded-2xl mb-6 space-y-3 max-w-xl text-black">
                      <h4 className="text-xs font-black uppercase text-yellow-800">Upload Knowledge Document</h4>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-[8px] font-black uppercase text-gray-600">File Name *</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="e.g. database-specs.txt" 
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-black uppercase text-gray-600">Document Content *</label>
                          <textarea 
                            required 
                            rows={5}
                            placeholder="Paste text specs, codes, or instructions..." 
                            value={newFileContent}
                            onChange={(e) => setNewFileContent(e.target.value)}
                            className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="flex-grow bg-black text-white text-xs font-bold uppercase py-2 rounded hover:bg-yellow-400 hover:text-black transition">Verify & Upload</button>
                        <button type="button" onClick={() => setShowAddFile(false)} className="px-4 bg-white border-2 border-black py-2 rounded text-xs font-bold uppercase hover:bg-red-50 transition">Cancel</button>
                      </div>
                    </form>
                  ) : null}

                  {vaultFiles.length === 0 ? (
                    <div className="text-center py-20 border-4 border-dashed border-gray-300 rounded-3xl bg-gray-50 flex flex-col items-center">
                      <Folder size={36} className="text-gray-400 mb-3" />
                      <h4 className="font-bold text-sm uppercase">Vault is empty</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-xs leading-normal">
                        Connect context files (API docs, DB schemas, system specs) so Devon or Ruby can read them dynamically.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vaultFiles.map((file) => (
                        <div 
                          key={file.id}
                          className="bg-white border-4 border-black p-4 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-yellow-100 p-2 rounded-lg border border-black"><FileCode size={18}/></div>
                            <div>
                              <h5 className="font-bold text-xs uppercase text-gray-700 leading-none">{file.name}</h5>
                              <span className="text-[9px] font-semibold text-gray-400 block mt-1">{file.size} • Uploaded {file.uploadedAt}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteFile(file.id)}
                            className="text-gray-300 hover:text-red-600 transition"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>
        </div>
      </main>

      {/* CONFIRM DELETE MODAL */}
      {deletingAgentId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black p-6 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full animate-in zoom-in-95 duration-200">
            <h3 className={`text-2xl uppercase ${oswald.className} text-red-600 mb-2`}>Terminate Contract?</h3>
            <p className="text-xs text-gray-600 font-medium mb-6">
              This will immediately fire the selected AI Employee. You will lose active connection access to this chatbot workspace.
            </p>
            <div className="flex gap-3">
              <button onClick={confirmDelete} className="flex-1 bg-red-600 text-white hover:bg-black transition py-3 rounded-lg border-2 border-black font-bold uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none">Fire Employee</button>
              <button onClick={() => setDeletingAgentId(null)} className="flex-1 bg-white hover:bg-gray-50 transition py-3 rounded-lg border-2 border-black font-bold uppercase text-xs">Keep Contract</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
