"use client";

import React from "react";
import { Oswald, Inter } from "next/font/google";
import { ArrowLeft, Scale, ShieldAlert, FileText, Landmark } from "lucide-react";
import Link from "next/link";

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function TermsPage() {
  return (
    <div className={`min-h-screen bg-gray-50 text-black py-12 px-6 ${inter.className}`}>
      <div className="max-w-3xl mx-auto">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 font-bold uppercase text-xs hover:text-yellow-600 mb-8 transition">
          <ArrowLeft size={16} /> Back to Homepage
        </Link>

        {/* Title Card */}
        <div className="bg-white border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-yellow-400 p-3 rounded-2xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Scale size={32} />
            </div>
            <div>
              <h1 className={`text-4xl md:text-5xl uppercase leading-none ${oswald.className}`}>Terms of Service</h1>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Last Updated: August 21, 2026</p>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="bg-white border-2 border-black rounded-3xl p-8 md:p-12 space-y-8 shadow-sm">
          
          <section className="space-y-3">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <span className="bg-yellow-400 px-2 py-0.5 border border-black rounded text-xs">1</span>
              Acceptance of Terms
            </h2>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              By creating an account, accessing, or using the Pixorva platform, website (pixorva.com), APIs, and related services (collectively, the &quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you are using the Platform on behalf of an entity, you represent and warrant that you have the authority to bind that entity to these Terms. If you do not agree, do not access or use the Platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <span className="bg-yellow-400 px-2 py-0.5 border border-black rounded text-xs">2</span>
              The Pixorva Platform & Marketplace
            </h2>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              Pixorva operates an artificial intelligence ecosystem and multi-agent marketplace enabling users to discover, build, orchestrate, deploy, and interact with autonomous AI agents, tools, workflows, and third-party AI models.
            </p>
            <ul className="list-disc pl-6 text-sm text-gray-600 font-medium space-y-2">
              <li><strong>Agent Marketplace:</strong> Pixorva allows third-party developers (&quot;Creators&quot;) to publish AI agents and tools. Pixorva acts as an intermediary facilitating access and execution, but does not guarantee the continuous availability, accuracy, or performance of third-party agents.</li>
              <li><strong>Modifications & Beta Services:</strong> Pixorva reserves the right to modify, suspend, or discontinue any feature, API, or agent integration at any time. Features labeled as &quot;Beta&quot; or &quot;Preview&quot; are provided strictly on an &quot;AS-IS&quot; and &quot;AS-AVAILABLE&quot; basis.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <span className="bg-yellow-400 px-2 py-0.5 border border-black rounded text-xs">3</span>
              Accounts and Security
            </h2>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              You must provide accurate, current, and complete information during registration and keep your profile updated. You are responsible for safeguarding your credentials, API keys, and access tokens. Any activity occurring under your account or API keys is your sole responsibility. You must notify Pixorva immediately at <strong>security@pixorva.com</strong> if you suspect unauthorized access or a security breach.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <span className="bg-yellow-400 px-2 py-0.5 border border-black rounded text-xs">4</span>
              User Content, Inputs, and AI Outputs
            </h2>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              <strong>Inputs:</strong> You retain all ownership rights to the prompts, data, files, and code submitted to the Platform (&quot;Inputs&quot;). You grant Pixorva a limited, worldwide, non-exclusive license to process, transmit, and execute Inputs solely to provide the services and orchestrate agent actions.
            </p>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              <strong>Outputs:</strong> To the extent permitted by applicable law, you own all rights and title to the responses, generated data, and artifacts produced by your interaction with the Platform (&quot;Outputs&quot;).
            </p>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              <strong>Nature of AI:</strong> You acknowledge that generative AI and multi-agent workflows may produce probabilistic, inaccurate, incomplete, or identical outputs across different users. You are responsible for evaluating and verifying the accuracy and suitability of any Output before relying on it.
            </p>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              <strong>Model Training:</strong> Pixorva does not use your private Inputs or proprietary Outputs to train foundation models without your explicit opt-in consent.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <span className="bg-yellow-400 px-2 py-0.5 border border-black rounded text-xs">5</span>
              Acceptable Use Policy (AUP)
            </h2>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              You agree not to use the Platform, or deploy any Agent on the Platform, to:
            </p>
            <ul className="list-disc pl-6 text-sm text-gray-600 font-medium space-y-2">
              <li>Violate any applicable local, national, or international laws or regulations.</li>
              <li>Generate, orchestrate, or propagate malicious software, exploits, automated phishing, or cyber-attacks.</li>
              <li>Create non-consensual sexual content, promote self-harm, hate speech, violence, or illegal activities.</li>
              <li>Circumvent platform rate limits, token authentication, API constraints, or billing mechanisms.</li>
              <li>Scrape, reverse engineer, decompile, or extract the underlying model architectures or platform source code without authorization.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <span className="bg-yellow-400 px-2 py-0.5 border border-black rounded text-xs">6</span>
              Marketplace Creator Terms & Revenue Share
            </h2>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              <strong>Agent Submission:</strong> Creators must ensure their agents comply with our AUP, data privacy standards, and API execution safety protocols.
            </p>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              <strong>License Grant to End-Users:</strong> By listing an agent, the Creator grants users a non-exclusive license to invoke and execute the agent according to the terms specified on the agent’s marketplace listing.
            </p>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              <strong>Monetization & Payouts:</strong> Fees, revenue shares, and payout schedules for paid agents are governed by the Pixorva Creator Agreement and processed via authorized payment partners. Pixorva reserves the right to withhold payouts or remove agents involved in fraudulent or abusive activities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <span className="bg-yellow-400 px-2 py-0.5 border border-black rounded text-xs">7</span>
              Subscriptions, Credits, and Payments
            </h2>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              <strong>Billing:</strong> Access to certain tiers, computational credits, and marketplace agents requires payment. You agree to pay all applicable fees displayed during checkout.
            </p>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              <strong>Usage Credits:</strong> Platform usage credits, tokens, and API compute balances are non-transferable and non-refundable once consumed, except where mandated by local consumer protection laws.
            </p>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              <strong>Taxes:</strong> You are responsible for all applicable sales, GST, VAT, or withholding taxes associated with your transactions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <span className="bg-yellow-400 px-2 py-0.5 border border-black rounded text-xs">8</span>
              Disclaimers and Limitation of Liability
            </h2>
            <p className="text-sm text-gray-600 font-medium leading-relaxed font-semibold italic">
              Warranty Disclaimer: The Platform, multi-agent frameworks, and Outputs are provided on an &quot;AS-IS&quot; and &quot;AS-AVAILABLE&quot; basis. Pixorva explicitly disclaims all warranties of merchantability, fitness for a particular purpose, non-infringement, and uptime.
            </p>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              Limitation of Liability: To the maximum extent permitted by applicable law, Pixorva, its founders, affiliates, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Platform or third-party agents.
            </p>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              Aggregate Liability Cap: Pixorva’s total cumulative liability for all claims related to the Platform shall not exceed the greater of $100 USD or the total fees paid by you to Pixorva in the three (3) months preceding the claim.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <span className="bg-yellow-400 px-2 py-0.5 border border-black rounded text-xs">9</span>
              Indemnification
            </h2>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              You agree to defend, indemnify, and hold harmless Pixorva and its officers, directors, and employees from any third-party claims, damages, liabilities, and expenses (including legal fees) arising from: (a) your Inputs or use of Outputs, (b) your violation of these Terms, or (c) any agent or software tool you deploy onto the marketplace.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <span className="bg-yellow-400 px-2 py-0.5 border border-black rounded text-xs">10</span>
              Termination
            </h2>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              Pixorva may suspend or terminate your account and API access immediately, with or without prior notice, if you breach these Terms or engage in conduct harmful to other users, platform infrastructure, or third parties. Upon termination, your right to use the Platform ceases immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <span className="bg-yellow-400 px-2 py-0.5 border border-black rounded text-xs">11</span>
              Governing Law & Dispute Resolution
            </h2>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              These Terms are governed by and construed in accordance with the laws of Rajasthan, India, without regard to conflict of law principles. Any legal dispute arising under these Terms shall be resolved via binding arbitration or within the competent courts located in Jaipur, Rajasthan, India.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t-2 border-black border-dashed">
            <h2 className="text-2xl font-black uppercase flex items-center gap-2">
              <Landmark size={22} className="text-yellow-600" />
              Contact & Grievance Redressal
            </h2>
            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              For support, legal notices, or compliance inquiries, contact us at:
            </p>
            <div className="bg-yellow-50 border-2 border-black p-4 rounded-xl space-y-1.5 text-xs font-bold text-gray-800">
              <p>Entity Name: Pixorva Inc.</p>
              <p>Support Email: <a href="mailto:support@pixorva.com" className="underline">support@pixorva.com</a></p>
              <p>Legal Inquiries: <a href="mailto:legal@pixorva.com" className="underline">legal@pixorva.com</a></p>
              <p>Grievance Officer: Mr. Pranav Khandelwal (<a href="mailto:grievance@pixorva.com" className="underline">grievance@pixorva.com</a>)</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
