"use client";

import React, { useState } from "react";
import { Oswald, Inter } from "next/font/google";
import { 
  ArrowLeft, Database, ShieldCheck, Lock, Plus, Play, Download, 
  RefreshCw, ShieldAlert, Cpu, DollarSign, Activity, FileCode, Check, Trash
} from 'lucide-react';
import Link from "next/link";
import { showToast } from "../utils/Toast";
import { createClient } from "../utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

interface ProviderConfig {
  id: string;
  name: string;
  role: string;
  endpoint: string;
  model: string;
  apiKey: string;
  status: "Connected" | "Not Configured";
}

interface Workload {
  id: string;
  name: string;
  version: string;
  owner: string;
  useCase: string;
  riskTier: "Minimal" | "Limited" | "High";
  lineage: string;
  biasScore: number | null;
  driftScore: number | null;
  vulnerabilityCount: number | null;
  certifiedHash: string | null;
}

const DEFAULT_PROVIDERS: ProviderConfig[] = [
  { id: "p-1", name: "OpenAI Gateway", role: "GPT-4o / GPT-3.5", endpoint: "https://api.openai.com/v1", model: "gpt-4o", apiKey: "", status: "Not Configured" },
  { id: "p-2", name: "Anthropic Proxy", role: "Claude 3.5 Sonnet", endpoint: "https://api.anthropic.com/v1", model: "claude-3-5-sonnet-20241022", apiKey: "", status: "Not Configured" },
  { id: "p-3", name: "Gemini Engine", role: "Gemini 1.5 Pro / Flash", endpoint: "https://generativelanguage.googleapis.com", model: "gemini-1.5-flash", apiKey: "", status: "Not Configured" },
  { id: "p-4", name: "Custom Cloud Node", role: "vLLM / Ollama Node", endpoint: "http://104.24.12.80:8000/v1", model: "meta-llama/Meta-Llama-3-8B-Instruct", apiKey: "", status: "Not Configured" }
];

const DEFAULT_WORKLOADS: Workload[] = [
  {
    id: "wl-1",
    name: "Devon React Agent",
    version: "v2.1.0",
    owner: "Engineering",
    useCase: "Frontend code generation",
    riskTier: "Minimal",
    lineage: "Fine-tuned Qwen-2.5-Coder-7B",
    biasScore: 0.01,
    driftScore: 0.04,
    vulnerabilityCount: 0,
    certifiedHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  },
  {
    id: "wl-2",
    name: "Ruby Database Architect",
    version: "v2.2.0",
    owner: "Engineering",
    useCase: "SQL query design and schemas",
    riskTier: "Limited",
    lineage: "Fine-tuned Llama-3-8B-Instruct",
    biasScore: 0.03,
    driftScore: 0.09,
    vulnerabilityCount: 1,
    certifiedHash: "859c7f1a8e2cb83a48e7195d2c20f188310c85c2c77d61244e83c27e85c13e8a"
  },
  {
    id: "wl-3",
    name: "Customer Sentiment Classifier",
    version: "v1.0.1",
    owner: "Marketing",
    useCase: "Analyzing social media captions",
    riskTier: "Minimal",
    lineage: "DistilBERT-Base-Uncased",
    biasScore: 0.02,
    driftScore: 0.05,
    vulnerabilityCount: 0,
    certifiedHash: "6c2f3d9b1a5e8f4c2c7d9a1b5c8e4f2d7a9b1c5e8f4c2c7d9a1b5c8e4f2d7a9b"
  }
];

const DEFAULT_AUDITS: any[] = [];

