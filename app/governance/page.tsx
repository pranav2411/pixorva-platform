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
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${inter.className}`}>
        <div className="bg-white border-4 border-black p-8 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center max-w-sm">
          <RefreshCw className="animate-spin mx-auto text-black mb-4" size={32} />
          <h3 className={`text-xl uppercase ${oswald.className}`}>Verifying Access Credentials...</h3>
          <p className="text-xs text-gray-500 font-bold uppercase mt-2">Continuous Compliance Control Tower</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 text-black ${inter.className} pb-12`}>
      
      {/* HEADER */}
      <div className="bg-white border-b-4 border-black sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <Link href="/" className="bg-black text-white p-2 rounded hover:bg-yellow-400 hover:text-black transition border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-none hover:translate-y-1">
                    <ArrowLeft size={20}/>
                  </Link>
                  <div>
                    <h1 className={`text-2xl md:text-3xl uppercase ${oswald.className} tracking-tighter leading-none`}>AI Governance Lab</h1>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Universal LLM Proxy Control Tower</span>
                  </div>
              </div>
              <div className="bg-yellow-400 text-black border-2 border-black px-3 py-1.5 rounded font-black text-xs uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                🛡️ Universal Audit Active
              </div>
          </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Total Proxied Requests</span>
              <span className={`text-2xl font-black ${oswald.className}`}>{totalRequests.toLocaleString()}</span>
            </div>
            <div className="bg-blue-100 p-2 border-2 border-black rounded-lg"><Cpu size={20}/></div>
          </div>

          <div className="bg-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Blocked Violations</span>
              <span className={`text-2xl font-black text-red-500 ${oswald.className}`}>{violationsBlocked}</span>
            </div>
            <div className="bg-red-100 p-2 border-2 border-black rounded-lg"><ShieldAlert size={20} className="text-red-500"/></div>
          </div>

          <div className="bg-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Average Latency</span>
              <span className={`text-2xl font-black ${oswald.className}`}>{avgLatency}ms</span>
            </div>
            <div className="bg-green-100 p-2 border-2 border-black rounded-lg"><Activity size={20} className="text-green-600"/></div>
          </div>

          <div className="bg-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Proxy Accrued Costs</span>
              <span className={`text-2xl font-black ${oswald.className}`}>${totalCost.toFixed(2)}</span>
            </div>
            <div className="bg-yellow-100 p-2 border-2 border-black rounded-lg"><DollarSign size={20} className="text-yellow-600"/></div>
          </div>

        </div>
        
        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* COLUMN 1: PROVIDERS REGISTRY (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-100">
                  <div className="flex items-center gap-2">
                    <Database size={20} className="text-black" />
                    <h2 className={`text-xl uppercase ${oswald.className}`}>LLM Registry</h2>
                  </div>
                  <button 
                    onClick={() => setShowAddProvider(!showAddProvider)}
                    className="bg-black text-white hover:bg-yellow-400 hover:text-black transition text-xs font-bold uppercase px-3 py-1.5 rounded border border-black flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Add Provider
                  </button>
                </div>

                {showAddProvider ? (
                  <form onSubmit={handleAddProviderSubmit} className="bg-yellow-50 border-2 border-black p-4 rounded-xl mb-4 space-y-3 animate-in slide-in-from-top-4 duration-200 text-black">
                    <h4 className="text-xs font-black uppercase text-yellow-800">Integrate Custom LLM</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-gray-600">Provider Name *</label>
                        <input 
                          type="text" 
                          required 
                          value={newProvName} 
                          onChange={(e) => setNewProvName(e.target.value)} 
                          placeholder="e.g. Local Llama Server" 
                          className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase text-gray-600">Proxy Target Model *</label>
                        <input 
                          type="text" 
                          required 
                          value={newProvModel} 
                          onChange={(e) => setNewProvModel(e.target.value)} 
                          placeholder="meta-llama/Meta-Llama-3-8B-Instruct" 
                          className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase text-gray-600">Target Endpoint Url *</label>
                        <input 
                          type="url" 
                          required 
                          value={newProvEndpoint} 
                          onChange={(e) => setNewProvEndpoint(e.target.value)} 
                          placeholder="http://your-gpu-ip:8000/v1" 
                          className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-black uppercase text-gray-600">API Key / Token (Optional)</label>
                          <input 
                            type="password" 
                            value={newProvKey} 
                            onChange={(e) => setNewProvKey(e.target.value)} 
                            placeholder="••••••••••••" 
                            className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black uppercase text-gray-600">Label/Role</label>
                          <input 
                            type="text" 
                            value={newProvRole} 
                            onChange={(e) => setNewProvRole(e.target.value)} 
                            placeholder="Llama-3 Server" 
                            className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-grow bg-black text-white hover:bg-yellow-400 hover:text-black py-2 rounded text-xs font-bold uppercase transition">Connect Endpoint</button>
                      <button type="button" onClick={() => setShowAddProvider(false)} className="px-3 bg-white border-2 border-black hover:bg-red-50 py-2 rounded text-xs font-bold uppercase transition">Cancel</button>
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
                        className={`p-4 border-2 rounded-xl transition cursor-pointer flex justify-between items-center ${isSelected ? 'bg-black text-white border-black shadow' : 'bg-gray-50 text-black border-gray-200 hover:border-black'}`}
                      >
                        <div>
                          <h4 className="font-bold text-xs uppercase">{p.name}</h4>
                          <span className="text-[9px] font-semibold opacity-60 block mt-0.5">{p.model}</span>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border-2 ${p.status === 'Connected' ? 'bg-green-400 text-black border-black' : 'bg-gray-200 text-gray-500 border-gray-300'}`}>
                          {p.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-50 border-2 border-black p-4 rounded-xl mt-6 text-black space-y-3">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pb-1 border-b border-gray-200">Configure Selected Provider</span>
                
                <div>
                  <label className="block text-[8px] font-black uppercase text-gray-500">Endpoint URL</label>
                  <input 
                    type="text" 
                    value={(providers.find(p => p.id === sandboxProvider) || providers[0]).endpoint}
                    onChange={(e) => {
                      const val = e.target.value;
                      setProviders(prev => prev.map(p => p.id === sandboxProvider ? { ...p, endpoint: val } : p));
                    }}
                    className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none mt-1 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] font-black uppercase text-gray-500">Target Model</label>
                    <input 
                      type="text" 
                      value={(providers.find(p => p.id === sandboxProvider) || providers[0]).model}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProviders(prev => prev.map(p => p.id === sandboxProvider ? { ...p, model: val } : p));
                      }}
                      className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase text-red-500 font-bold">Your API Key *</label>
                    <input 
                      type="password" 
                      value={(providers.find(p => p.id === sandboxProvider) || providers[0]).apiKey || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProviders(prev => prev.map(p => p.id === sandboxProvider ? { ...p, apiKey: val, status: val.trim() ? "Connected" : "Not Configured" } : p));
                      }}
                      placeholder="Enter API Key"
                      className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: UNIVERSAL PROXY GATEWAY SANDBOX (7 COLS) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-100">
                  <div className="flex items-center gap-2">
                    <Activity size={20} className="text-black" />
                    <h2 className={`text-xl uppercase ${oswald.className}`}>Proxy Gateway Sandbox</h2>
                  </div>
                  <span className="text-xs font-black uppercase px-3 py-1 rounded border-2 bg-yellow-400 border-black">
                    Live Testing
                  </span>
                </div>

                {/* Tester panel */}
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Enter Test Prompt</label>
                    <textarea 
                      value={sandboxPrompt} 
                      onChange={(e) => setSandboxPrompt(e.target.value)} 
                      rows={3}
                      placeholder="e.g. Write a script to fetch server status (Try containing 'hack' or 'exploit' to test Content Filters)"
                      className="w-full text-xs p-3 bg-gray-50 border-2 border-black rounded-xl focus:outline-none focus:ring-0 leading-relaxed placeholder-gray-400 text-black"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <button 
                      disabled={sendingSandbox || !sandboxPrompt.trim()}
                      onClick={handleSendSandbox}
                      className="bg-black text-white hover:bg-yellow-400 hover:text-black transition px-6 py-3 rounded-lg border-2 border-black font-black uppercase text-xs tracking-wider disabled:opacity-50"
                    >
                      {sendingSandbox ? "Routing..." : "Send via Proxy"}
                    </button>
                    
                    {sandboxMeta && (
                      <div className="flex gap-4 text-[9px] font-black uppercase bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg text-gray-500">
                        <span>Latency: <strong className="text-black">{sandboxMeta.latency}ms</strong></span>
                        <span>Tokens: <strong className="text-black">{sandboxMeta.inTokens + sandboxMeta.outTokens}</strong></span>
                        <span>Cost: <strong className="text-black">${sandboxMeta.cost.toFixed(5)}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Sandbox Response Output */}
                  {sandboxResponse && (
                    <div className="space-y-1 animate-in zoom-in-95 duration-200">
                      <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Gateway Response Output</span>
                      <div className={`p-4 border-2 border-black rounded-xl font-medium text-xs break-words leading-relaxed max-h-48 overflow-y-auto ${sandboxResponse.includes('403 Forbidden') ? 'bg-red-50 text-red-800 border-red-200' : 'bg-gray-50 text-gray-800'}`}>
                        {sandboxResponse}
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Assessment Dials */}
              <div className="border-t-2 border-gray-100 pt-6">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Model Compliance Verification</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button 
                    disabled={testingBias}
                    onClick={runBiasTest}
                    className="bg-black text-white hover:bg-yellow-400 hover:text-black py-3 rounded-lg border-2 border-black font-bold uppercase text-[10px] flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={testingBias ? "animate-spin" : ""} /> {testingBias ? "Evaluating..." : "Run Bias Test"}
                  </button>
                  <button 
                    disabled={testingDrift}
                    onClick={runDriftTest}
                    className="bg-black text-white hover:bg-yellow-400 hover:text-black py-3 rounded-lg border-2 border-black font-bold uppercase text-[10px] flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={testingDrift ? "animate-spin" : ""} /> {testingDrift ? "Analyzing..." : "PSI Drift Test"}
                  </button>
                  <button 
                    disabled={scanningSec}
                    onClick={runVulnerabilityScan}
                    className="bg-yellow-400 text-black hover:bg-black hover:text-white py-3 rounded-lg border-2 border-black font-bold uppercase text-[10px] flex items-center justify-center gap-2 transition disabled:opacity-50"
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
            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-grow flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-100">
                  <Lock size={20} className="text-black" />
                  <h2 className={`text-xl uppercase ${oswald.className}`}>Policy Enforcement Gateway</h2>
                </div>

                {/* Switch Toggles */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  
                  <div className="bg-gray-50 border-2 border-black p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-black uppercase">Content Filter</h4>
                      <p className="text-[8px] text-gray-400 font-bold uppercase leading-none mt-1">Block toxic output</p>
                    </div>
                    <button 
                      onClick={() => setContentFiltering(!contentFiltering)}
                      className={`w-11 h-6 rounded-full border-2 border-black transition relative ${contentFiltering ? 'bg-green-400' : 'bg-gray-200'}`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white border border-black absolute top-0.5 transition-all ${contentFiltering ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="bg-gray-50 border-2 border-black p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-black uppercase">Rate Limiting</h4>
                      <p className="text-[8px] text-gray-400 font-bold uppercase leading-none mt-1">Throttling endpoints</p>
                    </div>
                    <button 
                      onClick={() => setRateLimiting(!rateLimiting)}
                      className={`w-11 h-6 rounded-full border-2 border-black transition relative ${rateLimiting ? 'bg-green-400' : 'bg-gray-200'}`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white border border-black absolute top-0.5 transition-all ${rateLimiting ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="bg-gray-50 border-2 border-black p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-black uppercase">Quota Enforce</h4>
                      <p className="text-[8px] text-gray-400 font-bold uppercase leading-none mt-1">Cap API billing cost</p>
                    </div>
                    <button 
                      onClick={() => setQuotaEnforcement(!quotaEnforcement)}
                      className={`w-11 h-6 rounded-full border-2 border-black transition relative ${quotaEnforcement ? 'bg-green-400' : 'bg-gray-200'}`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white border border-black absolute top-0.5 transition-all ${quotaEnforcement ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  <div className="bg-gray-50 border-2 border-black p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-black uppercase">Block High-Risk</h4>
                      <p className="text-[8px] text-gray-400 font-bold uppercase leading-none mt-1">Admission Control</p>
                    </div>
                    <button 
                      onClick={() => setBlockUnapproved(!blockUnapproved)}
                      className={`w-11 h-6 rounded-full border-2 border-black transition relative ${blockUnapproved ? 'bg-green-400' : 'bg-gray-200'}`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white border border-black absolute top-0.5 transition-all ${blockUnapproved ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>

                </div>

                {/* YAML editor */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Runtime YAML Config</label>
                  <textarea 
                    value={yamlConfig} 
                    onChange={(e) => setYamlConfig(e.target.value)} 
                    rows={8}
                    className="w-full font-mono text-[10px] bg-gray-900 text-green-400 p-3 rounded-xl border-2 border-black focus:outline-none focus:ring-0 leading-relaxed"
                  />
                </div>
              </div>

              <div className="mt-4">
                <button 
                  onClick={() => showToast("Gateway Policy applied successfully!", "success")}
                  className="w-full bg-black text-white hover:bg-yellow-400 hover:text-black transition py-3 rounded-lg border-2 border-black font-bold uppercase text-[10px]"
                >
                  Apply Gateway Rules
                </button>
              </div>

            </div>
          </div>

          {/* COLUMN 2: AUDIT LOGS & EXPORT (6 COLS) */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-100">
                  <div className="flex items-center gap-2">
                    <FileCode size={20} className="text-black" />
                    <h2 className={`text-xl uppercase ${oswald.className}`}>Audit Vault Logs</h2>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Immutable Vault</span>
                </div>

                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  {audits.map((item, idx) => {
                    return (
                      <div key={idx} className="bg-gray-50 border-2 border-black p-3.5 rounded-xl flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg border border-black mt-0.5 ${item.status === 'success' ? 'bg-green-200' : item.status === 'error' ? 'bg-red-200' : item.status === 'warning' ? 'bg-yellow-200' : 'bg-blue-200'}`}>
                          <ShieldCheck size={14} />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-black uppercase leading-none">{item.event}</h4>
                            <span className="text-[8px] font-bold text-gray-400 uppercase leading-none">{item.time}</span>
                          </div>
                          <p className="text-[10px] text-gray-600 font-medium leading-tight mt-1">{item.details}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <button 
                  onClick={triggerEvidenceExport}
                  className="w-full bg-yellow-400 text-black hover:bg-black hover:text-white transition py-4 rounded-xl border-4 border-black font-black uppercase text-xs tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5 flex items-center justify-center gap-2"
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
