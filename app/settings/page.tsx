"use client";

import { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Oswald, Inter } from "next/font/google";
import { ArrowLeft, Save, User as UserIcon, Loader2, Zap, X, Trash2, Shield, User, CreditCard, Key, Activity, Smartphone } from "lucide-react";
import Link from 'next/link';
import { showToast } from '../utils/Toast';

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [plan, setPlan] = useState('free');
  
  const [subscriptionAgents, setSubscriptionAgents] = useState<any[]>([]);
  const [paidAgents, setPaidAgents] = useState<any[]>([]);
  
  // Modal toggles
  const [showCancelModal, setShowCancelModal] = useState(false); // Growth Pro/Enterprise
  const [showCancelGovModal, setShowCancelGovModal] = useState(false); // Governance Control Tower
  const [selectedAgentToCancel, setSelectedAgentToCancel] = useState<any | null>(null); // Individual hired employee
  const [cancelling, setCancelling] = useState(false);

  // Compliance States
  const [showErasureModal, setShowErasureModal] = useState(false);
  const [erasing, setErasing] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<{ id: string; name: string; token: string; created: string; usedToday: number; dailyLimit: number }[]>([]);
  const [newKeyName, setNewKeyName] = useState('');

  // Playground States
  const [selectedPlaygroundKey, setSelectedPlaygroundKey] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [availablePlaygroundAgents, setAvailablePlaygroundAgents] = useState<{ id: string; name: string }[]>([]);
  const [playgroundPrompt, setPlaygroundPrompt] = useState('Explain why Pixorva is fast in one sentence.');
  const [playgroundResult, setPlaygroundResult] = useState('');
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  // Real server-side dynamic states
  const [tokensUsed, setTokensUsed] = useState(0);
  const [runHours, setRunHours] = useState(0);
  const [activeSession, setActiveSession] = useState<{ device: string; ip: string; location: string } | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [vaultMegaBytes, setVaultMegaBytes] = useState("0.00");

  // 1. Load User Data
  useEffect(() => {
    const getProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        setEmail(user.email || '');
        
        // Fetch Profile Data
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name, plan')
            .eq('id', user.id)
            .single();

        if (data) {
            setFullName(data.full_name || '');
            setPlan(data.plan || 'free');
        }

        // Fetch Agents
        const { data: agentsData } = await supabase
            .from('agents')
            .select('*')
            .eq('user_id', user.id);

        if (agentsData) {
            setSubscriptionAgents(agentsData.filter((a: any) => !a.is_paid_individually));
            setPaidAgents(agentsData.filter((a: any) => a.is_paid_individually));
            const activeAgentsList = agentsData
              .filter((a: any) => a.schedule !== 'API_KEY' && a.schedule !== 'INVOICE')
              .map((a: any) => ({ id: a.id, name: a.name }));
            setAvailablePlaygroundAgents(activeAgentsList);
            if (activeAgentsList.length > 0) {
              setSelectedAgentId(activeAgentsList[0].id);
            }
        }

        // Load API Keys, Payments, Usage telemetry from Server
        try {
          const res = await fetch('/api/settings/data');
          const serverData = await res.json();
          if (serverData.success) {
            setApiKeys(serverData.apiKeys || []);
            if (serverData.apiKeys && serverData.apiKeys.length > 0) {
              setSelectedPlaygroundKey(serverData.apiKeys[0].token);
            }
            setPayments(serverData.payments || []);
            if (serverData.usage) {
              setTokensUsed(serverData.usage.tokensUsed || 0);
              setRunHours(serverData.usage.runHours || 0);
            }
            if (serverData.session) {
              setActiveSession(serverData.session);
            }
          }
        } catch (serverErr) {
          console.error("Failed to load settings data from server:", serverErr);
        }

        // Load RAG File Vault dynamically from local storage files
        try {
          const { getVaultFiles } = require('../utils/VaultStorage');
          const files = getVaultFiles(user.id);
          const totalBytes = files.reduce((acc: number, f: any) => acc + (f.content ? f.content.length : 0), 0);
          const mb = (totalBytes / (1024 * 1024)).toFixed(2);
          setVaultMegaBytes(mb);
        } catch (vaultErr) {
          console.error("Failed to load vault files telemetry:", vaultErr);
        }
      }
      setLoading(false);
    };
    getProfile();
  }, []);

  // 2. Update Profile
  const updateProfile = async () => {
     setSaving(true);
     const supabase = createClient();

     const { error } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            full_name: fullName,
            updated_at: new Date().toISOString(),
        });

      if (error) {
         showToast("Error updating profile!", "error");
      } else {
         showToast("Profile updated successfully!", "success");
      }
     setSaving(false);
  };

  // 3. Cancel Bundled Plan (Growth Pro / Enterprise)
  const handleCancelSubscription = async () => {
    setCancelling(true);
    const supabase = createClient();
    try {
        // Downgrade plan to 'free' in profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ plan: 'free' })
            .eq('id', userId);

        if (profileError) throw profileError;

        // Deactivate/delete plan slot agents (is_paid_individually = false)
        const { error: agentsError } = await supabase
            .from('agents')
            .delete()
            .eq('user_id', userId)
            .eq('is_paid_individually', false);

        if (agentsError) throw agentsError;

        showToast("Subscription plan cancelled successfully.", "success");
        setPlan('free');
        setSubscriptionAgents([]);
        setShowCancelModal(false);
    } catch (e: any) {
        showToast("Failed to cancel subscription: " + e.message, "error");
    } finally {
        setCancelling(false);
    }
  };

  // 4. Cancel Governance Control Tower Plan
  const handleCancelGovernance = async () => {
    setCancelling(true);
    const supabase = createClient();
    try {
      const govAgent = paidAgents.find(a => a.name === "Governance Control Tower");
      if (govAgent) {
        const { error } = await supabase
          .from('agents')
          .delete()
          .eq('id', govAgent.id);
        if (error) throw error;
        
        showToast("Governance Control Tower subscription cancelled.", "success");
        setPaidAgents(prev => prev.filter(a => a.id !== govAgent.id));
      }
      setShowCancelGovModal(false);
    } catch (e: any) {
      showToast("Failed to cancel Governance Control Tower: " + e.message, "error");
    } finally {
      setCancelling(false);
    }
  };

  // 5. Cancel Individual Employee Subscription
  const handleCancelIndividual = async () => {
    if (!selectedAgentToCancel) return;
    setCancelling(true);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', selectedAgentToCancel.id);
      if (error) throw error;
      
      showToast(`Hiring subscription for ${selectedAgentToCancel.name.split('(')[0]} cancelled.`, "success");
      setPaidAgents(prev => prev.filter(a => a.id !== selectedAgentToCancel.id));
      setSelectedAgentToCancel(null);
    } catch (e: any) {
      showToast("Failed to cancel contract: " + e.message, "error");
    } finally {
      setCancelling(false);
    }
  };

  // 6. Download Compliance Data Archive
  const handleDownloadArchive = () => {
    try {
      const archiveData = {
        exportDate: new Date().toISOString(),
        profile: {
          id: userId,
          name: fullName,
          email: email,
          plan: plan
        },
        hiredAgents: paidAgents.concat(subscriptionAgents)
      };
      
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(archiveData, null, 2)
      )}`;
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `pixorva-data-archive-${userId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      showToast("Your data archive has been compiled and downloaded.", "success");
    } catch (err: any) {
      showToast("Failed to compile archive: " + err.message, "error");
    }
  };

  // 7. Request Compliance Data Erasure
  const handleRequestErasure = async () => {
    setErasing(true);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to complete data erasure");
      }

      showToast("Your account and all workforce data have been completely erased.", "success");
      router.push("/onboarding");
    } catch (err: any) {
      showToast("Failed to complete data erasure: " + err.message, "error");
      setErasing(false);
    }
  };

  // API Key Generators
  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) {
      showToast("Please enter a key description.", "error");
      return;
    }
    try {
      const res = await fetch('/api/settings/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName })
      });
      const data = await res.json();
      if (data.success && data.key) {
        setApiKeys(prev => [...prev, data.key]);
        setNewKeyName('');
        showToast(`API Key "${newKeyName}" generated successfully.`, "success");
      } else {
        showToast(data.error || "Failed to generate API Key.", "error");
      }
    } catch (e) {
      showToast("Failed to generate API Key.", "error");
    }
  };

  const handleRevokeApiKey = async (id: string, name: string) => {
    try {
      const res = await fetch('/api/settings/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setApiKeys(prev => prev.filter(k => k.id !== id));
        showToast(`API Key "${name}" revoked.`, "success");
      } else {
        showToast(data.error || "Failed to revoke API Key.", "error");
      }
    } catch (e) {
      showToast("Failed to revoke API Key.", "error");
    }
  };

  const handlePlaygroundExecute = async () => {
    if (!selectedPlaygroundKey) {
      showToast("Please select or generate an API key first.", "error");
      return;
    }
    if (!selectedAgentId) {
      showToast("Please hire or provision at least one agent first.", "error");
      return;
    }

    setPlaygroundLoading(true);
    setPlaygroundResult('');

    try {
      const selectedAgent = availablePlaygroundAgents.find(a => a.id === selectedAgentId);
      const res = await fetch('/api/run-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${selectedPlaygroundKey}`
        },
        body: JSON.stringify({
          input: playgroundPrompt,
          agentId: selectedAgentId,
          agentRole: selectedAgent ? selectedAgent.name : 'AI Agent'
        })
      });

      const data = await res.json();
      if (res.status === 200 && data.success) {
        setPlaygroundResult(data.result);
        showToast("API run executed successfully!", "success");
        
        // Refresh settings data to increment quota today count!
        const refreshRes = await fetch('/api/settings/data');
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          setApiKeys(refreshData.apiKeys || []);
        }
      } else {
        setPlaygroundResult(JSON.stringify(data, null, 2));
        showToast(data.result || "API run failed.", "error");
      }
    } catch (err: any) {
      setPlaygroundResult(`Execution Error: ${err.message}`);
      showToast("API execution failed.", "error");
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Revoke All active devices/sessions
  const handleRevokeAllSessions = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      showToast("All active login sessions have been revoked.", "success");
      router.push("/login");
    } catch (e: any) {
      showToast("Failed to revoke sessions: " + e.message, "error");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const hasGovernance = paidAgents.some(a => a.name === "Governance Control Tower");
  const hiredIndividuals = paidAgents.filter(a => a.name !== "Governance Control Tower");

  return (
    <div className={`min-h-screen bg-gray-50 text-black pb-20 ${inter.className}`}>
      
      {/* Navbar */}
      <nav className="bg-white border-b-4 border-black px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="bg-black text-white p-2 rounded hover:bg-yellow-400 hover:text-black transition border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-y-1 flex items-center justify-center shrink-0">
            <ArrowLeft size={16} />
          </Link>
          <h1 className={`text-2xl font-black uppercase tracking-wider ${oswald.className}`}>Settings</h1>
        </div>
        <div className="bg-yellow-400 text-black border-2 border-black px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          Account Settings
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
         
         <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="bg-yellow-400 p-2 rounded-lg"><UserIcon size={24}/></div>
                Profile Details
            </h2>

            <div className="space-y-6">
                
                {/* Email (Read Only) */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email Address</label>
                    <input type="text" value={email} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                    <p className="text-xs text-gray-400 mt-2">Email cannot be changed.</p>
                </div>

                {/* Full Name */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Full Name</label>
                    <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex. John Doe"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" 
                    />
                </div>

                {/* Save Button */}
                <button 
                    onClick={updateProfile}
                    disabled={saving}
                    className="bg-black text-white px-8 py-3 rounded-xl font-bold uppercase hover:bg-yellow-400 hover:text-black transition-all flex items-center gap-2"
                >
                    {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                    Save Changes
                </button>

             </div>
          </div>

           {/* API Keys Access Console */}
          <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-10">
             <h2 className="text-3xl font-black mb-4 uppercase flex items-center gap-3">
                 <div className="bg-yellow-400 p-2 rounded-xl border-2 border-black"><Key size={24}/></div>
                 Developer API Console
             </h2>
             <p className="text-xs font-semibold text-gray-500 mb-6 leading-relaxed">
               Generate custom developer API keys to integrate Pixorva agents into external Slack channels, GitHub webhooks, or personal applications.
             </p>

             {/* Create Key form */}
             <div className="flex flex-col sm:flex-row gap-3 mb-6">
               <input
                 type="text"
                 placeholder="Key name (e.g. Slack bot, CI pipeline)"
                 value={newKeyName}
                 onChange={(e) => setNewKeyName(e.target.value)}
                 className="flex-grow px-4 py-3 bg-white border-2 border-black rounded-xl text-xs font-bold focus:outline-none focus:ring-0"
               />
               <button
                 onClick={handleCreateApiKey}
                 className="bg-black text-white hover:bg-yellow-400 hover:text-black px-6 py-3 rounded-xl font-bold uppercase text-xs transition border-2 border-black"
               >
                 Generate Key
               </button>
             </div>

             {/* Keys list */}
             {apiKeys.length === 0 ? (
               <div className="border-2 border-dashed border-gray-300 p-6 rounded-2xl text-center text-xs text-gray-400 font-bold">
                 No API keys generated yet. Enter a name above to create one.
               </div>
             ) : (
               <div className="space-y-4">
                 {apiKeys.map(k => (
                   <div key={k.id} className="flex flex-col border-2 border-black p-4 rounded-2xl bg-gray-50 gap-3">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                       <div>
                         <p className="font-black text-xs uppercase leading-none text-black mb-1">{k.name}</p>
                         <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2 sm:mb-0">Created on {k.created}</span>
                       </div>
                       <div className="flex gap-2">
                         <button
                           onClick={() => {
                             navigator.clipboard.writeText(k.token);
                             showToast("API Key copied to clipboard!", "success");
                           }}
                           className="bg-white border-2 border-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-gray-100 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5"
                         >
                           Copy Key
                         </button>
                         <button
                           onClick={() => handleRevokeApiKey(k.id, k.name)}
                           className="bg-red-500 text-white border-2 border-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-black transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5"
                         >
                           Revoke
                         </button>
                       </div>
                     </div>

                     <div className="border-t border-gray-200 pt-3">
                       <code className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded font-mono block text-gray-600 w-fit select-all mb-3">{k.token}</code>
                       
                       <div className="flex justify-between items-center text-[9px] font-black uppercase text-gray-500 mb-1">
                         <span>Live Quota Usage (Today)</span>
                         <span className="text-black">{k.usedToday.toLocaleString()} / {k.dailyLimit.toLocaleString()} tokens</span>
                       </div>
                       <div className="w-full bg-gray-100 border border-black rounded-full h-2 overflow-hidden">
                         <div className="bg-yellow-400 h-full border-r border-black" style={{ width: `${Math.min((k.usedToday / k.dailyLimit) * 100, 100)}%` }} />
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
             {/* Interactive API Playground */}
             {apiKeys.length > 0 && (
               <div className="border-t-4 border-black mt-8 pt-6">
                 <h3 className="text-xl font-black uppercase mb-2 flex items-center gap-2">
                   <span className="bg-black text-white p-1 rounded">⚡</span> Interactive API Playground
                 </h3>
                 <p className="text-[10px] font-semibold text-gray-500 mb-6 leading-relaxed">
                   Test your live integration keys directly inside this playground sandbox. Execution logs and tokens increment in real time.
                 </p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Left Controls */}
                   <div className="space-y-4">
                     <div>
                       <label className="block text-[10px] font-black uppercase text-gray-700 mb-1.5">Select Authorization Key</label>
                       <select
                         value={selectedPlaygroundKey}
                         onChange={(e) => setSelectedPlaygroundKey(e.target.value)}
                         className="w-full bg-white border-2 border-black rounded-xl p-3 text-xs font-bold focus:outline-none"
                       >
                         {apiKeys.map(k => (
                           <option key={k.id} value={k.token}>{k.name} ({k.token.slice(0, 12)}...)</option>
                         ))}
                       </select>
                     </div>

                     <div>
                       <label className="block text-[10px] font-black uppercase text-gray-700 mb-1.5">Target AI Agent</label>
                       {availablePlaygroundAgents.length === 0 ? (
                         <div className="border-2 border-dashed border-gray-300 p-3 rounded-xl text-center text-xs font-bold text-gray-400">
                           No hired agents found.
                         </div>
                       ) : (
                         <select
                           value={selectedAgentId}
                           onChange={(e) => setSelectedAgentId(e.target.value)}
                           className="w-full bg-white border-2 border-black rounded-xl p-3 text-xs font-bold focus:outline-none"
                         >
                           {availablePlaygroundAgents.map(a => (
                             <option key={a.id} value={a.id}>{a.name}</option>
                           ))}
                         </select>
                       )}
                     </div>

                     <div>
                       <label className="block text-[10px] font-black uppercase text-gray-700 mb-1.5">Prompt Message</label>
                       <textarea
                         rows={3}
                         value={playgroundPrompt}
                         onChange={(e) => setPlaygroundPrompt(e.target.value)}
                         className="w-full bg-white border-2 border-black rounded-xl p-3 text-xs font-bold focus:outline-none resize-none"
                       />
                     </div>

                     <button
                       onClick={handlePlaygroundExecute}
                       disabled={playgroundLoading}
                       className="w-full bg-yellow-400 hover:bg-black hover:text-white text-black py-3 px-4 border-2 border-black rounded-xl font-black uppercase text-xs transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
                     >
                       {playgroundLoading ? 'Executing Run...' : '⚡ Execute API Run'}
                     </button>
                   </div>

                   {/* Right Viewports */}
                   <div className="space-y-4">
                     <div>
                       <label className="block text-[10px] font-black uppercase text-gray-700 mb-1.5">Equivalent Curl Request</label>
                       <div className="bg-black text-green-400 p-4 rounded-2xl font-mono text-[9px] overflow-x-auto select-all max-h-[140px]">
                         <pre>
{`curl -X POST "${typeof window !== 'undefined' ? window.location.origin : 'https://pixorva.com'}/api/run-agent" \\
-H "Content-Type: application/json" \\
-H "Authorization: Bearer ${selectedPlaygroundKey || 'px_live_...'}" \\
-d '${JSON.stringify({
  input: playgroundPrompt,
  agentId: selectedAgentId || 'your-agent-uuid',
  agentRole: availablePlaygroundAgents.find(a => a.id === selectedAgentId)?.name || 'AI-Agent'
}, null, 2)}'`}
                         </pre>
                       </div>
                     </div>

                     <div>
                       <label className="block text-[10px] font-black uppercase text-gray-700 mb-1.5">Execution Result</label>
                       <div className="bg-gray-100 border-2 border-black p-4 rounded-2xl font-mono text-[10px] min-h-[120px] max-h-[150px] overflow-y-auto text-black">
                         {playgroundLoading ? (
                           <span className="text-gray-400 font-bold">Waiting for AI model response stream...</span>
                         ) : playgroundResult ? (
                           <pre className="whitespace-pre-wrap">{playgroundResult}</pre>
                         ) : (
                           <span className="text-gray-400 font-bold">Execute run to retrieve outputs.</span>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             )}
          </div>

          {/* Recent Billing Receipts & History */}
          <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-10">
             <h2 className="text-3xl font-black mb-4 uppercase flex items-center gap-3">
                 <div className="bg-yellow-400 p-2 rounded-xl border-2 border-black"><CreditCard size={24}/></div>
                 Receipt Billing History
             </h2>
             <p className="text-xs font-semibold text-gray-500 mb-6 leading-relaxed">
               View recent payment receipts and corresponding tax invoices compiled for your account subscriptions.
             </p>

             <div className="space-y-4">
               {payments.length === 0 ? (
                 <div className="border-2 border-dashed border-gray-300 p-6 rounded-2xl text-center text-xs text-gray-400 font-bold">
                   No payments recorded yet. Active plans invoices will map right here once billing completes.
                 </div>
               ) : (
                 payments.map(p => (
                   <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-2 border-black p-4 rounded-2xl bg-gray-50 gap-4">
                     <div>
                       <p className="font-black text-xs uppercase leading-none text-black mb-1">{p.planName}</p>
                       <span className="text-[10px] text-gray-400 font-bold uppercase block">Paid on {p.created} • Razorpay {p.razorpayId}</span>
                     </div>
                     <div className="flex items-center gap-4">
                       <span className="font-black text-xs uppercase text-green-600 bg-green-50 px-2.5 py-1 rounded border border-green-200">₹{p.amount.toLocaleString()} Paid</span>
                       <Link 
                         href={`/sample_receipt.html?amount=${p.amount}&plan=${encodeURIComponent(p.planName)}&razorpayId=${p.razorpayId}`} 
                         target="_blank" 
                         className="bg-white border-2 border-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-gray-100 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5"
                       >
                         View Invoice
                       </Link>
                     </div>
                   </div>
                 ))
               )}
             </div>
          </div>

          {/* Active Devices & Session Tracker */}
          <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-10">
             <h2 className="text-3xl font-black mb-4 uppercase flex items-center gap-3">
                 <div className="bg-yellow-400 p-2 rounded-xl border-2 border-black"><Smartphone size={24}/></div>
                 Active Session Security
             </h2>
             <p className="text-xs font-semibold text-gray-500 mb-6 leading-relaxed">
               Monitor authentication devices signed into your Pixorva account. Revoke older sessions if you suspect security friction.
             </p>

             <div className="space-y-3 mb-6">
               {activeSession ? (
                 <div className="flex justify-between items-center border-2 border-black p-4 rounded-2xl bg-gray-50">
                   <div>
                     <div className="flex items-center gap-2">
                       <span className="font-black text-xs uppercase text-black">{activeSession.device}</span>
                       <span className="bg-green-100 border border-green-300 text-green-800 text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full">Current Session</span>
                     </div>
                     <span className="text-[10px] text-gray-400 font-bold uppercase mt-1 block">{activeSession.location} • IP: {activeSession.ip}</span>
                   </div>
                 </div>
               ) : (
                 <div className="border-2 border-dashed border-gray-300 p-4 rounded-2xl text-center text-xs text-gray-400 font-bold">
                   Loading session logs...
                 </div>
               )}
             </div>

             <button
               onClick={handleRevokeAllSessions}
               className="w-full bg-red-500 hover:bg-black text-white py-4 px-6 border-2 border-black rounded-xl font-black uppercase text-xs tracking-wider transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5 flex items-center justify-center gap-2"
             >
               Revoke All Other Sessions
             </button>
          </div>

         {/* Compliance & Data Control Desk */}
          <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-10">
             <h2 className="text-3xl font-black mb-4 uppercase flex items-center gap-3">
                 <div className="bg-yellow-400 p-2 rounded-xl border-2 border-black"><Shield size={24}/></div>
                 Compliance & Data Control Desk
             </h2>
             <p className="text-xs font-semibold text-gray-500 mb-6 leading-relaxed">
               In accordance with India DPDPA, EU GDPR, and CCPA standards, you hold full sovereignty over your stored data. Access data portability archives or request total erasure here.
             </p>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button
                 onClick={handleDownloadArchive}
                 className="bg-white hover:bg-gray-50 text-black py-4 px-6 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5 flex items-center justify-center gap-2"
               >
                 Download Data Archive
               </button>
               <button
                 onClick={() => setShowErasureModal(true)}
                 className="bg-red-500 hover:bg-black text-white py-4 px-6 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5 flex items-center justify-center gap-2"
               >
                 Request Data Erasure
               </button>
             </div>
          </div>

         {/* Subscription & Plan Status Card */}
         <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-10">
            <h2 className="text-3xl font-black mb-6 uppercase flex items-center gap-3">
                <div className="bg-yellow-400 p-2 rounded-xl border-2 border-black"><Zap size={24}/></div>
                Plan & Subscription Status
            </h2>

            <div className="space-y-8">
                
                {/* 1. Bundled Plans (Growth Pro / Enterprise) */}
                <div className="border-2 border-black p-6 rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                        <h3 className="font-black text-sm uppercase text-gray-700 flex items-center gap-2">
                           <CreditCard size={18} />
                           Growth Pro / Enterprise Bundle
                        </h3>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded border ${plan !== 'free' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>
                            {plan !== 'free' ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {plan === 'growth_pro' && (
                        <div className="space-y-4">
                            <p className={`text-xl font-black uppercase ${oswald.className}`}>Growth Pro Plan (₹1,999/mo)</p>
                            
                            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold uppercase text-gray-500">Plan Slot Utilisation</span>
                                    <span className="text-xs font-black uppercase text-black">{subscriptionAgents.length} / 4 slots</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${(subscriptionAgents.length / 4) * 100}%` }} />
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="w-full bg-red-500 hover:bg-black text-white py-2 rounded-xl border-2 border-black font-bold uppercase text-[10px] tracking-wider transition"
                            >
                                Cancel Growth Pro Subscription
                            </button>
                        </div>
                    )}

                    {plan === 'enterprise' && (
                        <div className="space-y-4">
                            <p className={`text-xl font-black uppercase ${oswald.className}`}>Enterprise Plan (₹4,999/mo)</p>
                            <p className="text-xs font-semibold text-gray-500 leading-normal">Allows unlimited hires and control integrations across all channels.</p>
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="w-full bg-red-500 hover:bg-black text-white py-2 rounded-xl border-2 border-black font-bold uppercase text-[10px] tracking-wider transition"
                            >
                                Cancel Enterprise Subscription
                            </button>
                        </div>
                    )}

                    {plan === 'free' && (
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-gray-400 italic">No bundled platform plan active.</p>
                            <Link href="/pricing" className="text-xs font-black uppercase text-yellow-600 hover:underline block">&rarr; Browse Platform Plans</Link>
                        </div>
                    )}
                </div>

                {/* 2. Governance Control Tower Plan */}
                <div className="border-2 border-black p-6 rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                        <h3 className="font-black text-sm uppercase text-gray-700 flex items-center gap-2">
                           <Shield size={18} />
                           Governance Gate
                        </h3>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded border ${hasGovernance ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>
                            {hasGovernance ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {hasGovernance ? (
                        <div className="space-y-4">
                            <p className={`text-xl font-black uppercase ${oswald.className}`}>Governance Control Tower (₹1,999/mo)</p>
                            <p className="text-xs font-semibold text-gray-500 leading-normal">Grants proxy gating, auditing vaults, and admission policies checks.</p>
                            <button
                                onClick={() => setShowCancelGovModal(true)}
                                className="w-full bg-red-500 hover:bg-black text-white py-2 rounded-xl border-2 border-black font-bold uppercase text-[10px] tracking-wider transition"
                            >
                                Cancel Governance Subscription
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-gray-400 italic">Governance Gate is locked.</p>
                            <Link href="/governance/info" className="text-xs font-black uppercase text-yellow-600 hover:underline block">&rarr; Subscribe to Governance Gate</Link>
                        </div>
                    )}
                </div>

                {/* 3. Individual Hired Employee Subscriptions */}
                <div className="border-2 border-black p-6 rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                        <h3 className="font-black text-sm uppercase text-gray-700 flex items-center gap-2">
                           <User size={18} />
                           Individual AI Employee Subscriptions
                        </h3>
                        <span className="text-xs font-black uppercase text-black">
                            {hiredIndividuals.length} Hired
                        </span>
                    </div>

                    {hiredIndividuals.length === 0 ? (
                        <p className="text-xs font-medium text-gray-400 italic">No individually hired employee subscriptions active.</p>
                    ) : (
                        <div className="space-y-4">
                            {hiredIndividuals.map((agent) => {
                              let price = "₹999/mo"; // Default
                              const lowerName = agent.name.toLowerCase();
                              if (lowerName.includes("ruby")) price = "₹1,299/mo";
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

                              return (
                                <div key={agent.id} className="flex justify-between items-center border-2 border-black p-4 rounded-xl bg-gray-50">
                                    <div>
                                        <p className="font-black text-sm uppercase leading-none">{agent.name.split('(')[0]}</p>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mt-1 block">Hired Subscription • {price}</span>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedAgentToCancel(agent)}
                                        className="bg-red-500 hover:bg-black text-white px-4 py-1.5 rounded-lg border-2 border-black text-[9px] font-black uppercase transition"
                                    >
                                        Cancel Contract
                                    </button>
                                </div>
                              );
                            })}
                        </div>
                    )}
                </div>

            </div>
         </div>

      </main>

      {/* CANCEL BUNDLED PLAN MODAL (Growth Pro / Enterprise) */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black p-8 rounded-3xl max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative">
                <button disabled={cancelling} onClick={() => setShowCancelModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-black transition">
                    <X size={24} />
                </button>
                <div className="mb-6 flex justify-center">
                    <div className="bg-red-100 p-4 rounded-2xl border-4 border-black text-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Trash2 size={36} /></div>
                </div>
                <h3 className={`text-3xl uppercase mb-3 ${oswald.className}`}>Cancel Bundle Plan?</h3>
                <p className="text-sm font-semibold text-gray-600 mb-8 leading-relaxed">Are you sure you want to cancel your platform bundle subscription? You will immediately lose slots access and all included employee slots will be terminated.</p>
                <div className="flex flex-col gap-3">
                    <button 
                      disabled={cancelling}
                      onClick={handleCancelSubscription}
                      className="w-full bg-red-500 text-white hover:bg-black py-4 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition shadow-md flex items-center justify-center gap-2"
                    >
                        {cancelling ? <Loader2 className="animate-spin" size={16} /> : 'Yes, Cancel Plan'}
                    </button>
                    <button disabled={cancelling} onClick={() => setShowCancelModal(false)} className="w-full bg-white text-gray-500 hover:text-black py-2 font-bold uppercase text-xs tracking-wider transition">Keep My Plan</button>
                </div>
            </div>
        </div>
      )}

      {/* CANCEL GOVERNANCE MODAL */}
      {showCancelGovModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black p-8 rounded-3xl max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative">
                <button disabled={cancelling} onClick={() => setShowCancelGovModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-black transition">
                    <X size={24} />
                </button>
                <div className="mb-6 flex justify-center">
                    <div className="bg-red-100 p-4 rounded-2xl border-4 border-black text-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Shield size={36} /></div>
                </div>
                <h3 className={`text-3xl uppercase mb-3 ${oswald.className}`}>Cancel Governance?</h3>
                <p className="text-sm font-semibold text-gray-600 mb-8 leading-relaxed">Are you sure you want to cancel your Governance Control Tower subscription? You will lose Proxy gating and admission policies audit access immediately.</p>
                <div className="flex flex-col gap-3">
                    <button 
                      disabled={cancelling}
                      onClick={handleCancelGovernance}
                      className="w-full bg-red-500 text-white hover:bg-black py-4 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition shadow-md flex items-center justify-center gap-2"
                    >
                        {cancelling ? <Loader2 className="animate-spin" size={16} /> : 'Yes, Cancel Governance'}
                    </button>
                    <button disabled={cancelling} onClick={() => setShowCancelGovModal(false)} className="w-full bg-white text-gray-500 hover:text-black py-2 font-bold uppercase text-xs tracking-wider transition">Keep My Subscription</button>
                </div>
            </div>
        </div>
      )}

      {/* CANCEL INDIVIDUAL AGENT CONTRACT MODAL */}
      {selectedAgentToCancel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black p-8 rounded-3xl max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative">
                <button disabled={cancelling} onClick={() => setSelectedAgentToCancel(null)} className="absolute right-4 top-4 text-gray-400 hover:text-black transition">
                    <X size={24} />
                </button>
                <div className="mb-6 flex justify-center">
                    <div className="bg-red-100 p-4 rounded-2xl border-4 border-black text-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><User size={36} /></div>
                </div>
                <h3 className={`text-3xl uppercase mb-3 ${oswald.className}`}>Cancel Contract?</h3>
                <p className="text-sm font-semibold text-gray-600 mb-8 leading-relaxed">Are you sure you want to terminate the hiring subscription for <strong>{selectedAgentToCancel.name.split('(')[0]}</strong>? This employee will be removed from your office immediately.</p>
                <div className="flex flex-col gap-3">
                    <button 
                      disabled={cancelling}
                      onClick={handleCancelIndividual}
                      className="w-full bg-red-500 text-white hover:bg-black py-4 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition shadow-md flex items-center justify-center gap-2"
                    >
                        {cancelling ? <Loader2 className="animate-spin" size={16} /> : 'Yes, Terminate Contract'}
                    </button>
                    <button disabled={cancelling} onClick={() => setSelectedAgentToCancel(null)} className="w-full bg-white text-gray-500 hover:text-black py-2 font-bold uppercase text-xs tracking-wider transition">Keep Employee</button>
                </div>
            </div>
        </div>
      )}

      {/* COMPLIANCE DATA ERASURE MODAL */}
      {showErasureModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black p-8 rounded-3xl max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative">
                <button disabled={erasing} onClick={() => setShowErasureModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-black transition">
                    <X size={24} />
                </button>
                <div className="mb-6 flex justify-center">
                    <div className="bg-red-100 p-4 rounded-2xl border-4 border-black text-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Shield size={36} /></div>
                </div>
                <h3 className={`text-3xl uppercase mb-3 ${oswald.className}`}>Erase Personal Data?</h3>
                <p className="text-sm font-semibold text-gray-600 mb-8 leading-relaxed">
                  Warning: Under GDPR and DPDPA, this triggers total erasure of your profile and deletes all hired employees from database storage. This action is permanent and cannot be undone.
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                      disabled={erasing}
                      onClick={handleRequestErasure}
                      className="w-full bg-red-600 text-white hover:bg-black py-4 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition shadow-md flex items-center justify-center gap-2"
                    >
                        {erasing ? <Loader2 className="animate-spin" size={16} /> : 'Yes, Delete My Account'}
                    </button>
                    <button disabled={erasing} onClick={() => setShowErasureModal(false)} className="w-full bg-white text-gray-500 hover:text-black py-2 font-bold uppercase text-xs tracking-wider transition">Cancel</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}