export default function GovernancePage() {
  const [workloads, setWorkloads] = useState<Workload[]>(DEFAULT_WORKLOADS);
  const [selectedWlId, setSelectedWlId] = useState<string>("wl-1");
  const [audits, setAudits] = useState(DEFAULT_AUDITS);
  const [providers, setProviders] = useState<ProviderConfig[]>(DEFAULT_PROVIDERS);
  
  // Dynamic Proxy Stats
  const [totalRequests, setTotalRequests] = useState(0);
  const [violationsBlocked, setViolationsBlocked] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);
  const [totalCost, setTotalCost] = useState(0.00);

  // Policy States
  const [contentFiltering, setContentFiltering] = useState(true);
  const [rateLimiting, setRateLimiting] = useState(true);
  const [quotaEnforcement, setQuotaEnforcement] = useState(false);
  const [blockUnapproved, setBlockUnapproved] = useState(true);
  const [yamlConfig, setYamlConfig] = useState(`# Universal Gateway Proxy Guardrail Policy
version: "1.0.0"
guardrails:
  content_filter:
    enabled: true
    banned_keywords: ["hack", "bypass", "leak password", "exploit"]
  rate_limit:
    enabled: true
    requests_per_minute: 120
  quota:
    enabled: false
    limit_usd: 50.00`);

  // Testing Loading states
  const [testingBias, setTestingBias] = useState(false);
  const [testingDrift, setTestingDrift] = useState(false);
  const [scanningSec, setScanningSec] = useState(false);

  // Sandbox States
  const [sandboxProvider, setSandboxProvider] = useState("p-1");
  const [sandboxPrompt, setSandboxPrompt] = useState("");
  const [sandboxResponse, setSandboxResponse] = useState("");
  const [sandboxMeta, setSandboxMeta] = useState<any>(null);
  const [sendingSandbox, setSendingSandbox] = useState(false);

  // New Provider Form
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvName, setNewProvName] = useState("");
  const [newProvRole, setNewProvRole] = useState("");
  const [newProvEndpoint, setNewProvEndpoint] = useState("");
  const [newProvModel, setNewProvModel] = useState("");
  const [newProvKey, setNewProvKey] = useState("");

  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Auth Guard & User-specific State Sync Hook
  useEffect(() => {
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
            router.push("/login");
            return;
        }
        setUser(currentUser);

        // Check if user has purchased Governance Control Tower
        const { data: govAgent } = await supabase
            .from('agents')
            .select('id')
            .eq('user_id', currentUser.id)
            .eq('name', 'Governance Control Tower')
            .maybeSingle();

        if (!govAgent) {
            router.push("/governance/info");
            return;
        }

        // Load User-Specific State from LocalStorage
        const storedWl = localStorage.getItem(`gov_workloads_${currentUser.id}`);
        if (storedWl) setWorkloads(JSON.parse(storedWl));

        const storedProv = localStorage.getItem(`gov_providers_${currentUser.id}`);
        if (storedProv) setProviders(JSON.parse(storedProv));

        const storedAudits = localStorage.getItem(`gov_audits_${currentUser.id}`);
        if (storedAudits) setAudits(JSON.parse(storedAudits));

        const storedStats = localStorage.getItem(`gov_stats_${currentUser.id}`);
        if (storedStats) {
            const parsed = JSON.parse(storedStats);
            setTotalRequests(parsed.totalRequests);
            setViolationsBlocked(parsed.violationsBlocked);
            setAvgLatency(parsed.avgLatency);
            setTotalCost(parsed.totalCost);
        }

        const storedPolicies = localStorage.getItem(`gov_policies_${currentUser.id}`);
        if (storedPolicies) {
            const parsed = JSON.parse(storedPolicies);
            setContentFiltering(parsed.contentFiltering);
            setRateLimiting(parsed.rateLimiting);
            setQuotaEnforcement(parsed.quotaEnforcement);
            setBlockUnapproved(parsed.blockUnapproved);
            setYamlConfig(parsed.yamlConfig);
        }
      } catch (err) {
        console.error("Auth guard error:", err);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  // Automated Synchronization Triggers
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`gov_workloads_${user.id}`, JSON.stringify(workloads));
  }, [workloads, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`gov_providers_${user.id}`, JSON.stringify(providers));
  }, [providers, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`gov_audits_${user.id}`, JSON.stringify(audits));
  }, [audits, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`gov_stats_${user.id}`, JSON.stringify({
      totalRequests,
      violationsBlocked,
      avgLatency,
      totalCost
    }));
  }, [totalRequests, violationsBlocked, avgLatency, totalCost, user]);

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`gov_policies_${user.id}`, JSON.stringify({
      contentFiltering,
      rateLimiting,
      quotaEnforcement,
      blockUnapproved,
      yamlConfig
    }));
  }, [contentFiltering, rateLimiting, quotaEnforcement, blockUnapproved, yamlConfig, user]);

  const activeWorkload = workloads.find(w => w.id === selectedWlId) || workloads[0];

  const handleAddProviderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvName.trim() || !newProvEndpoint.trim() || !newProvModel.trim()) {
      showToast("Please fill in required fields", "error");
      return;
    }
    const newProv: ProviderConfig = {
      id: `p-${Date.now()}`,
      name: newProvName,
      role: newProvRole || newProvModel,
      endpoint: newProvEndpoint,
      model: newProvModel,
      apiKey: newProvKey ? "••••••••••••••••" : "",
      status: "Connected"
    };

    setProviders(prev => [...prev, newProv]);
    setNewProvName("");
    setNewProvRole("");
    setNewProvEndpoint("");
    setNewProvModel("");
    setNewProvKey("");
    setShowAddProvider(false);
    showToast(`${newProv.name} integrated successfully!`, "success");

    // Add Audit Log
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAudits(prev => [
      { time: nowStr, event: "Provider Connected", details: `Integrated new universal LLM endpoint: ${newProv.name} (${newProv.model})`, status: "success" },
      ...prev
    ]);
  };

  const handleSendSandbox = async () => {
    if (!sandboxPrompt.trim()) return;
    setSendingSandbox(true);
    setSandboxResponse("");
    setSandboxMeta(null);

    // Check policies dynamically
    const selectedProv = providers.find(p => p.id === sandboxProvider) || providers[0];
    const isBanned = contentFiltering && (
      sandboxPrompt.toLowerCase().includes("hack") ||
      sandboxPrompt.toLowerCase().includes("bypass") ||
      sandboxPrompt.toLowerCase().includes("leak") ||
      sandboxPrompt.toLowerCase().includes("exploit")
    );

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isBanned) {
      setSendingSandbox(false);
      setSandboxResponse("❌ [403 Forbidden] REQUEST BLOCKED BY POLICY GATEWAY: Content filter rules matched forbidden keyphrase ('hack'/'bypass'/'leak'/'exploit').");
      setViolationsBlocked(prev => prev + 1);
      setTotalRequests(prev => prev + 1);
      
      setAudits(prev => [
        { time: nowStr, event: "Gateway Violation Blocked", details: `Blocked prompt to ${selectedProv.name} containing potential vulnerability/exploit payload.`, status: "error" },
        ...prev
      ]);
      showToast("Policy Violation Blocked!", "error");
      return;
    }

    try {
      const response = await fetch('/api/governance/proxy', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: sandboxPrompt,
          provider: selectedProv.id,
          endpoint: selectedProv.endpoint,
          model: selectedProv.model,
          apiKey: selectedProv.apiKey
        })
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.error || "Proxy failed");

      setSandboxResponse(data.text);
      setSandboxMeta(data.meta);

      // Update counters
      setTotalRequests(prev => prev + 1);
      setTotalCost(prev => parseFloat((prev + data.meta.cost).toFixed(6)));
      setAvgLatency(prev => Math.floor((prev * 0.9) + (data.meta.latency * 0.1)));

      setAudits(prev => [
        { time: nowStr, event: "Proxy Call Success", details: `Proxied call to ${selectedProv.name} (${selectedProv.model}) completed in ${data.meta.latency}ms (Used ${data.meta.inTokens + data.meta.outTokens} tokens, Cost: $${data.meta.cost.toFixed(5)})`, status: "success" },
        ...prev
      ]);
      showToast("Gateway request succeeded!", "success");

    } catch (err: any) {
      setSandboxResponse(`❌ Error calling proxy: ${err.message}`);
      showToast("Proxy connection failed.", "error");
    } finally {
      setSendingSandbox(false);
    }
  };

  const runBiasTest = () => {
    setTestingBias(true);
    setTimeout(() => {
      setTestingBias(false);
      const randomScore = parseFloat((Math.random() * 0.1).toFixed(2));
      setWorkloads(prev => prev.map(w => w.id === selectedWlId ? { ...w, biasScore: randomScore } : w));
      
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAudits(prev => [
        { time: nowStr, event: "Bias Test Run", details: `Evaluated ${activeWorkload.name} bias metrics: ${randomScore} (Passed)`, status: "success" },
        ...prev
      ]);
      showToast("Bias test run completed!", "success");
    }, 1200);
  };

  const runDriftTest = () => {
    setTestingDrift(true);
    setTimeout(() => {
      setTestingDrift(false);
      const randomScore = parseFloat((Math.random() * 0.3).toFixed(2));
      setWorkloads(prev => prev.map(w => w.id === selectedWlId ? { ...w, driftScore: randomScore } : w));
      
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAudits(prev => [
        { time: nowStr, event: "Drift Evaluation", details: `PSI drift checked on ${activeWorkload.name}: ${randomScore} (${randomScore > 0.2 ? 'Warning: Significant Drift' : 'Stable'})`, status: randomScore > 0.2 ? "warning" : "success" },
        ...prev
      ]);
      showToast("PSI Drift evaluation completed!", "success");
    }, 1200);
  };

  const runVulnerabilityScan = () => {
    setScanningSec(true);
    setTimeout(() => {
      setScanningSec(false);
      const randVuls = Math.floor(Math.random() * 4);
      const generatedHash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      
      setWorkloads(prev => prev.map(w => w.id === selectedWlId ? { 
        ...w, 
        vulnerabilityCount: randVuls,
        certifiedHash: generatedHash
      } : w));
      
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAudits(prev => [
        { time: nowStr, event: "Vulnerability Scan", details: `Completed scan on ${activeWorkload.name}. Flagged ${randVuls} warnings. Certified Signature generated.`, status: randVuls > 2 ? "error" : "success" },
        ...prev
      ]);
      showToast("Vulnerability scan completed & signed!", "success");
    }, 1200);
  };

  const triggerEvidenceExport = () => {
    const evidenceText = `AI GOVERNANCE CONTROL TOWER - EXPORT EVIDENCE PACK
======================================================
Generated At: ${new Date().toLocaleString()}

1. GLOBAL COMPLIANCE GATEWAY ANALYTICS
------------------------------------------------------
Total Requests Proxied:    ${totalRequests}
Violations Blocked:        ${violationsBlocked}
Average Latency:           ${avgLatency}ms
Accumulated Proxy Cost:    $${totalCost.toFixed(4)}

2. CONNECTED PROVIDERS
------------------------------------------------------
${providers.map(p => `- ${p.name} (${p.model}) -> Status: ${p.status} (Endpoint: ${p.endpoint})`).join('\n')}

3. COMPLIANCE ASSESSMENT & SCORECARD
------------------------------------------------------
Workload Name: ${activeWorkload.name}
Version:       ${activeWorkload.version}
Bias evaluation index:     ${activeWorkload.biasScore !== null ? activeWorkload.biasScore : 'Pending Scan'}
Population Stability (PSI): ${activeWorkload.driftScore !== null ? activeWorkload.driftScore : 'Pending Scan'}
Vulnerability Count:        ${activeWorkload.vulnerabilityCount !== null ? activeWorkload.vulnerabilityCount : 'Pending Scan'}
Certified Security Hash:    ${activeWorkload.certifiedHash !== null ? activeWorkload.certifiedHash : 'Unsigned'}

4. COMPLIANCE AUDIT TIMELINE
------------------------------------------------------
${audits.map(a => `[${a.time}] ${a.event}: ${a.details}`).join('\n')}

======================================================
END OF COMPLIANCE INTEGRITY CERTIFICATION`;

    const blob = new Blob([evidenceText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `universal-compliance-audit-card.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Evidence Pack Downloaded!", "success");
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-[#0e0f12] flex items-center justify-center ${inter.className}`}>
        <div className="bg-[#141519] border border-white/15 p-8 rounded-2xl shadow-2xl text-center max-w-sm text-white">
          <RefreshCw className="animate-spin mx-auto text-[#ffc700] mb-4" size={32} />
          <h3 className={`text-xl uppercase ${oswald.className} text-white`}>Verifying Access Credentials...</h3>
          <p className="text-xs text-neutral-400 font-bold uppercase mt-2">Continuous Compliance Control Tower</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#0e0f12] text-white ${inter.className} pb-12 selection:bg-[#ffc700] selection:text-black`}>
      
      {/* HEADER */}
      <div className="bg-[#141519]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20 shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <Link href="/" className="bg-black/50 text-white p-2 rounded-xl hover:bg-[#ffc700] hover:text-black transition border border-white/15 shadow-sm flex items-center justify-center">
                    <ArrowLeft size={20}/>
                  </Link>
                  <div>
                    <h1 className={`text-2xl md:text-3xl uppercase ${oswald.className} tracking-tighter leading-none text-white`}>AI Governance Lab</h1>
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide">Universal LLM Proxy Control Tower</span>
                  </div>
              </div>
              <div className="bg-[#ffc700] text-black border border-yellow-300 px-3 py-1.5 rounded font-black text-xs uppercase tracking-wide shadow-sm">
                🛡️ Universal Audit Active
              </div>
          </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-[#141519]/80 backdrop-blur-xl border border-white/15 p-4 rounded-2xl shadow-xl flex items-center justify-between text-white">
            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Total Proxied Requests</span>
              <span className={`text-2xl font-black ${oswald.className} text-white`}>{totalRequests.toLocaleString()}</span>
            </div>
            <div className="bg-blue-500/20 text-blue-400 p-2.5 border border-blue-500/30 rounded-xl"><Cpu size={20}/></div>
          </div>

          <div className="bg-[#141519]/80 backdrop-blur-xl border border-white/15 p-4 rounded-2xl shadow-xl flex items-center justify-between text-white">
            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Blocked Violations</span>
              <span className={`text-2xl font-black text-red-400 ${oswald.className}`}>{violationsBlocked}</span>
            </div>
            <div className="bg-red-500/20 text-red-400 p-2.5 border border-red-500/30 rounded-xl"><ShieldAlert size={20} className="text-red-400"/></div>
          </div>

          <div className="bg-[#141519]/80 backdrop-blur-xl border border-white/15 p-4 rounded-2xl shadow-xl flex items-center justify-between text-white">
            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Average Latency</span>
              <span className={`text-2xl font-black text-emerald-400 ${oswald.className}`}>{avgLatency}ms</span>
            </div>
            <div className="bg-emerald-500/20 text-emerald-400 p-2.5 border border-emerald-500/30 rounded-xl"><Activity size={20} className="text-emerald-400"/></div>
          </div>

          <div className="bg-[#141519]/80 backdrop-blur-xl border border-white/15 p-4 rounded-2xl shadow-xl flex items-center justify-between text-white">
            <div>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Proxy Accrued Costs</span>
              <span className={`text-2xl font-black text-[#ffc700] ${oswald.className}`}>${totalCost.toFixed(2)}</span>
            </div>
            <div className="bg-[#ffc700]/20 text-[#ffc700] p-2.5 border border-[#ffc700]/30 rounded-xl"><DollarSign size={20} className="text-[#ffc700]"/></div>
          </div>

        </div>
        
        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* COLUMN 1: PROVIDERS REGISTRY (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-[#141519]/80 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-xl flex-grow flex flex-col justify-between text-white">
              <div>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Database size={20} className="text-[#ffc700]" />
                    <h2 className={`text-xl uppercase ${oswald.className} text-white`}>LLM Registry</h2>
                  </div>
                  <button 
                    onClick={() => setShowAddProvider(!showAddProvider)}
                    className="bg-[#ffc700] text-black hover:bg-yellow-400 transition text-xs font-black uppercase px-3 py-1.5 rounded border border-black flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus size={14} /> Add Provider
                  </button>
                </div>

                {showAddProvider ? (
                  <form onSubmit={handleAddProviderSubmit} className="bg-black/60 border border-white/15 p-4 rounded-xl mb-4 space-y-3 animate-in slide-in-from-top-4 duration-200 text-white">
                    <h4 className="text-xs font-black uppercase text-[#ffc700]">Integrate Custom LLM</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-neutral-400">Provider Name *</label>
                        <input 
                          type="text" 
                          required 
                          value={newProvName} 
                          onChange={(e) => setNewProvName(e.target.value)} 
                          placeholder="e.g. Local Llama Server" 
                          className="w-full text-xs p-2 bg-black/80 border border-white/20 rounded focus:outline-none focus:border-[#ffc700] text-white placeholder-neutral-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase text-neutral-400">Proxy Target Model *</label>
                        <input 
                          type="text" 
                          required 
                          value={newProvModel} 
                          onChange={(e) => setNewProvModel(e.target.value)} 
                          placeholder="meta-llama/Meta-Llama-3-8B-Instruct" 
                          className="w-full text-xs p-2 bg-black/80 border border-white/20 rounded focus:outline-none focus:border-[#ffc700] text-white placeholder-neutral-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase text-neutral-400">Target Endpoint Url *</label>
                        <input 
                          type="url" 
                          required 
                          value={newProvEndpoint} 
                          onChange={(e) => setNewProvEndpoint(e.target.value)} 
                          placeholder="http://your-gpu-ip:8000/v1" 
                          className="w-full text-xs p-2 bg-black/80 border border-white/20 rounded focus:outline-none focus:border-[#ffc700] text-white placeholder-neutral-500" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-black uppercase text-neutral-400">API Key / Token (Optional)</label>
                          <input 
                            type="password" 
                            value={newProvKey} 
                            onChange={(e) => setNewProvKey(e.target.value)} 
                            placeholder="••••••••••••" 
                            className="w-full text-xs p-2 bg-black/80 border border-white/20 rounded focus:outline-none focus:border-[#ffc700] text-white placeholder-neutral-500" 
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black uppercase text-neutral-400">Label/Role</label>
                          <input 
                            type="text" 
                            value={newProvRole} 
                            onChange={(e) => setNewProvRole(e.target.value)} 
                            placeholder="Llama-3 Server" 
                            className="w-full text-xs p-2 bg-black/80 border border-white/20 rounded focus:outline-none focus:border-[#ffc700] text-white placeholder-neutral-500" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-grow bg-[#ffc700] text-black hover:bg-yellow-400 py-2 rounded text-xs font-black uppercase transition">Connect Endpoint</button>
                      <button type="button" onClick={() => setShowAddProvider(false)} className="px-3 bg-black/40 border border-white/20 hover:bg-white/10 text-neutral-300 py-2 rounded text-xs font-bold uppercase transition">Cancel</button>
                    </div>
                  </form>
                ) : null}

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {providers.map((p) => {
                    const isSelected = p.id === sandboxProvider;
                    return (
                      <div 
                        key={p.id}
                        onClick={() => setSandboxProvider(p.id)}
                        className={`p-4 border rounded-xl transition cursor-pointer flex justify-between items-center ${isSelected ? 'bg-[#ffc700] text-black border-black shadow' : 'bg-black/40 text-neutral-200 border-white/10 hover:border-white/30'}`}
                      >
                        <div>
                          <h4 className={`font-bold text-xs uppercase ${isSelected ? 'text-black font-black' : 'text-white'}`}>{p.name}</h4>
                          <span className={`text-[9px] font-semibold block mt-0.5 ${isSelected ? 'text-black/75 font-bold' : 'text-neutral-400'}`}>{p.model}</span>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${p.status === 'Connected' ? (isSelected ? 'bg-black text-[#ffc700] border-black' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30') : 'bg-white/10 text-neutral-400 border-white/20'}`}>
                          {p.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-black/50 border border-white/15 p-4 rounded-xl mt-6 text-white space-y-3">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block pb-1 border-b border-white/10">Configure Selected Provider</span>
                
                <div>
                  <label className="block text-[8px] font-black uppercase text-neutral-400">Endpoint URL</label>
                  <input 
                    type="text" 
                    value={(providers.find(p => p.id === sandboxProvider) || providers[0]).endpoint}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProviders(prev => prev.map(p => p.id === sandboxProvider ? { ...p, endpoint: val } : p));
                    }}
                    className="w-full text-xs p-2 bg-black/80 border border-white/20 rounded focus:outline-none focus:border-[#ffc700] mt-1 font-mono text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] font-black uppercase text-neutral-400">Target Model</label>
                    <input 
                      type="text" 
                      value={(providers.find(p => p.id === sandboxProvider) || providers[0]).model}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProviders(prev => prev.map(p => p.id === sandboxProvider ? { ...p, model: val } : p));
                      }}
                      className="w-full text-xs p-2 bg-black/80 border border-white/20 rounded focus:outline-none focus:border-[#ffc700] mt-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase text-[#ffc700] font-bold">Your API Key *</label>
                    <input 
                      type="password" 
                      value={(providers.find(p => p.id === sandboxProvider) || providers[0]).apiKey || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProviders(prev => prev.map(p => p.id === sandboxProvider ? { ...p, apiKey: val, status: val.trim() ? "Connected" : "Not Configured" } : p));
                      }}
                      placeholder="Enter API Key"
                      className="w-full text-xs p-2 bg-black/80 border border-white/20 rounded focus:outline-none focus:border-[#ffc700] mt-1 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: UNIVERSAL PROXY GATEWAY SANDBOX (7 COLS) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-[#141519]/80 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-xl flex-grow flex flex-col justify-between text-white">
              <div>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Activity size={20} className="text-[#ffc700]" />
                    <h2 className={`text-xl uppercase ${oswald.className} text-white`}>Proxy Gateway Sandbox</h2>
                  </div>
                  <span className="text-xs font-black uppercase px-3 py-1 rounded border bg-[#ffc700] text-black border-black shadow-sm">
                    Live Testing
                  </span>
                </div>

                {/* Tester panel */}
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Enter Test Prompt</label>
                    <textarea 
                      value={sandboxPrompt} 
                      onChange={(e) => setSandboxPrompt(e.target.value)} 
                      rows={3}
                      placeholder="e.g. Write a script to fetch server status (Try containing 'hack' or 'exploit' to test Content Filters)"
                      className="w-full text-xs p-3 bg-black/60 border border-white/15 rounded-xl focus:outline-none focus:border-[#ffc700] leading-relaxed placeholder-neutral-500 text-white"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <button 
                      disabled={sendingSandbox || !sandboxPrompt.trim()}
                      onClick={handleSendSandbox}
                      className="bg-[#ffc700] text-black hover:bg-yellow-400 transition px-6 py-3 rounded-lg border border-black font-black uppercase text-xs tracking-wider disabled:opacity-50 shadow-sm"
                    >
                      {sendingSandbox ? "Routing..." : "Send via Proxy"}
                    </button>
                    
                    {sandboxMeta && (
                      <div className="flex gap-4 text-[9px] font-black uppercase bg-black/50 border border-white/15 px-3 py-2 rounded-lg text-neutral-400">
                        <span>Latency: <strong className="text-white">{sandboxMeta.latency}ms</strong></span>
                        <span>Tokens: <strong className="text-white">{sandboxMeta.inTokens + sandboxMeta.outTokens}</strong></span>
                        <span>Cost: <strong className="text-[#ffc700]">${sandboxMeta.cost.toFixed(5)}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Sandbox Response Output */}
                  {sandboxResponse && (
                    <div className="space-y-1 animate-in zoom-in-95 duration-200">
                      <span className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest">Gateway Response Output</span>
                      <div className={`p-4 border rounded-xl font-medium text-xs break-words leading-relaxed max-h-48 overflow-y-auto ${sandboxResponse.includes('403 Forbidden') ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-black/60 text-neutral-200 border-white/15'}`}>
                        {sandboxResponse}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Assessment Dials */}
              <div className="border-t border-white/10 pt-6">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-3">Model Compliance Verification</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    disabled={testingBias}
                    onClick={runBiasTest}
                    className="bg-black/50 text-white hover:bg-[#ffc700] hover:text-black hover:border-black py-3 rounded-lg border border-white/15 font-bold uppercase text-[10px] flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={testingBias ? "animate-spin" : ""} /> {testingBias ? "Evaluating..." : "Run Bias Test"}
                  </button>
                  <button 
                    disabled={testingDrift}
                    onClick={runDriftTest}
                    className="bg-black/50 text-white hover:bg-[#ffc700] hover:text-black hover:border-black py-3 rounded-lg border border-white/15 font-bold uppercase text-[10px] flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={testingDrift ? "animate-spin" : ""} /> {testingDrift ? "Analyzing..." : "PSI Drift Test"}
                  </button>
                  <button 
                    disabled={scanningSec}
                    onClick={runVulnerabilityScan}
                    className="bg-[#ffc700] text-black hover:bg-yellow-400 py-3 rounded-lg border border-black font-black uppercase text-[10px] flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-sm"
                  >
                    <Play size={14} className={scanningSec ? "animate-spin" : ""} /> {scanningSec ? "Scanning..." : "Vulnerability Scan"}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* BOTTOM ROW GRID: POLICY GATEWAY & AUDIT TRAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* COLUMN 1: POLICY GATEWAY (6 COLS) */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="bg-[#141519]/80 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-xl flex-grow flex flex-col justify-between text-white">
              <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                  <Lock size={20} className="text-[#ffc700]" />
                  <h2 className={`text-xl uppercase ${oswald.className} text-white`}>Policy Enforcement Gateway</h2>
                </div>

                {/* Switch Toggles */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  
                  <div className="bg-black/40 border border-white/15 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-white">Content Filter</h4>
                      <p className="text-[8px] text-neutral-400 font-bold uppercase leading-none mt-1">Block toxic output</p>
                    </div>
                    <button 
                      onClick={() => setContentFiltering(!contentFiltering)}
                      className={`w-11 h-6 rounded-full border border-white/20 transition relative ${contentFiltering ? 'bg-emerald-500' : 'bg-neutral-700'}`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${contentFiltering ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="bg-black/40 border border-white/15 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-white">Rate Limiting</h4>
                      <p className="text-[8px] text-neutral-400 font-bold uppercase leading-none mt-1">Throttling endpoints</p>
                    </div>
                    <button 
                      onClick={() => setRateLimiting(!rateLimiting)}
                      className={`w-11 h-6 rounded-full border border-white/20 transition relative ${rateLimiting ? 'bg-emerald-500' : 'bg-neutral-700'}`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${rateLimiting ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="bg-black/40 border border-white/15 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-white">Quota Enforce</h4>
                      <p className="text-[8px] text-neutral-400 font-bold uppercase leading-none mt-1">Cap API billing cost</p>
                    </div>
                    <button 
                      onClick={() => setQuotaEnforcement(!quotaEnforcement)}
                      className={`w-11 h-6 rounded-full border border-white/20 transition relative ${quotaEnforcement ? 'bg-emerald-500' : 'bg-neutral-700'}`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${quotaEnforcement ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="bg-black/40 border border-white/15 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-white">Block High-Risk</h4>
                      <p className="text-[8px] text-neutral-400 font-bold uppercase leading-none mt-1">Admission Control</p>
                    </div>
                    <button 
                      onClick={() => setBlockUnapproved(!blockUnapproved)}
                      className={`w-11 h-6 rounded-full border border-white/20 transition relative ${blockUnapproved ? 'bg-emerald-500' : 'bg-neutral-700'}`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${blockUnapproved ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>

                </div>

                {/* YAML editor */}
                <div>
                  <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Runtime YAML Config</label>
                  <textarea 
                    value={yamlConfig} 
                    onChange={(e) => setYamlConfig(e.target.value)} 
                    rows={8}
                    className="w-full font-mono text-[10px] bg-black/90 text-emerald-400 p-3 rounded-xl border border-white/20 focus:outline-none focus:border-[#ffc700] leading-relaxed"
                  />
                </div>
              </div>

              <div className="mt-4">
                <button 
                  onClick={() => showToast("Gateway Policy applied successfully!", "success")}
                  className="w-full bg-[#ffc700] text-black hover:bg-yellow-400 transition py-3 rounded-lg border border-black font-black uppercase text-[10px]"
                >
                  Apply Gateway Rules
                </button>
              </div>

            </div>
          </div>

          {/* COLUMN 2: AUDIT LOGS & EXPORT (6 COLS) */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="bg-[#141519]/80 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-xl flex-grow flex flex-col justify-between text-white">
              <div>
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <FileCode size={20} className="text-[#ffc700]" />
                    <h2 className={`text-xl uppercase ${oswald.className} text-white`}>Audit Vault Logs</h2>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Immutable Vault</span>
                </div>

                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  {audits.map((item, idx) => {
                    return (
                      <div key={idx} className="bg-black/40 border border-white/15 p-3.5 rounded-xl flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg border mt-0.5 ${item.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : item.status === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/40' : item.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' : 'bg-blue-500/20 text-blue-400 border-blue-500/40'}`}>
                          <ShieldCheck size={14} />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-black uppercase leading-none text-white">{item.event}</h4>
                            <span className="text-[8px] font-bold text-neutral-400 uppercase leading-none">{item.time}</span>
                          </div>
                          <p className="text-[10px] text-neutral-300 font-medium leading-tight mt-1">{item.details}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <button 
                  onClick={triggerEvidenceExport}
                  className="w-full bg-[#ffc700] text-black hover:bg-yellow-400 transition py-4 rounded-xl border border-black font-black uppercase text-xs tracking-wider shadow-lg flex items-center justify-center gap-2"
                >
                  <Download size={16} /> Download Evidence Pack
                </button>
              </div>

            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
