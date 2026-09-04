"use client";

import React from "react";
import { Oswald, Inter } from "next/font/google";
import {
  ArrowLeft,
  Scale,
  ShieldAlert,
  FileText,
  Landmark,
  Cpu,
  Eye,
  CheckCircle2,
  Lock,
  Server,
  Mail
} from "lucide-react";
import Link from "next/link";
import BackButton from "../components/BackButton";

const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"] });
const inter = Inter({ subsets: ["latin"] });

export default function TermsPage() {
  return (
    <div className={`min-h-screen bg-[#0e0f12] text-white ${inter.className} selection:bg-[#ffc700] selection:text-black flex flex-col`}>
      
      {/* Top Header */}
      <header className="bg-[#141519]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <BackButton fallback="/" iconSize={16} />
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-[#ffc700]">
                Legal & Compliance
              </span>
              <h1 className={`text-lg sm:text-xl font-black uppercase text-white ${oswald.className}`}>
                Terms of Service & Platform Agreement
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/privacy"
              className="text-xs font-bold text-neutral-300 hover:text-[#ffc700] transition bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg"
            >
              Privacy Policy →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Hero Banner Card */}
          <div className="bg-[#141519] border border-white/10 p-8 sm:p-10 rounded-3xl relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#ffc700]/10 text-[#ffc700] border border-[#ffc700]/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                <Scale size={14} />
                <span>Enterprise Platform Governance</span>
              </div>
              <h2 className={`text-3xl sm:text-5xl font-black uppercase text-white ${oswald.className}`}>
                Terms of Service
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 max-w-3xl leading-relaxed">
                These Terms of Service govern your access to and use of Pixorva, our AI agent marketplace, autonomous workspace environments, and custom enterprise workforce orchestrations.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-400 font-mono">
                <span>Last Revised: September 2026</span>
                <span>•</span>
                <span>Version 2.4</span>
                <span>•</span>
                <span className="text-[#ffc700]">Governing Jurisdiction: Rajasthan, India</span>
              </div>
            </div>
          </div>

          {/* Terms Content Card */}
          <div className="bg-[#141519] border border-white/10 rounded-3xl p-6 sm:p-12 space-y-12 shadow-2xl">
            
            {/* Section 1 */}
            <section className="space-y-4">
              <h3 className={`text-2xl font-black uppercase text-white flex items-center gap-3 pb-3 border-b border-white/10 ${oswald.className}`}>
                <span className="bg-[#ffc700] text-black text-xs font-black px-2.5 py-1 rounded">1</span>
                Acceptance of Agreement & Authorized Authority
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                By creating an account, authenticating via OAuth or API credentials, or utilizing the Pixorva platform (pixorva.com), you signify your unconditional agreement to these Terms of Service. If you access or enter into this agreement on behalf of a company or legal entity, you represent and warrant that you possess full legal authority to bind said entity to these obligations.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h3 className={`text-2xl font-black uppercase text-white flex items-center gap-3 pb-3 border-b border-white/10 ${oswald.className}`}>
                <span className="bg-[#ffc700] text-black text-xs font-black px-2.5 py-1 rounded">2</span>
                Autonomous Platform, Multi-Agent Marketplace & Custom Blueprints
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Pixorva operates an artificial intelligence orchestration ecosystem. Our services include:
              </p>
              <ul className="space-y-2.5 text-xs text-neutral-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#ffc700] shrink-0 mt-0.5" />
                  <span><strong>AI Agent Marketplace:</strong> Discovering, licensing, and instantiating specialized workforce agents created by Pixorva or verified developers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#ffc700] shrink-0 mt-0.5" />
                  <span><strong>Custom Enterprise Agents:</strong> Bespoke agent swarms configured with proprietary MCP tool schemas, dedicated private memory vectors, and client VPC peering.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#ffc700] shrink-0 mt-0.5" />
                  <span><strong>Agent Studio & Workspace:</strong> Interactive prompt synthesis, unit sandbox environments, and real-time execution pipelines.</span>
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h3 className={`text-2xl font-black uppercase text-white flex items-center gap-3 pb-3 border-b border-white/10 ${oswald.className}`}>
                <span className="bg-[#ffc700] text-black text-xs font-black px-2.5 py-1 rounded">3</span>
                Third-Party AI Models & Synthetic Media Disclosures
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                You acknowledge and agree to the technical foundations and media generation methods underpinning Pixorva:
              </p>
              <div className="space-y-3 pt-2 text-xs text-neutral-300 leading-relaxed">
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-2">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <Cpu size={16} className="text-[#ffc700]" />
                    <span>External Foundation LLM Services</span>
                  </div>
                  <p className="text-neutral-400">
                    Agent execution leverages commercial foundation model APIs (including Google Gemini, OpenAI, and Anthropic). Prompt processing is governed by strict enterprise sub-processing agreements with zero model fine-tuning or retention on customer prompts.
                  </p>
                </div>

                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-2">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <Eye size={16} className="text-[#ffc700]" />
                    <span>Synthetic Avatar Visuals & Digital Media Representations</span>
                  </div>
                  <p className="text-neutral-400">
                    The agent video clips, animated avatars, and visual personas displayed across the Platform (such as Devon, Cy, Quinn, and related agent profiles) are computer-generated synthetic media generated using third-party artificial intelligence engines (including Google Gemini and modern multimodal synthesis models). These video assets represent illustrative software personalities and are not live video recordings or depictions of real persons.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h3 className={`text-2xl font-black uppercase text-white flex items-center gap-3 pb-3 border-b border-white/10 ${oswald.className}`}>
                <span className="bg-[#ffc700] text-black text-xs font-black px-2.5 py-1 rounded">4</span>
                Intellectual Property, Inputs & AI Outputs
              </h3>
              <div className="space-y-3 text-xs text-neutral-300 leading-relaxed font-sans">
                <p>
                  <strong>Customer Inputs:</strong> You retain complete ownership of all data, code, customer documentation, and prompts uploaded or submitted to Pixorva (&quot;Inputs&quot;). Pixorva claims zero ownership over your proprietary business assets.
                </p>
                <p>
                  <strong>AI Generated Outputs:</strong> To the full extent permissible by applicable law, you own all rights, title, and interest in and to the artifacts, code pull requests, and data synthesized by agents on your behalf (&quot;Outputs&quot;).
                </p>
                <p>
                  <strong>Probabilistic AI Disclaimer:</strong> Artificial intelligence outputs are inherently probabilistic. You acknowledge that outputs must be evaluated for correctness, code safety, and factual accuracy prior to executing critical enterprise operations or production deployments.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h3 className={`text-2xl font-black uppercase text-white flex items-center gap-3 pb-3 border-b border-white/10 ${oswald.className}`}>
                <span className="bg-[#ffc700] text-black text-xs font-black px-2.5 py-1 rounded">5</span>
                Acceptable Use Policy (AUP)
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                You agree never to utilize the Platform or deploy custom agents to:
              </p>
              <ul className="space-y-2 text-xs text-neutral-300 list-disc pl-5">
                <li>Violate any local, state, national, or international statutes or regulatory codes.</li>
                <li>Conduct unauthorized penetration tests, cyber reconnaissance, or propagate exploit payloads.</li>
                <li>Generate deceptive, fraudulent, or impersonating communications claiming synthetic agents are real human individuals.</li>
                <li>Attempt to bypass rate limits, token security checkpoints, or access restricted virtual VPC perimeter boundaries.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h3 className={`text-2xl font-black uppercase text-white flex items-center gap-3 pb-3 border-b border-white/10 ${oswald.className}`}>
                <span className="bg-[#ffc700] text-black text-xs font-black px-2.5 py-1 rounded">6</span>
                Subscriptions, Fees & Cancellation
              </h3>
              <div className="space-y-3 text-xs text-neutral-300 leading-relaxed">
                <p>
                  Access to compute credits, agent slots, and custom solutions is billed recurring monthly via Razorpay. Subscriptions can be self-managed or cancelled at any time under <strong>Settings &rarr; Billing</strong>. Payments already settled are non-refundable due to instantaneous allocation of compute memory and downstream API token costs.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h3 className={`text-2xl font-black uppercase text-white flex items-center gap-3 pb-3 border-b border-white/10 ${oswald.className}`}>
                <span className="bg-[#ffc700] text-black text-xs font-black px-2.5 py-1 rounded">7</span>
                Disclaimers, Limitation of Liability & Indemnity
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed italic">
                THE PLATFORM, AGENT FRAMEWORKS, AND DERIVED OUTPUTS ARE PROVIDED &quot;AS-IS&quot; WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY LAW, PIXORVA DISCLAIMS ALL DIRECT OR CONSEQUENTIAL DAMAGES, LOSS OF DATA, OR PRODUCTION INTERRUPTIONS. AGGREGATE LIABILITY SHALL NOT EXCEED FEES PAID BY YOU IN THE PRECEDING THREE (3) MONTHS.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-4 pt-4 border-t border-white/10">
              <h3 className={`text-2xl font-black uppercase text-white flex items-center gap-3 ${oswald.className}`}>
                <Landmark size={22} className="text-[#ffc700]" />
                Jurisdiction & Official Contact
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                These Terms are governed by the laws of Rajasthan, India. All legal notices and inquiries can be submitted to:
              </p>
              <div className="bg-black/60 border border-white/15 p-6 rounded-2xl space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
                  <div>
                    <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px] block">Entity</span>
                    <span className="text-white font-bold text-sm">Pixorva Inc.</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px] block">Legal Seat</span>
                    <span className="text-neutral-300">Jaipur, Rajasthan, India</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px] block">Support Inquiries</span>
                    <a href="mailto:support@pixorva.org" className="text-[#ffc700] hover:underline font-bold">
                      support@pixorva.org
                    </a>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px] block">Legal & Contracts</span>
                    <a href="mailto:legal@pixorva.com" className="text-[#ffc700] hover:underline font-bold">
                      legal@pixorva.com
                    </a>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px] block">Grievances</span>
                    <a href="mailto:grievance@pixorva.com" className="text-[#ffc700] hover:underline font-bold">
                      grievance@pixorva.com
                    </a>
                  </div>
                </div>
              </div>
            </section>

          </div>

        </div>
      </main>

      {/* FOOTER WITH BIG PIXORVA BACKGROUND WATERMARK */}
      <footer className="relative bg-black text-white pt-20 pb-12 border-t border-white/10 overflow-hidden mt-auto">
        {/* Big PIXORVA Background Text */}
        <div
          className={`absolute top-6 left-0 right-0 text-[18vw] font-black tracking-tighter text-white/[0.035] select-none pointer-events-none text-center leading-none ${oswald.className}`}
        >
          PIXORVA
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Main 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-16 border-b border-white/10">
            
            {/* Column 1: Pixorva Details & Brand (Spans 2 columns on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <span className={`text-2xl font-black uppercase tracking-wider text-white ${oswald.className}`}>
                  Pixorva
                </span>
              </div>

              <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
                Pixorva is the autonomous AI workforce platform engineered for high-growth enterprises and modern operational teams. We design, deploy, and govern role-specialized AI agent swarms with dedicated vector memory, private VPC isolation, and proprietary tool connectors.
              </p>

              {/* Support Callout */}
              <div className="pt-2">
                <a
                  href="mailto:support@pixorva.org"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#ffc700] hover:underline bg-[#ffc700]/10 border border-[#ffc700]/20 px-3 py-1.5 rounded-lg transition"
                >
                  <Mail size={13} />
                  <span>support@pixorva.org</span>
                </a>
              </div>
            </div>

            {/* Column 2: Platform Navigation */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-wider text-neutral-300">
                Platform
              </h5>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li>
                  <Link href="/" className="hover:text-[#ffc700] transition">
                    Agent Marketplace
                  </Link>
                </li>
                <li>
                  <Link href="/custom-agents" className="text-[#ffc700] font-semibold hover:underline">
                    Custom Business Agents
                  </Link>
                </li>
                <li>
                  <Link href="/custom-agents/onboarding" className="hover:text-[#ffc700] transition">
                    Request Custom Agents
                  </Link>
                </li>
                <li>
                  <Link href="/studio" className="hover:text-[#ffc700] transition">
                    Agent Studio
                  </Link>
                </li>
                <li>
                  <Link href="/workspace" className="hover:text-[#ffc700] transition">
                    Team Workspace
                  </Link>
                </li>
                <li>
                  <Link href="/employees" className="hover:text-[#ffc700] transition">
                    Hired AI Workforce
                  </Link>
                </li>
                <li>
                  <Link href="/trial" className="hover:text-[#ffc700] transition">
                    Enterprise Trial
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Enterprise & Governance */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-wider text-neutral-300">
                Enterprise & Control
              </h5>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li>
                  <Link href="/governance" className="hover:text-[#ffc700] transition">
                    Governance & Guardrails
                  </Link>
                </li>
                <li>
                  <Link href="/governance/info" className="hover:text-[#ffc700] transition">
                    Governance Framework
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-[#ffc700] transition">
                    Developer Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-[#ffc700] transition">
                    Pricing & Plans
                  </Link>
                </li>
                <li>
                  <Link href="/billing" className="hover:text-[#ffc700] transition">
                    Billing & Invoicing
                  </Link>
                </li>
                <li>
                  <Link href="/settings" className="hover:text-[#ffc700] transition">
                    Account & API Keys
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Contact & Legal */}
            <div className="space-y-3">
              <h5 className="text-xs font-black uppercase tracking-wider text-neutral-300">
                Contact & Legal
              </h5>
              <div className="space-y-3 text-xs text-neutral-400">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">General Support</span>
                  <a href="mailto:support@pixorva.org" className="text-white hover:text-[#ffc700] transition">
                    support@pixorva.org
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">Privacy & Data Office</span>
                  <a href="mailto:privacy@pixorva.com" className="text-white hover:text-[#ffc700] transition">
                    privacy@pixorva.com
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">Grievance Redressal</span>
                  <a href="mailto:grievance@pixorva.com" className="text-white hover:text-[#ffc700] transition">
                    grievance@pixorva.com
                  </a>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">Legal Department</span>
                  <a href="mailto:legal@pixorva.com" className="text-white hover:text-[#ffc700] transition">
                    legal@pixorva.com
                  </a>
                </div>
                <div className="pt-2 flex flex-col gap-1.5 font-bold uppercase text-[11px] border-t border-white/5">
                  <Link href="/privacy" className="text-neutral-300 hover:text-[#ffc700] transition">
                    Privacy Policy →
                  </Link>
                  <Link href="/terms" className="text-neutral-300 hover:text-[#ffc700] transition">
                    Terms & Conditions →
                  </Link>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Sub-Footer Bar */}
          <div className="pt-8 text-center sm:text-left text-xs text-neutral-500 font-mono">
            © 2026 PIXORVA INC. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>

    </div>
  );
}
