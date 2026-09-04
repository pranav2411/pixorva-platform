"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Oswald, Inter } from "next/font/google";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Building2,
  Globe,
  Database,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Server,
  Zap,
  Lock,
  Workflow,
  Clock,
  ExternalLink,
  Users
} from "lucide-react";

const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"] });
const inter = Inter({ subsets: ["latin"] });

export default function CustomAgentsPage() {
  const [activeDocTab, setActiveDocTab] = useState<"architecture" | "security" | "integrations" | "lifecycle">("architecture");

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
                Custom AI Agents for Business
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
            <Link
              href="/custom-agents/onboarding"
              className="bg-[#ffc700] hover:bg-yellow-400 text-black px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider shadow-[0px_0px_15px_rgba(255,199,0,0.3)] transition transform active:scale-95 flex items-center gap-2"
            >
              <span>Get Agents for Your Business</span>
              <ArrowRight size={14} />
            </Link>
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
              <Link
                href="/custom-agents/onboarding"
                className="bg-[#ffc700] hover:bg-yellow-400 text-black px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg transition transform active:scale-95 flex items-center gap-2.5"
              >
                <span>Get Agents for Your Business</span>
                <ArrowRight size={16} />
              </Link>

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

      {/* Capabilities Documentation Section */}
      <section id="capabilities-preview" className="py-16 max-w-7xl mx-auto px-6 w-full space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#ffc700]">
            Enterprise Architecture & Capabilities
          </span>
          <h3 className={`text-3xl sm:text-4xl font-black uppercase text-white ${oswald.className}`}>
            What You Can Get From Pixorva
          </h3>
          <p className="text-sm text-neutral-400">
            Read through our architecture blueprints below to understand how custom agents operate inside your private perimeter.
          </p>
        </div>

        {/* Interactive Capability Tabs */}
        <div className="bg-[#141519] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8 min-h-[600px] flex flex-col justify-start transition-all duration-300">
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4 shrink-0">
            <button
              onClick={() => setActiveDocTab("architecture")}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition flex items-center gap-2 ${
                activeDocTab === "architecture"
                  ? "bg-[#ffc700] text-black shadow-md"
                  : "bg-black/40 text-neutral-400 hover:text-white hover:bg-black/60"
              }`}
            >
              <Workflow size={14} />
              <span>1. Custom Agent Architecture</span>
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

          <div className="flex-grow flex flex-col justify-start min-h-[460px]">
            {/* Tab 1: Architecture */}
            {activeDocTab === "architecture" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-full animate-fadeIn">
                <div className="flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className={`text-2xl font-black uppercase text-white ${oswald.className}`}>
                      Autonomous Multi-Agent Swarms
                    </h4>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      Instead of a single monolithic model attempting to do everything, Pixorva configures role-specialized agent swarms. Each agent is instantiated with a dedicated operational domain, distinct memory context, and fine-tuned instructions.
                    </p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="flex items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                      <div className="bg-[#ffc700]/20 text-[#ffc700] p-2 rounded-lg font-bold text-xs">01</div>
                      <div>
                        <h5 className="text-xs font-black uppercase text-white">Delegation & Sub-Task Hand-offs</h5>
                        <p className="text-xs text-neutral-400 mt-0.5">Agents communicate via structured JSON RPC protocols, handing off tasks autonomously from discovery to execution.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                      <div className="bg-[#ffc700]/20 text-[#ffc700] p-2 rounded-lg font-bold text-xs">02</div>
                      <div>
                        <h5 className="text-xs font-black uppercase text-white">Stateful Long-Term Vector Memory</h5>
                        <p className="text-xs text-neutral-400 mt-0.5">Continuous memory embeddings of past customer tickets, codebase documentation, and past successful resolutions.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                      <div className="bg-[#ffc700]/20 text-[#ffc700] p-2 rounded-lg font-bold text-xs">03</div>
                      <div>
                        <h5 className="text-xs font-black uppercase text-white">Self-Healing Error Correction</h5>
                        <p className="text-xs text-neutral-400 mt-0.5">When an API call returns a 4xx or 5xx code, the agent inspects the stack trace, corrects the payload, and re-executes automatically.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Architecture Blueprint Card */}
                <div className="bg-[#0e0f12] border border-white/10 rounded-2xl p-6 font-mono text-xs flex flex-col justify-between shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-sans font-bold flex items-center gap-1.5">
                      <Server size={14} className="text-[#ffc700]" />
                      Pixorva Swarm Topology
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-sans font-bold">
                      Active Pipeline
                    </span>
                  </div>

                  <div className="space-y-2 py-2">
                    <div className="bg-[#18191f] p-3 rounded-lg border border-white/5 flex items-center justify-between">
                      <span className="text-neutral-300">Trigger: Inbound Webhook / Ticket / Event</span>
                      <span className="text-[#ffc700]">Data Ingestion</span>
                    </div>
                    <div className="text-center text-neutral-500 text-[11px]">↓ [Decentralized Queue]</div>
                    <div className="bg-[#1f2028] p-3 rounded-lg border border-[#ffc700]/30 flex items-center justify-between">
                      <div>
                        <span className="text-white font-bold">Supervisor Agent (Orchestrator)</span>
                        <p className="text-[10px] text-neutral-400 font-sans mt-0.5">Routes sub-tasks to specialized micro-agents</p>
                      </div>
                      <span className="bg-[#ffc700] text-black text-[10px] font-sans font-black px-2 py-0.5 rounded">LEADER</span>
                    </div>
                    <div className="text-center text-neutral-500 text-[11px]">↓ [Parallel Dispatch]</div>
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
                    <div className="text-center text-neutral-500 text-[11px]">↓ [Verification Passed]</div>
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-full animate-fadeIn">
                <div className="flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className={`text-2xl font-black uppercase text-white ${oswald.className}`}>
                      Proprietary Tool Calling & Custom Connectors
                    </h4>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      Your custom agents are equipped with secure function calling schemas tailored directly to your internal software stack. Whether you use Postgres, HubSpot, or a bespoke in-house microservice, our team writes zero-latency connectors with sandboxed auth.
                    </p>
                  </div>
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
                <div className="bg-[#0e0f12] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="text-xs font-black uppercase tracking-wider text-neutral-400">
                      Ready-to-Deploy Connectors
                    </div>
                    <div className="grid grid-cols-3 gap-2.5">
                      {["PostgreSQL", "Slack", "HubSpot", "Salesforce", "Snowflake", "GitHub", "Jira", "Stripe", "Notion", "AWS / GCP", "Discord", "Custom API"].map((tool, idx) => (
                        <div key={idx} className="bg-[#18191f] border border-white/10 p-2.5 rounded-xl text-center hover:border-[#ffc700] transition">
                          <div className="font-bold text-xs text-white">{tool}</div>
                          <div className="text-[9px] text-[#ffc700] mt-0.5">Plug & Play</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-yellow-950/20 border border-yellow-700/30 p-3 rounded-xl text-xs text-yellow-200/90 leading-relaxed">
                    💡 <strong>Have proprietary internal software?</strong> We write custom MCP (Model Context Protocol) servers and OpenAPI connectors to interface with your legacy systems securely.
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Security */}
            {activeDocTab === "security" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-full animate-fadeIn">
                <div className="flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className={`text-2xl font-black uppercase text-white ${oswald.className}`}>
                      Enterprise Air-Gapping & Zero-Data-Retention
                    </h4>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      We treat your company data as strictly confidential. Your corporate IP, customer chats, and database contents are never retained, sold, or used to train foundational AI models.
                    </p>
                  </div>
                  <div className="space-y-2.5 pt-2">
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex items-start gap-3">
                      <Lock size={16} className="text-[#ffc700] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs text-white">Dedicated VPC Peering & Isolation</div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Host agents in your own AWS/GCP virtual private cloud or on dedicated Pixorva single-tenant clusters.</p>
                      </div>
                    </div>
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex items-start gap-3">
                      <ShieldCheck size={16} className="text-[#ffc700] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs text-white">Dynamic PII & Secret Redaction</div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Automated regex scrubbers mask credit cards, passwords, and personal identifiers before LLM ingestion.</p>
                      </div>
                    </div>
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex items-start gap-3">
                      <Server size={16} className="text-[#ffc700] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs text-white">Full Immutable Audit Logs</div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Every prompt, output, tool execution, and approval step is cryptographically signed and exportable for compliance.</p>
                      </div>
                    </div>
                    <div className="bg-black/40 p-3 rounded-xl border border-white/5 flex items-start gap-3">
                      <ShieldCheck size={16} className="text-[#ffc700] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-xs text-white">Zero Model Training Guarantee</div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Enterprise data is never used to fine-tune public base models. Your corporate intelligence remains private.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Compliance Badge Card */}
                <div className="bg-[#0e0f12] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="text-xs font-black uppercase tracking-wider text-neutral-400">
                      Compliance Standards Guaranteed
                    </div>
                    <div className="space-y-2.5">
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
                      <div className="flex items-center justify-between bg-[#18191f] p-3 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck size={18} className="text-emerald-400" />
                          <span className="text-xs font-bold text-white">ISO 27001 Certified Infra</span>
                        </div>
                        <span className="text-[10px] text-neutral-400">Hardened Multi-Cloud</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 text-center border-t border-white/10">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch h-full animate-fadeIn">
                <div className="flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h4 className={`text-2xl font-black uppercase text-white ${oswald.className}`}>
                      Turnkey Deployment in Under 14 Days
                    </h4>
                    <p className="text-sm text-neutral-300 leading-relaxed">
                      We don’t just hand you an API key and leave you to figure it out. Pixorva pairs you with a dedicated Forward Deployed Solutions Engineer to design, test, sandbox, and launch your agents into production.
                    </p>
                  </div>
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="bg-[#ffc700] text-black text-xs font-black px-2 py-0.5 rounded whitespace-nowrap shrink-0 inline-block">
                        Phase 1
                      </span>
                      <div>
                        <div className="font-bold text-xs text-white">Discovery & Blueprinting (Days 1–3)</div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">We analyze your bottlenecks, SOPs, and target tools to draft complete agent interaction diagrams.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="bg-[#ffc700] text-black text-xs font-black px-2 py-0.5 rounded whitespace-nowrap shrink-0 inline-block">
                        Phase 2
                      </span>
                      <div>
                        <div className="font-bold text-xs text-white">Connector Engineering (Days 4–8)</div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">We integrate private APIs, configure database tools, and validate edge cases in an isolated test environment.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="bg-[#ffc700] text-black text-xs font-black px-2 py-0.5 rounded whitespace-nowrap shrink-0 inline-block">
                        Phase 3
                      </span>
                      <div>
                        <div className="font-bold text-xs text-white">Production Launch (Days 9–14)</div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Live deployment with 99.9% uptime SLA, latency monitoring, and continuous prompt fine-tuning.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                      <span className="bg-[#ffc700] text-black text-xs font-black px-2 py-0.5 rounded whitespace-nowrap shrink-0 inline-block">
                        Phase 4
                      </span>
                      <div>
                        <div className="font-bold text-xs text-white">Ongoing Governance & Optimization</div>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Continuous prompt alignment, edge latency tuning, and model weight upgrades.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SLA Guarantee Box */}
                <div className="bg-[#0e0f12] border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
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
                        <span><strong>Dedicated Solutions Engineer:</strong> Shared communications with our core team.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        <span><strong>Weekly Prompt & Vector Refinement:</strong> Continuous adaptation to changing business logic.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        <span><strong>Disaster Recovery Snapshots:</strong> Encrypted automated daily backups of state data.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>Questions about custom contracts?</span>
                    <a href="mailto:support@pixorva.org" className="text-[#ffc700] hover:underline font-bold">support@pixorva.org</a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Direct Call to Action Section pointing to Onboarding */}
      <section className="py-20 border-t border-white/10 bg-[#141519]/70 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-[#ffc700]/10 text-[#ffc700] border border-[#ffc700]/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest">
            Request Your Custom Workforce
          </div>
          <h3 className={`text-4xl sm:text-5xl font-black uppercase text-white leading-tight ${oswald.className}`}>
            Get Personalized Agents For Your Business
          </h3>
          <p className="text-base text-neutral-300 max-w-xl mx-auto leading-relaxed">
            Answer a few quick questions about your company, required workforce roles, and existing software stack to get started.
          </p>
          <div className="pt-4">
            <Link
              href="/custom-agents/onboarding"
              className="inline-flex items-center gap-2.5 bg-[#ffc700] hover:bg-yellow-400 text-black px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(255,199,0,0.35)] transition transform active:scale-95"
            >
              <span>Get Agents for Your Business</span>
              <ArrowRight size={18} />
            </Link>
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
