"use client";

import React, { useState } from "react";
import { Oswald, Inter } from "next/font/google";
import { 
  ArrowLeft, Database, ShieldCheck, Lock, Users, Clipboard, 
  Plus, Check, Play, Download, Settings, RefreshCw, ShieldAlert
} from 'lucide-react';
import Link from "next/link";
import { showToast } from "../utils/Toast";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

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
  },
  {
    id: "wl-4",
    name: "Stripe Checkout Copilot",
    version: "v3.0.0",
    owner: "Finance",
    useCase: "Automated invoice resolution",
    riskTier: "High",
    lineage: "GPT-4o-Mini Proxy",
    biasScore: 0.08,
    driftScore: 0.22,
    vulnerabilityCount: 3,
    certifiedHash: "f4b3a2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3"
  }
];

const DEFAULT_AUDITS = [
  { time: "10:30 AM", event: "Model Certification", details: "Devon React Agent certified with 0 vulnerabilities", status: "success" },
  { time: "09:15 AM", event: "Policy Violation Blocked", details: "Blocked deployment of unapproved sentiment pipeline", status: "error" },
  { time: "Yesterday", event: "Guardrails Config Updated", details: "Rate limiting threshold set to 100 req/min", status: "info" },
  { time: "2 days ago", event: "Vulnerability Scan", details: "Completed scans on Stripe Checkout Copilot: 3 warnings flagged", status: "warning" }
];

