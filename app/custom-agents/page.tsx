"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import Image from "next/image";
import { Oswald, Inter } from "next/font/google";
import {
  ArrowLeft,
  Sparkles,
  Bot,
  Building2,
  Globe,
  Database,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Mail,
  Phone,
  Clock,
  Server,
  Zap,
  Lock,
  Workflow,
  HelpCircle,
  Copy,
  Check,
  CheckCheck,
  ExternalLink,
  Users,
  Send
} from "lucide-react";

const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"] });
const inter = Inter({ subsets: ["latin"] });

// Available Agent Roles for Selection
const ROLE_OPTIONS = [
  { id: "sales", title: "Sales & Inbound Lead Qualifier", desc: "Autonomous prospect scoring, cold email cadence, CRM updates", icon: "💼" },
  { id: "support", title: "24/7 Tier-1 & Tier-2 Support", desc: "Ticket triaging, empathy-first resolving, escalation routing", icon: "🎧" },
  { id: "devops", title: "DevOps & Cloud SRE Guard", desc: "Log monitoring, canary alerts, auto-rollback triggers", icon: "⚡" },
  { id: "fullstack", title: "Full-Stack Code Synthesizer", desc: "PR creation, unit test authoring, architectural sandboxing", icon: "💻" },
  { id: "finance", title: "Financial & Invoicing Auditor", desc: "Tax receipts reconciliation, anomaly detection, payment tracking", icon: "📊" },
  { id: "governance", title: "Compliance & Safety Auditor", desc: "PII masking, audit logging, security policy enforcement", icon: "🛡️" },
  { id: "ops", title: "Internal Operations Coordinator", desc: "Calendar dispatch, sprint reports, cross-team sync digests", icon: "📋" },
  { id: "marketing", title: "Growth & Content Strategist", desc: "SEO research, blog authoring, social content scheduling", icon: "🚀" }
];

// Integrations Options
const INTEGRATION_OPTIONS = [
  "Slack", "Discord", "HubSpot", "Salesforce", "PostgreSQL",
  "MongoDB", "Snowflake", "Notion", "GitHub", "Jira",
  "Stripe / Razorpay", "WhatsApp API", "Custom REST / GraphQL"
];

// Industry list
const INDUSTRIES = [
  "SaaS & Software", "FinTech & Banking", "E-Commerce & Retail",
  "Healthcare & MedTech", "Logistics & Supply Chain", "Legal & Compliance",
  "Real Estate & PropTech", "Education & EdTech", "Manufacturing",
  "Agency & Consulting", "Media & Entertainment", "Other"
];

