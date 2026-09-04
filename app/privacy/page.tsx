"use client";

import React from "react";
import { Oswald, Inter } from "next/font/google";
import {
  ArrowLeft,
  Shield,
  Eye,
  ShieldAlert,
  BadgeInfo,
  Landmark,
  FileText,
  Lock,
  Server,
  Cpu,
  Mail,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";

const oswald = Oswald({ subsets: ["latin"], weight: ["400", "700"] });
const inter = Inter({ subsets: ["latin"] });

export default function PrivacyPage() {
  return (
    <div className={`min-h-screen bg-[#0e0f12] text-white ${inter.className} selection:bg-[#ffc700] selection:text-black flex flex-col`}>
      
      {/* Top Header */}
      <header className="bg-[#141519]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="bg-black/50 text-white p-2 rounded-xl hover:bg-[#ffc700] hover:text-black transition border border-white/15 shadow-sm flex items-center justify-center shrink-0"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-[#ffc700]">
                Legal & Compliance
              </span>
              <h1 className={`text-lg sm:text-xl font-black uppercase text-white ${oswald.className}`}>
                Privacy & Data Protection Policy
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/terms"
              className="text-xs font-bold text-neutral-300 hover:text-[#ffc700] transition bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg"
            >
              Terms of Service →
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
                <Shield size={14} />
                <span>Enterprise Data Governance</span>
              </div>
              <h2 className={`text-3xl sm:text-5xl font-black uppercase text-white ${oswald.className}`}>
                Privacy Policy & Regulatory Disclosures
              </h2>
              <p className="text-sm sm:text-base text-neutral-300 max-w-3xl leading-relaxed">
                Pixorva is committed to rigorous data security, strict confidentiality, and regulatory alignment across the Digital Personal Data Protection Act (DPDPA 2023 - India), General Data Protection Regulation (GDPR - EU), and California Consumer Privacy Act (CCPA).
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-neutral-400 font-mono">
                <span>Effective Date: September 2026</span>
                <span>•</span>
                <span>Version 2.4</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Zero Model Training on Customer Data
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Policy Sections */}
          <div className="bg-[#141519] border border-white/10 rounded-3xl p-6 sm:p-12 space-y-12 shadow-2xl">
            
            {/* Section 1: Overview & Scope */}
            <section className="space-y-4">
              <h3 className={`text-2xl font-black uppercase text-white flex items-center gap-3 pb-3 border-b border-white/10 ${oswald.className}`}>
                <span className="bg-[#ffc700] text-black text-xs font-black px-2.5 py-1 rounded">1</span>
                Information We Collect & Ingest
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                We collect personal and operational data only to provision, secure, and deliver the Pixorva AI workforce platform:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffc700]">Account & Organization Data</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    User identity details (full name, corporate work email, company name, domain website, and billing credentials managed via PCI-DSS certified gateway Razorpay).
                  </p>
                </div>
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffc700]">Agent Prompts & Execution Inputs</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Instructions, parameters, and payloads supplied to active workspace agents or custom enterprise intake blueprints.
                  </p>
                </div>
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffc700]">Tool Call Artifacts & Logs</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    API execution receipts, webhook status codes, database schema definitions, and agent-to-agent delegation hand-off records.
                  </p>
                </div>
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ffc700]">Telemetry & System Metrics</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Anonymized latency logs, token count distributions, error stack traces, browser user-agents, and session authentication states.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Synthetic Media & Third-Party AI Systems */}
            <section className="space-y-4">
              <h3 className={`text-2xl font-black uppercase text-white flex items-center gap-3 pb-3 border-b border-white/10 ${oswald.className}`}>
                <span className="bg-[#ffc700] text-black text-xs font-black px-2.5 py-1 rounded">2</span>
                Third-Party AI Models & Synthetic Media Disclosures
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Pixorva integrates state-of-the-art artificial intelligence models, multimodal engines, and cloud compute providers to power autonomous agent workflows:
              </p>
              <div className="space-y-3 pt-2 text-xs text-neutral-300 leading-relaxed">
                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-2">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <Cpu size={16} className="text-[#ffc700]" />
                    <span>Foundation LLM & Multimodal Processing</span>
                  </div>
                  <p className="text-neutral-400">
                    To orchestrate complex reasoning, code synthesis, and analytical tasks, our platform invokes external foundation models including Google Gemini, OpenAI, and Anthropic APIs. Inputs routed through enterprise API endpoints are subject to zero-data-retention agreements and are <strong>strictly never used to train or fine-tune public foundation models</strong>.
                  </p>
                </div>

                <div className="bg-black/40 border border-white/5 p-4 rounded-2xl space-y-2">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <Eye size={16} className="text-[#ffc700]" />
                    <span>Synthetic Avatar Visuals & Digital Media Notice</span>
                  </div>
                  <p className="text-neutral-400">
                    The agent persona videos, 3D animated avatars, and visual interface assets displayed across Pixorva (including onboarding and agent detail demonstrations) are generated using third-party artificial intelligence technologies, including Google Gemini and multimodal generative synthesis tools. These avatars are entirely synthetic digital illustrations representing software agent personalities and do not depict real human individuals or real-time camera recordings.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Enterprise Air-Gapping & Security Isolation */}
            <section className="space-y-4">
              <h3 className={`text-2xl font-black uppercase text-white flex items-center gap-3 pb-3 border-b border-white/10 ${oswald.className}`}>
                <span className="bg-[#ffc700] text-black text-xs font-black px-2.5 py-1 rounded">3</span>
                Enterprise Security, Vector Isolation & PII Scrubbing
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Pixorva adheres to defense-in-depth principles for all stored and ephemeral customer data:
              </p>
              <ul className="space-y-2.5 text-xs text-neutral-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Dedicated Tenant Isolation:</strong> Custom enterprise agents can be deployed inside client-owned AWS/GCP virtual private clouds (VPC Peering) or isolated single-tenant compute pods.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Dynamic PII Redaction:</strong> Automated regex pattern matchers redact credit cards, passwords, API tokens, and social identifiers before payload transmission.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Encryption Standards:</strong> Data in transit is protected via TLS 1.3 encryption, and data at rest is encrypted using AES-256 with customer-managed or rotated HSM keys.</span>
                </li>
              </ul>
            </section>

            {/* Section 4: Refund, Billing & Cancellations */}
            <section className="space-y-4">
              <h3 className={`text-2xl font-black uppercase text-white flex items-center gap-3 pb-3 border-b border-white/10 ${oswald.className}`}>
                <span className="bg-[#ffc700] text-black text-xs font-black px-2.5 py-1 rounded">4</span>
                Billing, Subscription Renewal & Cancellation Terms
              </h3>
              <div className="space-y-3 text-xs text-neutral-300 leading-relaxed font-sans">
                <p>
                  <strong>Billing Cycle:</strong> All subscription plans (Growth, Enterprise) and active hired agents are billed recurring on a monthly basis through our payment processor (Razorpay UPI, Credit/Debit Cards, NetBanking).
                </p>
                <p>
                  <strong>Cancellations:</strong> Users may cancel their subscriptions or agent slots at any time directly through the <strong>Settings &rarr; Billing & Subscription</strong> portal. Following cancellation, access remains available until the end of the paid billing period.
                </p>
                <p>
                  <strong>Refunds:</strong> Due to immediate provisioning of compute resources, memory vectors, and downstream LLM token costs, subscription payments and consumed credits are non-refundable, except where required by applicable consumer protection laws.
                </p>
              </div>
            </section>

            {/* Section 5: User Privacy Rights */}
            <section className="space-y-4">
              <h3 className={`text-2xl font-black uppercase text-white flex items-center gap-3 pb-3 border-b border-white/10 ${oswald.className}`}>
                <span className="bg-[#ffc700] text-black text-xs font-black px-2.5 py-1 rounded">5</span>
                Your Privacy Rights (GDPR, CCPA & DPDPA)
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Regardless of your geographic location, Pixorva accords you complete control over your stored records:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-1">
                  <strong className="text-white block">Right to Access & Portability</strong>
                  <span className="text-neutral-400">Export a complete machine-readable JSON archive of your data.</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-1">
                  <strong className="text-white block">Right to Erasure</strong>
                  <span className="text-neutral-400">Request complete permanent purge of your account and vector stores.</span>
                </div>
                <div className="bg-black/40 border border-white/5 p-4 rounded-xl space-y-1">
                  <strong className="text-white block">Right to Rectification</strong>
                  <span className="text-neutral-400">Update company details, billing contacts, and access policies instantly.</span>
                </div>
              </div>
            </section>

            {/* Section 6: Grievance Officer & Contact Details */}
            <section className="space-y-4 pt-4 border-t border-white/10">
              <h3 className={`text-2xl font-black uppercase text-white flex items-center gap-3 ${oswald.className}`}>
                <Landmark size={22} className="text-[#ffc700]" />
                Grievance Redressal & Contact Information
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Under the India Information Technology Act and applicable DPDPA guidelines, any data grievances, notices, or inquiries can be filed with our compliance desk:
              </p>
              <div className="bg-black/60 border border-white/15 p-6 rounded-2xl space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
                  <div>
                    <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px] block">Entity</span>
                    <span className="text-white font-bold text-sm">Pixorva Inc.</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px] block">Location</span>
                    <span className="text-neutral-300">Jaipur, Rajasthan, India</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div>
                    <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px] block">Support Desk</span>
                    <a href="mailto:support@pixorva.org" className="text-[#ffc700] hover:underline font-bold">
                      support@pixorva.org
                    </a>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px] block">Privacy Office</span>
                    <a href="mailto:privacy@pixorva.com" className="text-[#ffc700] hover:underline font-bold">
                      privacy@pixorva.com
                    </a>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-bold uppercase tracking-wider text-[10px] block">Grievance Officer</span>
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

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0e0f12] py-8 text-center text-xs text-neutral-500 font-mono">
        © 2026 PIXORVA INC. ALL RIGHTS RESERVED. // DATA PROTECTION & PRIVACY POLICY
      </footer>

    </div>
  );
}