export default function GovernancePage() {
  const [workloads, setWorkloads] = useState<Workload[]>(DEFAULT_WORKLOADS);
  const [selectedWlId, setSelectedWlId] = useState<string>("wl-1");
  const [audits, setAudits] = useState(DEFAULT_AUDITS);
  
  // Policy State
  const [contentFiltering, setContentFiltering] = useState(true);
  const [rateLimiting, setRateLimiting] = useState(true);
  const [quotaEnforcement, setQuotaEnforcement] = useState(false);
  const [blockUnapproved, setBlockUnapproved] = useState(true);
  const [yamlConfig, setYamlConfig] = useState(`# Pixorva Governance Guardrail Policy
version: "1.0.0"
guardrails:
  content_filter:
    enabled: true
    sensitivity: "strict"
    blocked_categories: ["toxic", "unapproved_code"]
  rate_limit:
    enabled: true
    requests_per_minute: 100
  quota:
    enabled: false
    monthly_allowance_usd: 50.00
  admission_control:
    block_high_risk: true
    require_signature: true`);

  // Testing Loading states
  const [testingBias, setTestingBias] = useState(false);
  const [testingDrift, setTestingDrift] = useState(false);
  const [scanningSec, setScanningSec] = useState(false);

  // New Workload Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newVersion, setNewVersion] = useState("v1.0.0");
  const [newOwner, setNewOwner] = useState("Engineering");
  const [newUseCase, setNewUseCase] = useState("");
  const [newRisk, setNewRisk] = useState<"Minimal" | "Limited" | "High">("Minimal");
  const [newLineage, setNewLineage] = useState("");

  const activeWorkload = workloads.find(w => w.id === selectedWlId) || workloads[0];

  const handleRegisterWorkload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUseCase.trim()) {
      showToast("Please fill in all workload fields", "error");
      return;
    }

    const newWl: Workload = {
      id: `wl-${Date.now()}`,
      name: newName,
      version: newVersion,
      owner: newOwner,
      useCase: newUseCase,
      riskTier: newRisk,
      lineage: newLineage || "Imported Custom Model",
      biasScore: null,
      driftScore: null,
      vulnerabilityCount: null,
      certifiedHash: null
    };

    setWorkloads(prev => [...prev, newWl]);
    setSelectedWlId(newWl.id);
    
    // Log Audit Event
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAudits(prev => [
      { time: nowStr, event: "Workload Registered", details: `Registered new AI workload: ${newWl.name}`, status: "info" },
      ...prev
    ]);

    // Reset Form
    setNewName("");
    setNewUseCase("");
    setNewLineage("");
    setShowAddForm(false);
    showToast("Workload Registered Successfully!", "success");
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
    }, 1500);
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
    }, 1500);
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
    }, 1500);
  };

  const saveYamlPolicy = () => {
    showToast("Gateway Policy applied successfully!", "success");
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAudits(prev => [
      { time: nowStr, event: "Policy Config Saved", details: "YAML admission controllers updated", status: "info" },
      ...prev
    ]);
  };

  const triggerEvidenceExport = () => {
    const evidenceText = `AI GOVERNANCE CONTROL TOWER - EXPORT EVIDENCE PACK
======================================================
Generated At: ${new Date().toLocaleString()}

1. SYSTEM REGISTRY & METADATA
------------------------------------------------------
Workload Name: ${activeWorkload.name}
Version:       ${activeWorkload.version}
Owner:         ${activeWorkload.owner}
Use Case:      ${activeWorkload.useCase}
Lineage:       ${activeWorkload.lineage}
Risk Category: ${activeWorkload.riskTier}

2. COMPLIANCE ASSESSMENT & SCORECARD
------------------------------------------------------
Bias evaluation index:     ${activeWorkload.biasScore !== null ? activeWorkload.biasScore : 'Pending Scan'}
Population Stability (PSI): ${activeWorkload.driftScore !== null ? activeWorkload.driftScore : 'Pending Scan'}
Vulnerability Count:        ${activeWorkload.vulnerabilityCount !== null ? activeWorkload.vulnerabilityCount : 'Pending Scan'}
Certified Security Hash:    ${activeWorkload.certifiedHash !== null ? activeWorkload.certifiedHash : 'Unsigned'}

3. RUNTIME POLICY GATEWAY RULES
------------------------------------------------------
Content Filtering enabled:  ${contentFiltering ? 'YES' : 'NO'}
Rate Limiting enabled:      ${rateLimiting ? 'YES' : 'NO'}
Admission Controller Block: ${blockUnapproved ? 'YES' : 'NO'}

4. COMPLIANCE AUDIT TIMELINE
------------------------------------------------------
${audits.map(a => `[${a.time}] ${a.event}: ${a.details}`).join('\n')}

======================================================
END OF COMPLIANCE INTEGRITY CERTIFICATION`;

    const blob = new Blob([evidenceText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeWorkload.name.toLowerCase().replace(/\s+/g, '-')}-compliance-card.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Evidence Pack Downloaded!", "success");
  };

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
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Continuous Compliance Control Tower</span>
                  </div>
              </div>
              <div className="bg-yellow-400 text-black border-2 border-black px-3 py-1.5 rounded font-black text-xs uppercase tracking-wide shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                🛡️ Continuous Audit Active
              </div>
          </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* TOP ROW GRID: INVENTORY & SCORING */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* COLUMN 1: AI INVENTORY & REGISTRY (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-100">
                  <div className="flex items-center gap-2">
                    <Database size={20} className="text-black" />
                    <h2 className={`text-xl uppercase ${oswald.className}`}>System Registry</h2>
                  </div>
                  <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-black text-white hover:bg-yellow-400 hover:text-black transition text-xs font-bold uppercase px-3 py-1.5 rounded border border-black flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Register
                  </button>
                </div>

                {showAddForm ? (
                  <form onSubmit={handleRegisterWorkload} className="bg-yellow-50 border-2 border-black p-4 rounded-xl mb-4 space-y-3 animate-in slide-in-from-top-4 duration-200">
                    <h4 className="text-xs font-black uppercase text-yellow-800">Register New Workload</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-gray-600">Model Name *</label>
                        <input 
                          type="text" 
                          required 
                          value={newName} 
                          onChange={(e) => setNewName(e.target.value)} 
                          placeholder="e.g. Llama-3-Chat" 
                          className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-black uppercase text-gray-600">Version</label>
                          <input 
                            type="text" 
                            value={newVersion} 
                            onChange={(e) => setNewVersion(e.target.value)} 
                            placeholder="v1.0.0" 
                            className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black uppercase text-gray-600">Owner</label>
                          <input 
                            type="text" 
                            value={newOwner} 
                            onChange={(e) => setNewOwner(e.target.value)} 
                            placeholder="Engineering" 
                            className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase text-gray-600">Use Case *</label>
                        <input 
                          type="text" 
                          required 
                          value={newUseCase} 
                          onChange={(e) => setNewUseCase(e.target.value)} 
                          placeholder="e.g. SQL Generation" 
                          className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-black uppercase text-gray-600">Risk Tier</label>
                          <select 
                            value={newRisk} 
                            onChange={(e: any) => setNewRisk(e.target.value)} 
                            className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none"
                          >
                            <option value="Minimal">Minimal</option>
                            <option value="Limited">Limited</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-black uppercase text-gray-600">Lineage/Base Model</label>
                          <input 
                            type="text" 
                            value={newLineage} 
                            onChange={(e) => setNewLineage(e.target.value)} 
                            placeholder="Llama-3-8b" 
                            className="w-full text-xs p-2 bg-white border-2 border-black rounded focus:outline-none" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-grow bg-black text-white hover:bg-yellow-400 hover:text-black py-2 rounded text-xs font-bold uppercase transition">Add to Registry</button>
                      <button type="button" onClick={() => setShowAddForm(false)} className="px-3 bg-white border-2 border-black hover:bg-red-50 py-2 rounded text-xs font-bold uppercase transition">Cancel</button>
                    </div>
                  </form>
                ) : null}

                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {workloads.map((wl) => {
                    const isSelected = wl.id === selectedWlId;
                    return (
                      <div 
                        key={wl.id}
                        onClick={() => setSelectedWlId(wl.id)}
                        className={`p-4 border-2 rounded-xl transition cursor-pointer flex justify-between items-center ${isSelected ? 'bg-black text-white border-black' : 'bg-gray-50 text-black border-gray-200 hover:border-black'}`}
                      >
                        <div>
                          <h4 className="font-bold text-xs uppercase">{wl.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-black border ${isSelected ? 'bg-white text-black border-white' : 'bg-gray-200 text-gray-700 border-gray-300'}`}>{wl.version}</span>
                            <span className="text-[9px] font-semibold opacity-60">{wl.owner}</span>
                          </div>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border-2 ${wl.riskTier === 'High' ? 'bg-red-400 text-black border-black' : wl.riskTier === 'Limited' ? 'bg-yellow-400 text-black border-black' : 'bg-green-400 text-black border-black'}`}>
                          {wl.riskTier} Risk
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-50 border-2 border-black p-4 rounded-xl mt-6">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Active Workload Lineage</span>
                <p className="font-mono text-xs font-bold mt-1 text-gray-700">{activeWorkload.lineage}</p>
              </div>
            </div>
          </div>

          {/* COLUMN 2: RISK ENGINE & COMPLIANCE VERIFICATION (7 COLS) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-white border-4 border-black rounded-xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4 pb-3 border-b-2 border-gray-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={20} className="text-black" />
                    <h2 className={`text-xl uppercase ${oswald.className}`}>Compliance Scorecard</h2>
                  </div>
                  <span className={`text-xs font-black uppercase px-3 py-1 rounded border-2 ${activeWorkload.riskTier === 'High' ? 'bg-red-400 border-black' : activeWorkload.riskTier === 'Limited' ? 'bg-yellow-400 border-black' : 'bg-green-400 border-black'}`}>
                    Active: {activeWorkload.name}
                  </span>
                </div>

                {/* Scorecards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  
                  {/* Bias card */}
                  <div className="bg-gray-50 border-2 border-black p-4 rounded-xl text-center">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Bias Ratio</span>
                    <div className="text-2xl font-black my-2">
                      {activeWorkload.biasScore !== null ? activeWorkload.biasScore : "N/A"}
                    </div>
                    {activeWorkload.biasScore !== null ? (
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border border-black ${activeWorkload.biasScore < 0.05 ? 'bg-green-200' : 'bg-yellow-200'}`}>
                        {activeWorkload.biasScore < 0.05 ? 'Passed' : 'Warning'}
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold text-gray-400 uppercase">Scan Pending</span>
                    )}
                  </div>

                  {/* Drift card */}
                  <div className="bg-gray-50 border-2 border-black p-4 rounded-xl text-center">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">PSI Drift Index</span>
                    <div className="text-2xl font-black my-2">
                      {activeWorkload.driftScore !== null ? activeWorkload.driftScore : "N/A"}
                    </div>
                    {activeWorkload.driftScore !== null ? (
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border border-black ${activeWorkload.driftScore < 0.1 ? 'bg-green-200' : 'bg-red-200'}`}>
                        {activeWorkload.driftScore < 0.1 ? 'Stable' : 'High Drift'}
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold text-gray-400 uppercase">Scan Pending</span>
                    )}
                  </div>

                  {/* Vulnerability card */}
                  <div className="bg-gray-50 border-2 border-black p-4 rounded-xl text-center">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Vulnerabilities</span>
                    <div className="text-2xl font-black my-2">
                      {activeWorkload.vulnerabilityCount !== null ? activeWorkload.vulnerabilityCount : "N/A"}
                    </div>
                    {activeWorkload.vulnerabilityCount !== null ? (
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border border-black ${activeWorkload.vulnerabilityCount === 0 ? 'bg-green-200' : 'bg-red-200'}`}>
                        {activeWorkload.vulnerabilityCount === 0 ? 'Secure' : 'Alert'}
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold text-gray-400 uppercase">Scan Pending</span>
                    )}
                  </div>

                </div>

                {/* Audit Integrity Hash */}
                <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-[10px] break-all border-2 border-black mb-6">
                  <div className="flex items-center gap-1.5 mb-1.5 text-gray-400 font-bold uppercase tracking-wider text-[8px]">
                    <ShieldCheck size={12} className="text-green-400" />
                    Audit Certification Signature (SHA-256)
                  </div>
                  {activeWorkload.certifiedHash ? activeWorkload.certifiedHash : "UNSIGNED - RUN VULNERABILITY SCAN TO CERTIFY"}
                </div>
              </div>

              {/* Action Suite */}
              <div className="border-t-2 border-gray-100 pt-6">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Compliance Scan Engine</span>
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
                  onClick={saveYamlPolicy}
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
                    <Clipboard size={20} className="text-black" />
                    <h2 className={`text-xl uppercase ${oswald.className}`}>Audit Vault Logs</h2>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Immutable Vault</span>
                </div>

                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  {audits.map((item, idx) => {
                    return (
                      <div key={idx} className="bg-gray-50 border-2 border-black p-3.5 rounded-xl flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg border border-black mt-0.5 ${item.status === 'success' ? 'bg-green-200' : item.status === 'error' ? 'bg-red-200' : item.status === 'warning' ? 'bg-yellow-200' : 'bg-blue-200'}`}>
                          {item.status === 'error' ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
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