export default function CustomAgentsPage() {
  // Navigation & Wizard State
  const [activeDocTab, setActiveDocTab] = useState<"architecture" | "security" | "integrations" | "lifecycle">("architecture");
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);

  // Form State
  const [companyName, setCompanyName] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [industry, setIndustry] = useState<string>("SaaS & Software");
  const [companySize, setCompanySize] = useState<string>("11-50");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["24/7 Tier-1 & Tier-2 Support", "Sales & Inbound Lead Qualifier"]);
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>(["Slack", "PostgreSQL"]);
  const [bottlenecks, setBottlenecks] = useState<string>("");
  const [dailyVolume, setDailyVolume] = useState<string>("1,000 - 5,000 actions/day");
  const [hostingPreference, setHostingPreference] = useState<string>("Managed Dedicated Cloud");
  const [fullName, setFullName] = useState<string>("");
  const [workEmail, setWorkEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [timeline, setTimeline] = useState<string>("Within 2 weeks");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");

  // Extract clean domain for favicon
  const cleanDomain = React.useMemo(() => {
    if (!website) return "";
    try {
      const url = website.startsWith("http://") || website.startsWith("https://") ? website : `https://${website}`;
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch (e) {
      return website.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
    }
  }, [website]);

  // Toggle role selection
  const toggleRole = (title: string) => {
    setSelectedRoles(prev => 
      prev.includes(title) ? prev.filter(r => r !== title) : [...prev, title]
    );
  };

  // Toggle integration selection
  const toggleIntegration = (item: string) => {
    setSelectedIntegrations(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  // Scroll to intake wizard
  const scrollToWizard = () => {
    const el = document.getElementById("intake-wizard");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!companyName.trim() || !workEmail.trim() || !fullName.trim()) {
      setSubmitError("Please fill in your company name, full name, and work email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/custom-agents/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          website,
          industry,
          companySize,
          roles: selectedRoles,
          integrations: selectedIntegrations,
          bottlenecks,
          dailyVolume,
          hostingPreference,
          fullName,
          workEmail,
          phone,
          timeline,
          additionalNotes
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit custom agent request.");
      }

      setSubmittedRequest({
        refId: data.refId,
        companyName,
        website,
        industry,
        roles: selectedRoles,
        integrations: selectedIntegrations,
        workEmail,
        fullName,
        timeline
      });
      setWizardStep(4); // Success step
    } catch (err: any) {
      setSubmitError(err.message || "Something went wrong while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReferenceId = () => {
    if (submittedRequest?.refId) {
      navigator.clipboard.writeText(submittedRequest.refId);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  return (
    <div className={`min-h-screen bg-[#0e0f12] text-white ${inter.className} flex flex-col selection:bg-[#ffc700] selection:text-black`}>
      
      {/* Top Header */}
      <header className="bg-[#141519]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-black/50 text-white p-2 rounded-xl hover:bg-[#ffc700] hover:text-black transition border border-white/15 shadow-sm flex items-center justify-center shrink-0"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#ffc700] bg-[#ffc700]/10 px-2 py-0.5 rounded border border-[#ffc700]/30">
                  Enterprise Solutions
                </span>
              </div>
              <h1 className={`text-xl md:text-2xl font-black uppercase tracking-wider text-white ${oswald.className}`}>
                Personalized AI Agents
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/docs"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-neutral-300 hover:text-white transition px-3 py-2"
            >
              Docs Overview
            </Link>
            <button
              onClick={scrollToWizard}
              className="bg-[#ffc700] hover:bg-yellow-400 text-black px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider shadow-[0px_0px_15px_rgba(255,199,0,0.3)] transition transform active:scale-95 flex items-center gap-2"
            >
              <Sparkles size={14} />
              <span>Get Agents for Your Business</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-white/10">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,199,0,0.12),rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#1a1b22] border border-[#ffc700]/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-[#ffc700] animate-pulse" />
              Tailored AI Workforce Engineering for High-Growth Teams
            </div>

            <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] text-white ${oswald.className}`}>
              Autonomous AI Agents Built Just For Your <span className="text-[#ffc700]">Business DNA</span>
            </h2>

            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-normal">
              Generic chatbots fail because they don’t have access to your proprietary databases, internal APIs, or domain logic.
              Pixorva designs, fine-tunes, and deploys <strong>custom AI workforce swarms</strong> natively integrated into your tools,
              executing complex operational workflows with human-grade autonomy.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={scrollToWizard}
                className="bg-[#ffc700] hover:bg-yellow-400 text-black px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg transition transform active:scale-95 flex items-center gap-2.5"
              >
                <span>Request Custom Workforce</span>
                <ArrowRight size={16} />
              </button>

              <a
                href="#capabilities-preview"
                className="bg-[#18191f] hover:bg-[#20222a] border border-white/15 text-white px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-2"
              >
                <span>Explore Capabilities</span>
                <ChevronRight size={14} />
              </a>
            </div>

            {/* Trust Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-white/10">
              <div>
                <div className="text-2xl font-black text-[#ffc700]">100%</div>
                <div className="text-xs text-neutral-400 font-medium mt-0.5">Private Tool Calling</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">0%</div>
                <div className="text-xs text-neutral-400 font-medium mt-0.5">Data Retention for Training</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">&lt; 14 Days</div>
                <div className="text-xs text-neutral-400 font-medium mt-0.5">Discovery to Production</div>
              </div>
              <div>
                <div className="text-2xl font-black text-[#ffc700]">24/7</div>
                <div className="text-xs text-neutral-400 font-medium mt-0.5">Autonomous Execution</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Part 1: Documentation & Capabilities Section */}
      <section id="capabilities-preview" className="py-16 max-w-7xl mx-auto px-6 w-full space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#ffc700]">
            Enterprise Architecture & Capabilities
          </span>
          <h3 className={`text-3xl sm:text-4xl font-black uppercase text-white ${oswald.className}`}>
            What You Can Get From Pixorva
          </h3>
          <p className="text-sm text-neutral-400">
            Read through our architecture blueprints below to understand how bespoke agents operate inside your private perimeter.
          </p>
        </div>

        {/* Interactive Capability Tabs */}
        <div className="bg-[#141519] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8">
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
            <button
              onClick={() => setActiveDocTab("architecture")}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 ${
                activeDocTab === "architecture"
                  ? "bg-[#ffc700] text-black shadow-md"
                  : "bg-black/40 text-neutral-400 hover:text-white hover:bg-black/60"
              }`}
            >
              <Workflow size={14} />
              <span>1. Bespoke Agent Architecture</span>
            </button>
            <button
              onClick={() => setActiveDocTab("integrations")}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 ${
                activeDocTab === "integrations"
                  ? "bg-[#ffc700] text-black shadow-md"
                  : "bg-black/40 text-neutral-400 hover:text-white hover:bg-black/60"
              }`}
            >
              <Database size={14} />
              <span>2. Custom Tool & API Calling</span>
            </button>
            <button
              onClick={() => setActiveDocTab("security")}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 ${
                activeDocTab === "security"
                  ? "bg-[#ffc700] text-black shadow-md"
                  : "bg-black/40 text-neutral-400 hover:text-white hover:bg-black/60"
              }`}
            >
              <ShieldCheck size={14} />
              <span>3. Enterprise Security & Isolation</span>
            </button>
            <button
              onClick={() => setActiveDocTab("lifecycle")}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 ${
                activeDocTab === "lifecycle"
                  ? "bg-[#ffc700] text-black shadow-md"
                  : "bg-black/40 text-neutral-400 hover:text-white hover:bg-black/60"
              }`}
            >
              <Clock size={14} />
              <span>4. Delivery & Governance SLA</span>
            </button>
          </div>

          {/* Tab 1: Architecture */}
          {activeDocTab === "architecture" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h4 className={`text-2xl font-black uppercase text-white ${oswald.className}`}>
                  Autonomous Multi-Agent Swarms
                </h4>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Instead of a single monolithic model attempting to do everything, Pixorva configures role-specialized agent swarms. Each agent is instantiated with a dedicated operational domain, distinct memory context, and fine-tuned instructions.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 bg-black/40 p-3.5 rounded-xl border border-white/5">
                    <div className="bg-[#ffc700]/20 text-[#ffc700] p-2 rounded-lg font-bold">01</div>
                    <div>
                      <h5 className="text-xs font-black uppercase text-white">Delegation & Sub-Task Hand-offs</h5>
                      <p className="text-xs text-neutral-400 mt-0.5">Agents communicate via structured JSON RPC protocols, handing off tasks autonomously from discovery to execution.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-black/40 p-3.5 rounded-xl border border-white/5">
                    <div className="bg-[#ffc700]/20 text-[#ffc700] p-2 rounded-lg font-bold">02</div>
                    <div>
                      <h5 className="text-xs font-black uppercase text-white">Stateful Long-Term Vector Memory</h5>
                      <p className="text-xs text-neutral-400 mt-0.5">Continuous memory embeddings of past customer tickets, codebase documentation, and past successful resolutions.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-black/40 p-3.5 rounded-xl border border-white/5">
                    <div className="bg-[#ffc700]/20 text-[#ffc700] p-2 rounded-lg font-bold">03</div>
                    <div>
                      <h5 className="text-xs font-black uppercase text-white">Self-Healing Error Correction</h5>
                      <p className="text-xs text-neutral-400 mt-0.5">When an API call returns a 4xx or 5xx code, the agent inspects the stack trace, corrects the payload, and re-executes automatically.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Architecture Blueprint Card */}
              <div className="bg-[#0e0f12] border border-white/10 rounded-2xl p-6 font-mono text-xs space-y-4 shadow-inner">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-sans font-bold flex items-center gap-1.5">
                    <Server size={14} className="text-[#ffc700]" />
                    Pixorva Swarm Topology
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-sans font-bold">
                    Active Pipeline
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="bg-[#18191f] p-3 rounded-lg border border-white/5 flex items-center justify-between">
                    <span className="text-neutral-300">Trigger: Inbound Webhook / Ticket / Event</span>
                    <span className="text-[#ffc700]">📥 Ingestion</span>
                  </div>
                  <div className="text-center text-neutral-500">↓ [Decentralized Queue]</div>
                  <div className="bg-[#1f2028] p-3 rounded-lg border border-[#ffc700]/30 flex items-center justify-between">
                    <div>
                      <span className="text-white font-bold">Supervisor Agent (Orchestrator)</span>
                      <p className="text-[10px] text-neutral-400 font-sans mt-0.5">Routes sub-tasks to specialized micro-agents</p>
                    </div>
                    <span className="bg-[#ffc700] text-black text-[10px] font-sans font-black px-2 py-0.5 rounded">LEADER</span>
                  </div>
                  <div className="text-center text-neutral-500">↓ [Parallel Dispatch]</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/60 p-2.5 rounded border border-white/10">
                      <div className="text-neutral-200 font-bold">Agent Devon</div>
                      <div className="text-[10px] text-neutral-400">Writes & tests PRs</div>
                    </div>
                    <div className="bg-black/60 p-2.5 rounded border border-white/10">
                      <div className="text-neutral-200 font-bold">Agent Cy</div>
                      <div className="text-[10px] text-neutral-400">Audits security & PII</div>
                    </div>
                  </div>
                  <div className="text-center text-neutral-500">↓ [Verification Passed]</div>
                  <div className="bg-emerald-950/40 border border-emerald-700/50 p-3 rounded-lg text-emerald-300 flex items-center justify-between">
                    <span>Execution: Direct Commit / Slack Alert / DB Update</span>
                    <CheckCircle2 size={16} className="text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Integrations */}
          {activeDocTab === "integrations" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h4 className={`text-2xl font-black uppercase text-white ${oswald.className}`}>
                  Proprietary Tool Calling & Custom Connectors
                </h4>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  Your custom agents are equipped with secure function calling schemas tailored directly to your internal software stack. Whether you use Postgres, HubSpot, or a bespoke in-house microservice, our team writes zero-latency connectors with sandboxed auth.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="font-bold text-xs text-white">Database Reads & Writes</div>
                    <p className="text-[11px] text-neutral-400 mt-1">Read-replica querying, schema-validated row updates, and safe transaction rollbacks.</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="font-bold text-xs text-white">Bi-Directional Messaging</div>
                    <p className="text-[11px] text-neutral-400 mt-1">Chat directly with your agents via Slack threads, Discord servers, or WhatsApp channels.</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="font-bold text-xs text-white">Custom Webhooks & REST</div>
                    <p className="text-[11px] text-neutral-400 mt-1">Trigger actions from Zapier, Make, GitHub Actions, or any HTTP endpoint.</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <div className="font-bold text-xs text-white">Human Approval Gates</div>
                    <p className="text-[11px] text-neutral-400 mt-1">Optional one-click confirmation alerts in Slack before executing sensitive transactions.</p>
                  </div>
                </div>
              </div>

              {/* Supported Tools Grid */}
              <div className="bg-[#0e0f12] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-neutral-400">
                  Ready-to-Deploy Connectors
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {["PostgreSQL", "Slack", "HubSpot", "Salesforce", "Snowflake", "GitHub", "Jira", "Stripe", "Notion", "AWS / GCP", "Discord", "Custom API"].map((tool, idx) => (
                    <div key={idx} className="bg-[#18191f] border border-white/10 p-3 rounded-xl text-center hover:border-[#ffc700] transition">
                      <div className="font-bold text-xs text-white">{tool}</div>
                      <div className="text-[9px] text-[#ffc700] mt-0.5">Plug & Play</div>
                    </div>
                  ))}
                </div>
                <div className="bg-yellow-950/20 border border-yellow-700/30 p-3 rounded-xl text-xs text-yellow-200/90 leading-relaxed">
                  💡 <strong>Have proprietary internal software?</strong> We write bespoke MCP (Model Context Protocol) servers and OpenAPI connectors to interface with your legacy systems securely.
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Security */}
          {activeDocTab === "security" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h4 className={`text-2xl font-black uppercase text-white ${oswald.className}`}>
                  Enterprise Air-Gapping & Zero-Data-Retention
                </h4>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  We treat your company data as strictly confidential. Your corporate IP, customer chats, and database contents are never retained, sold, or used to train foundational AI models.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 flex items-start gap-3">
                    <Lock size={16} className="text-[#ffc700] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs text-white">Dedicated VPC Peering & Isolation</div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Host agents in your own AWS/GCP virtual private cloud or on dedicated Pixorva single-tenant clusters.</p>
                    </div>
                  </div>
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 flex items-start gap-3">
                    <ShieldCheck size={16} className="text-[#ffc700] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs text-white">Dynamic PII & Secret Redaction</div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Automated regex scrubbers mask credit cards, passwords, and personal identifiers before LLM ingestion.</p>
                    </div>
                  </div>
                  <div className="bg-black/40 p-3.5 rounded-xl border border-white/5 flex items-start gap-3">
                    <Server size={16} className="text-[#ffc700] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-xs text-white">Full Immutable Audit Logs</div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Every prompt, output, tool execution, and approval step is signed and exportable for compliance.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance Badge Card */}
              <div className="bg-[#0e0f12] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-neutral-400">
                  Compliance Standards Guaranteed
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-[#18191f] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={18} className="text-emerald-400" />
                      <span className="text-xs font-bold text-white">SOC 2 Type II Alignment</span>
                    </div>
                    <span className="text-[10px] text-neutral-400">Rigorous Access Controls</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#18191f] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={18} className="text-emerald-400" />
                      <span className="text-xs font-bold text-white">GDPR & CCPA Compliant</span>
                    </div>
                    <span className="text-[10px] text-neutral-400">Zero Retention by Default</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#18191f] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck size={18} className="text-emerald-400" />
                      <span className="text-xs font-bold text-white">HIPAA-Eligible Architecture</span>
                    </div>
                    <span className="text-[10px] text-neutral-400">Available on Dedicated Tiers</span>
                  </div>
                </div>
                <div className="pt-2 text-center">
                  <a
                    href="mailto:support@pixorva.org?subject=Security%20Whitepaper%20Inquiry"
                    className="text-xs text-[#ffc700] hover:underline font-bold"
                  >
                    Request Security Whitepaper (support@pixorva.org) →
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Lifecycle */}
          {activeDocTab === "lifecycle" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <h4 className={`text-2xl font-black uppercase text-white ${oswald.className}`}>
                  Turnkey Deployment in Under 14 Days
                </h4>
                <p className="text-sm text-neutral-300 leading-relaxed">
                  We don’t just hand you an API key and leave you to figure it out. Pixorva pairs you with a dedicated Forward Deployed Solutions Engineer to design, test, sandbox, and launch your agents into production.
                </p>
                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="bg-[#ffc700] text-black text-xs font-black px-2 py-0.5 rounded">Phase 1</span>
                    <div>
                      <div className="font-bold text-xs text-white">Discovery & Workflow Blueprinting (Days 1–3)</div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">We analyze your bottlenecks, SOPs, and target tools to draft complete agent interaction diagrams.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="bg-[#ffc700] text-black text-xs font-black px-2 py-0.5 rounded">Phase 2</span>
                    <div>
                      <div className="font-bold text-xs text-white">Connector Engineering & Sandboxing (Days 4–8)</div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">We integrate private APIs, configure database tools, and validate edge cases in an isolated test environment.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                    <span className="bg-[#ffc700] text-black text-xs font-black px-2 py-0.5 rounded">Phase 3</span>
                    <div>
                      <div className="font-bold text-xs text-white">Production Launch & Monitoring (Days 9–14)</div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Live deployment with 99.9% uptime SLA, latency monitoring, and continuous prompt fine-tuning.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLA Guarantee Box */}
              <div className="bg-[#0e0f12] border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Zap size={18} className="text-[#ffc700]" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">Enterprise SLA Guarantees</span>
                </div>
                <ul className="space-y-2.5 text-xs text-neutral-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span><strong>99.9% Uptime SLA:</strong> High-availability failover across multi-region nodes.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span><strong>Sub-Second Tool Latency:</strong> Optimized edge compute execution for API actions.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span><strong>Dedicated Solutions Engineer:</strong> Slack-shared channel with our core team.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                    <span><strong>Weekly Prompt & Vector Refinement:</strong> Continuous adaptation to changing business logic.</span>
                  </li>
                </ul>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>Questions about custom contracts?</span>
                  <a href="mailto:support@pixorva.org" className="text-[#ffc700] hover:underline font-bold">support@pixorva.org</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Part 2: Interactive Intake Wizard ("Get Agents for Your Business") */}
      <section id="intake-wizard" className="py-16 bg-[#141519]/70 border-t border-white/10 relative">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#ffc700] bg-[#ffc700]/10 px-3 py-1 rounded-full border border-[#ffc700]/20">
              Interactive Intake Questionnaire
            </span>
            <h3 className={`text-3xl sm:text-4xl font-black uppercase text-white ${oswald.className}`}>
              Get Personalized Agents For Your Business
            </h3>
            <p className="text-sm text-neutral-400 max-w-xl mx-auto">
              Answer a few questions regarding your business, required workforce roles, and integrations. Our team will review your specs and construct a custom deployment blueprint.
            </p>
          </div>

          {/* Stepper Progress Bar (Steps 1 to 3, or Success 4) */}
          {wizardStep < 4 && (
            <div className="bg-[#0e0f12] border border-white/10 rounded-2xl p-4 flex items-center justify-between max-w-2xl mx-auto">
              <div className={`flex items-center gap-2 ${wizardStep >= 1 ? "text-[#ffc700]" : "text-neutral-500"}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                  wizardStep >= 1 ? "bg-[#ffc700] text-black" : "bg-neutral-800 text-neutral-400"
                }`}>
                  1
                </div>
                <span className="text-xs font-bold hidden sm:inline">Business Profile</span>
              </div>

              <div className="h-0.5 flex-grow mx-3 bg-white/10 relative">
                <div 
                  className="h-0.5 bg-[#ffc700] transition-all duration-300"
                  style={{ width: wizardStep === 1 ? "0%" : wizardStep === 2 ? "50%" : "100%" }}
                />
              </div>

              <div className={`flex items-center gap-2 ${wizardStep >= 2 ? "text-[#ffc700]" : "text-neutral-500"}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                  wizardStep >= 2 ? "bg-[#ffc700] text-black" : "bg-neutral-800 text-neutral-400"
                }`}>
                  2
                </div>
                <span className="text-xs font-bold hidden sm:inline">Agent Requirements</span>
              </div>

              <div className="h-0.5 flex-grow mx-3 bg-white/10 relative">
                <div 
                  className="h-0.5 bg-[#ffc700] transition-all duration-300"
                  style={{ width: wizardStep <= 2 ? "0%" : "100%" }}
                />
              </div>

              <div className={`flex items-center gap-2 ${wizardStep >= 3 ? "text-[#ffc700]" : "text-neutral-500"}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                  wizardStep >= 3 ? "bg-[#ffc700] text-black" : "bg-neutral-800 text-neutral-400"
                }`}>
                  3
                </div>
                <span className="text-xs font-bold hidden sm:inline">Contact & Timeline</span>
              </div>
            </div>
          )}

          {/* Form Container */}
          <div className="bg-[#141519] border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            
            {/* Step 1: Business Profile */}
            {wizardStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-4">
                  <h4 className={`text-2xl font-black uppercase text-white ${oswald.className}`}>
                    Step 1: Tell Us About Your Business
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    We personalize agent training and tool configurations around your specific operational domain.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                      <Building2 size={14} className="text-[#ffc700]" />
                      Company / Organization Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Acme Corp, Inc."
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-[#0e0f12] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] transition"
                      required
                    />
                  </div>

                  {/* Business Website with Favicon Preview */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                      <Globe size={14} className="text-[#ffc700]" />
                      Business Website / Domain
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 flex items-center justify-center w-5 h-5">
                        {cleanDomain ? (
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`}
                            alt="Domain favicon"
                            className="w-4 h-4 rounded-sm object-contain"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Globe size={14} className="text-neutral-500" />
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="example.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full bg-[#0e0f12] border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] transition"
                      />
                    </div>
                  </div>

                  {/* Industry */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Industry / Sector
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-[#0e0f12] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ffc700] transition"
                    >
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind} className="bg-[#141519] text-white">
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Company Size */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Current Team Headcount
                    </label>
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full bg-[#0e0f12] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ffc700] transition"
                    >
                      <option value="1-10" className="bg-[#141519]">1 - 10 Employees (Seed / Boutique)</option>
                      <option value="11-50" className="bg-[#141519]">11 - 50 Employees (Early Growth)</option>
                      <option value="51-200" className="bg-[#141519]">51 - 200 Employees (Scale-up)</option>
                      <option value="201-1000" className="bg-[#141519]">201 - 1,000 Employees (Mid-Market)</option>
                      <option value="1000+" className="bg-[#141519]">1,000+ Employees (Global Enterprise)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="text-xs text-neutral-500">
                    Step 1 of 3
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!companyName.trim()) {
                        setSubmitError("Please provide your company name to proceed.");
                        return;
                      }
                      setSubmitError(null);
                      setWizardStep(2);
                    }}
                    className="bg-[#ffc700] hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 active:scale-95 shadow-md"
                  >
                    <span>Next: Agent Requirements</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Agent Specs & Requirements */}
            {wizardStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                  <div>
                    <h4 className={`text-2xl font-black uppercase text-white ${oswald.className}`}>
                      Step 2: AI Workforce & Technical Requirements
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1">
                      Choose which roles you need agents to perform and which tools they should interface with.
                    </p>
                  </div>
                  <span className="text-xs bg-[#ffc700]/10 text-[#ffc700] border border-[#ffc700]/30 px-2.5 py-1 rounded font-bold">
                    {selectedRoles.length} Roles Selected
                  </span>
                </div>

                {/* Role Selection Grid */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Select Target Roles Needed (Choose all that apply)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ROLE_OPTIONS.map((role) => {
                      const isSelected = selectedRoles.includes(role.title);
                      return (
                        <div
                          key={role.id}
                          onClick={() => toggleRole(role.title)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                            isSelected
                              ? "bg-[#ffc700]/10 border-[#ffc700] shadow-[0_0_12px_rgba(255,199,0,0.15)]"
                              : "bg-[#0e0f12] border-white/10 hover:border-white/25"
                          }`}
                        >
                          <div className="text-2xl shrink-0">{role.icon}</div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-xs text-white truncate">{role.title}</h5>
                              {isSelected && (
                                <CheckCircle2 size={16} className="text-[#ffc700] shrink-0 ml-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">{role.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Integrations Chips */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Software & Services to Integrate
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INTEGRATION_OPTIONS.map((item) => {
                      const isSelected = selectedIntegrations.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleIntegration(item)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-[#ffc700] text-black shadow-sm"
                              : "bg-[#0e0f12] text-neutral-400 border border-white/10 hover:text-white hover:border-white/20"
                          }`}
                        >
                          {isSelected && <Check size={12} />}
                          <span>{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Specific Problem / Bottlenecks */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    What specific operational bottlenecks should these agents solve?
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g., Our tier-1 support receives 400 tickets/day about refund status and API key resets. We want an agent that queries Postgres, verifies Stripe transactions, and replies autonomously within 30 seconds."
                    value={bottlenecks}
                    onChange={(e) => setBottlenecks(e.target.value)}
                    className="w-full bg-[#0e0f12] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] transition"
                  />
                </div>

                {/* Volume & Hosting */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Estimated Daily Agent Activity
                    </label>
                    <select
                      value={dailyVolume}
                      onChange={(e) => setDailyVolume(e.target.value)}
                      className="w-full bg-[#0e0f12] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ffc700]"
                    >
                      <option value="< 500 actions/day" className="bg-[#141519]">&lt; 500 actions/day</option>
                      <option value="500 - 2,000 actions/day" className="bg-[#141519]">500 - 2,000 actions/day</option>
                      <option value="2,000 - 10,000 actions/day" className="bg-[#141519]">2,000 - 10,000 actions/day</option>
                      <option value="10,000+ actions/day" className="bg-[#141519]">10,000+ actions/day (High Throughput)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                      Hosting / Deployment Preference
                    </label>
                    <select
                      value={hostingPreference}
                      onChange={(e) => setHostingPreference(e.target.value)}
                      className="w-full bg-[#0e0f12] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#ffc700]"
                    >
                      <option value="Managed Dedicated Cloud" className="bg-[#141519]">Pixorva Managed Dedicated Cloud (Fastest)</option>
                      <option value="Hybrid VPC Peering" className="bg-[#141519]">Hybrid VPC Peering (AWS / GCP)</option>
                      <option value="Air-Gapped On-Premise" className="bg-[#141519]">Air-Gapped On-Premise / Private Cluster</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="bg-black/50 hover:bg-black text-neutral-300 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 border border-white/10"
                  >
                    <ChevronLeft size={16} />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (selectedRoles.length === 0) {
                        setSubmitError("Please select at least one role for your agents.");
                        return;
                      }
                      setSubmitError(null);
                      setWizardStep(3);
                    }}
                    className="bg-[#ffc700] hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 active:scale-95 shadow-md"
                  >
                    <span>Next: Point of Contact</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Contact Info & Timeline */}
            {wizardStep === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/10 pb-4">
                  <h4 className={`text-2xl font-black uppercase text-white ${oswald.className}`}>
                    Step 3: Point of Contact & Launch Schedule
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Where should our engineering solutions team deliver your custom agent architecture proposal?
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                      <Users size={14} className="text-[#ffc700]" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Alex Morgan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#0e0f12] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] transition"
                      required
                    />
                  </div>

                  {/* Work Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                      <Mail size={14} className="text-[#ffc700]" />
                      Corporate / Work Email *
                    </label>
                    <input
                      type="email"
                      placeholder="alex@company.com"
                      value={workEmail}
                      onChange={(e) => setWorkEmail(e.target.value)}
                      className="w-full bg-[#0e0f12] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] transition"
                      required
                    />
                  </div>

                  {/* Phone / WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                      <Phone size={14} className="text-[#ffc700]" />
                      Phone / WhatsApp (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#0e0f12] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] transition"
                    />
                  </div>

                  {/* Timeline */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                      <Clock size={14} className="text-[#ffc700]" />
                      Target Deployment Timeline
                    </label>
                    <select
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full bg-[#0e0f12] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ffc700] transition"
                    >
                      <option value="Immediate (< 2 weeks)" className="bg-[#141519]">Immediate (&lt; 2 weeks)</option>
                      <option value="1 Month" className="bg-[#141519]">Within 1 Month</option>
                      <option value="Q1 / Q2 Next Quarter" className="bg-[#141519]">Next Quarter (2-3 Months)</option>
                      <option value="Exploring Feasibility" className="bg-[#141519]">Exploring Feasibility / R&D</option>
                    </select>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                    Additional Security or Technical Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="E.g. We require NDA before code review; need SOC2 reports; custom single sign-on (SAML/Okta)."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    className="w-full bg-[#0e0f12] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] transition"
                  />
                </div>

                {/* Error Banner */}
                {submitError && (
                  <div className="bg-red-950/40 border border-red-800 text-red-300 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    disabled={isSubmitting}
                    className="bg-black/50 hover:bg-black text-neutral-300 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 border border-white/10"
                  >
                    <ChevronLeft size={16} />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#ffc700] hover:bg-yellow-400 text-black px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2.5 active:scale-95 shadow-[0_0_20px_rgba(255,199,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Creating Request...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Submit Agent Request</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 4: Request Raised / Confirmation Screen */}
            {wizardStep === 4 && submittedRequest && (
              <div className="text-center py-8 space-y-6 animate-fadeIn">
                {/* Checkmark Celebration */}
                <div className="w-20 h-20 mx-auto rounded-3xl bg-[#ffc700]/10 border-2 border-[#ffc700] flex items-center justify-center text-[#ffc700] shadow-[0_0_30px_rgba(255,199,0,0.25)]">
                  <CheckCheck size={42} />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 bg-[#ffc700] text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                    Request Raised Successfully 🚀
                  </div>
                  <h4 className={`text-3xl sm:text-4xl font-black uppercase text-white ${oswald.className}`}>
                    Your Custom Agent Request Is Created!
                  </h4>
                  <p className="text-sm text-neutral-300 max-w-lg mx-auto leading-relaxed">
                    Someone from our solutions and engineering team will contact you soon with all the details you have filled, along with a tailored architecture proposal.
                  </p>
                </div>

                {/* Reference ID Badge */}
                <div className="bg-[#0e0f12] border border-white/15 rounded-2xl p-4 max-w-md mx-auto flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] uppercase font-bold text-neutral-400">Request Reference ID</span>
                    <div className="text-base font-black text-[#ffc700] tracking-wider">{submittedRequest.refId}</div>
                  </div>
                  <button
                    onClick={copyReferenceId}
                    className="bg-[#1f2028] hover:bg-neutral-800 text-neutral-200 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
                  >
                    {copiedRef ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copiedRef ? "Copied" : "Copy ID"}</span>
                  </button>
                </div>

                {/* Recap Summary Box */}
                <div className="bg-[#0e0f12] border border-white/10 rounded-2xl p-6 text-left max-w-xl mx-auto space-y-3 font-sans text-xs">
                  <h5 className="font-bold uppercase tracking-wider text-neutral-400 border-b border-white/10 pb-2">
                    Submitted Specification Recap
                  </h5>
                  <div className="grid grid-cols-2 gap-y-2 text-neutral-300">
                    <div><span className="text-neutral-500 font-medium">Business:</span> {submittedRequest.companyName}</div>
                    <div><span className="text-neutral-500 font-medium">Industry:</span> {submittedRequest.industry}</div>
                    <div><span className="text-neutral-500 font-medium">Contact:</span> {submittedRequest.fullName}</div>
                    <div><span className="text-neutral-500 font-medium">Email:</span> {submittedRequest.workEmail}</div>
                    <div><span className="text-neutral-500 font-medium">Timeline:</span> {submittedRequest.timeline}</div>
                    <div><span className="text-neutral-500 font-medium">Roles:</span> {submittedRequest.roles?.length} roles selected</div>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-neutral-500">Selected Roles: </span>
                    <span className="text-[#ffc700] font-semibold">{submittedRequest.roles?.join(", ")}</span>
                  </div>
                </div>

                {/* Mandatory Contact Support Callout */}
                <div className="bg-[#18191f] border border-[#ffc700]/30 rounded-2xl p-5 max-w-xl mx-auto text-sm space-y-1">
                  <div className="text-neutral-300">
                    We have dispatched a full copy of this intake to <strong className="text-white">{submittedRequest.workEmail}</strong>.
                  </div>
                  <div className="text-neutral-400 text-xs pt-1">
                    For more information or urgent priority onboarding, contact us directly at:
                  </div>
                  <div className="pt-1">
                    <a
                      href="mailto:support@pixorva.org"
                      className="inline-flex items-center gap-1.5 text-base font-black text-[#ffc700] hover:underline"
                    >
                      <Mail size={16} />
                      <span>support@pixorva.org</span>
                    </a>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSubmittedRequest(null);
                      setWizardStep(1);
                    }}
                    className="bg-[#18191f] hover:bg-neutral-800 text-neutral-300 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition border border-white/10"
                  >
                    Submit Another Request
                  </button>
                  <Link
                    href="/workspace"
                    className="bg-[#ffc700] hover:bg-yellow-400 text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-md"
                  >
                    Open Workspace Console
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Footer Support Banner */}
      <footer className="mt-auto border-t border-white/10 bg-[#0e0f12] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className={`text-base font-black uppercase text-white ${oswald.className}`}>Pixorva</span>
            <span>•</span>
            <span>Personalized AI Workforce Architecture</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/docs" className="hover:text-white transition">Documentation</Link>
            <Link href="/governance" className="hover:text-white transition">Governance & Rules</Link>
            <a href="mailto:support@pixorva.org" className="text-[#ffc700] hover:underline font-bold">
              support@pixorva.org
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
