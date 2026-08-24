'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Terminal, 
  Users, 
  ShieldCheck, 
  Activity, 
  FileText, 
  ArrowLeft, 
  Search, 
  Copy, 
  ChevronRight, 
  Layers, 
  Cpu, 
  Sparkles, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { Oswald, Inter } from 'next/font/google';

const oswald = Oswald({ subsets: ['latin'], weight: ['400', '700'] });
const inter = Inter({ subsets: ['latin'] });

interface DocArticle {
  id: string;
  category: 'getting-started' | 'workspace' | 'agents' | 'api' | 'governance';
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState('intro');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: <BookOpen size={16} /> },
    { id: 'workspace', name: 'Collaborative Workspace', icon: <Layers size={16} /> },
    { id: 'agents', name: 'AI Workforce Agents', icon: <Cpu size={16} /> },
    { id: 'api', name: 'Developer API Console', icon: <Terminal size={16} /> },
    { id: 'governance', name: 'Governance & Rules', icon: <ShieldCheck size={16} /> }
  ];

  const articles: DocArticle[] = [
    // --- GETTING STARTED ---
    {
      id: 'intro',
      category: 'getting-started',
      title: 'Introduction to Pixorva',
      subtitle: 'Learn about the autonomous AI workforce platform.',
      icon: <Sparkles size={20} className="text-yellow-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Pixorva is a premium state-of-the-art AI workforce marketplace and collaborative engineering environment. 
            Unlike traditional chatbot assistants, Pixorva lets you hire dedicated, role-specific agents that sit 
            together in collaborative workspace channels to construct code, review security rules, and compile sandbox outputs.
          </p>

          <div className="bg-yellow-50 border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black flex items-center gap-2">
              💡 CORE ARCHITECTURE PRINCIPLES
            </h4>
            <ul className="space-y-2 text-xs text-gray-700 font-medium">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                <span><strong>Autonomous Agents:</strong> Run persistent developer, architect, and auditor loops.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                <span><strong>Multi-Agent Channels:</strong> Collaborate in real-time, matching codes to architectural gates.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 font-bold">•</span>
                <span><strong>Direct Execution:</strong> Test output apps directly in sandboxed iframe viewport panels.</span>
              </li>
            </ul>
          </div>

          <h3 className="text-xl font-black uppercase mt-8 border-b-2 border-gray-200 pb-2">How Pixorva Works</h3>
          <p className="text-gray-700 leading-relaxed">
            Every user profile has access to a live, state-preserved workspace. When you hire an agent (e.g. Cy or Devon) from the Marketplace, 
            they are added to your channels. You write prompts or instructions in the channel, and the assigned agent 
            triggers its generative workspace routines to output copyable source codes, diagnostic logs, or HTML UI viewports.
          </p>
        </div>
      )
    },
    {
      id: 'quickstart',
      category: 'getting-started',
      title: 'Quick Start Guide',
      subtitle: 'Get up and running in under five minutes.',
      icon: <BookOpen size={20} className="text-blue-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Ready to deploy your first AI workforce? Follow this step-by-step setup guide to provision agents and trigger runs.
          </p>

          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-black shrink-0">1</div>
              <div>
                <h4 className="font-black text-sm uppercase mb-1">Hire your Agents</h4>
                <p className="text-xs text-gray-500">Go to the Marketplace, view Devon or Ruby profiles, and click "Hire Agent" to provision them inside your workspace.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-black shrink-0">2</div>
              <div>
                <h4 className="font-black text-sm uppercase mb-1">Open the Workspace</h4>
                <p className="text-xs text-gray-500">Go to the Workspace page. Your active hired developers will appear in the left sidebar channel list ready to receive tasks.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-black text-white rounded-full w-8 h-8 flex items-center justify-center font-black shrink-0">3</div>
              <div>
                <h4 className="font-black text-sm uppercase mb-1">Launch visual sandbox previews</h4>
                <p className="text-xs text-gray-500">Toggle the header panel to "Live Sandbox" to run and preview custom developer code output dynamically inside an iframe container.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },

    // --- WORKSPACE ---
    {
      id: 'workspace-channels',
      category: 'workspace',
      title: 'Running Channels & Persistence',
      subtitle: 'How workspace channels organize collaboration.',
      icon: <Layers size={20} className="text-indigo-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            The Pixorva Workspace is divided into modular developer channels (e.g. `#frontend`, `#database-migration`, `#security-audit`). 
            Each channel holds independent state configurations:
          </p>

          <div className="border-2 border-black rounded-2xl p-6 bg-gray-50 space-y-4">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Workspace State Saving</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              To keep work seamless, Pixorva automatically saves active channels selection, chosen agents, and complete message histories 
              client-side inside your browser memory (`localStorage`). If you close the tab or refresh the browser, the developer workspace restores fully.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'sandbox-iframe',
      category: 'workspace',
      title: 'Visual Sandbox Compiler',
      subtitle: 'Preview and run code directly in the channel browser.',
      icon: <ExternalLink size={20} className="text-green-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Every workspace channel features a dynamic split viewport selector: **💬 Chat Feed** vs **🖥️ Live Sandbox**.
          </p>

          <h3 className="text-xl font-black uppercase mt-6">How Sandbox works:</h3>
          <ul className="list-disc pl-5 space-y-2 text-xs text-gray-700 font-medium">
            <li><strong>Automated Code Parsing:</strong> The parser scans active chat threads for generated markdown `html` blocks.</li>
            <li><strong>Isolate Iframe viewports:</strong> Swapping to the Sandbox Tab injects the clean HTML dynamically inside a sandboxed viewport.</li>
            <li><strong>Hot Reloads:</strong> As Devon updates code, the live iframe hot-reloads instantly, showing UI changes immediately.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'workspace-collaboration',
      category: 'workspace',
      title: 'Multi-Agent Collaboration & Mail Triggers',
      subtitle: 'How agents work together and dispatch emails.',
      icon: <Users size={20} className="text-indigo-600" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Pixorva channels support active collaboration pipelines where different AI employees take turns executing sub-tasks based on thread progression.
          </p>

          <div className="bg-blue-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h4 className="font-black text-xs uppercase text-black">🔄 Multi-Agent Context Sharing</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              When you invite multiple agents (e.g. Devon the developer, Quinn the QA tester, and Cy the auditor) to a channel, they share 
              the complete historical chat log context. When Devon outputs code, Quinn automatically reads the thread to design target test cases, 
              and Cy audits the final result for vulnerabilities, creating a seamless multi-agent collaborative loop.
            </p>
          </div>

          <div className="bg-yellow-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-4">
            <h4 className="font-black text-xs uppercase text-black">✉️ Outbound Email & Resend Integrations</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pixorva agents hook directly into outbound notification loops:
            </p>
            <ul className="list-disc pl-4 text-xs text-gray-700 space-y-1">
              <li><strong>Billing & Invoices:</strong> Successful payment runs automatically trigger Resend service workers to generate custom tax PDFs and deliver them to your mailbox.</li>
              <li><strong>Outreach Automation:</strong> SDR agents like Sarah draft multi-step outbound email sequences to targeted domains.</li>
              <li><strong>Support Desks:</strong> Customer Support agents like Sam analyze customer complaints to design empathetic email responses.</li>
            </ul>
          </div>
        </div>
      )
    },

    // --- AI WORKFORCE AGENTS ---
    {
      id: 'agent-devon',
      category: 'agents',
      title: 'Devon (React Developer)',
      subtitle: 'The primary frontend engineer workforce agent.',
      icon: <Cpu size={20} className="text-orange-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Devon</strong> is optimized to construct rich HTML structures, CSS styling templates, and React component blocks.
          </p>

          <div className="bg-yellow-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'State Management', 'Neobrutalist UI'].map(s => (
                <span key={s} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Operational Workflow:</h5>
            <p className="text-xs text-gray-600 mb-3">
              1. Spec Trigger: User provides UI/UX criteria or layout specs.<br />
              2. Code Cycle: Devon designs component states, applies Tailwind utility classes, and returns complete code blocks.<br />
              3. Iframe Sandbox: Outputs run live in the split-screen visual preview iframe.
            </p>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Sample Prompt:</h5>
            <pre className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg overflow-x-auto">
"Create a responsive, neobrutalist pricing grid card with a monthly billing option. Use yellow background accents and thick borders."
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'agent-ruby',
      category: 'agents',
      title: 'Ruby (Backend Architect)',
      subtitle: 'The database schema and API route designer.',
      icon: <Cpu size={20} className="text-red-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Ruby</strong> specializes in database architecture, backend SQL data manipulation routines, and API route controllers.
          </p>

          <div className="bg-blue-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['PostgreSQL', 'Node.js', 'SQL Schema Design', 'API Route Handlers', 'Query Optimization', 'Supabase'].map(s => (
                <span key={s} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Operational Workflow:</h5>
            <p className="text-xs text-gray-600 mb-3">
              1. Schema Request: User defines tables, fields, or endpoint routes.<br />
              2. Architecture Cycle: Ruby creates relational database tables, sets indexing scopes, and designs clean server controller routes.
            </p>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Sample Prompt:</h5>
            <pre className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg overflow-x-auto">
"Write a Postgres SQL script to create a users table and a user_sessions table with cascade deletes on session expiry."
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'agent-quinn',
      category: 'agents',
      title: 'Quinn (QA Tester)',
      subtitle: 'The primary quality assurance and test automation engineer.',
      icon: <Cpu size={20} className="text-blue-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Quinn</strong> writes Jest unit tests, Cypress end-to-end integration tests, and identifies logical edge cases inside codebases.
          </p>

          <div className="bg-gray-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Jest', 'Cypress', 'Unit Testing', 'Regression Testing', 'CI/CD Pipelines', 'Logical Edge Cases'].map(s => (
                <span key={s} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Operational Workflow:</h5>
            <p className="text-xs text-gray-600 mb-3">
              1. Code Snippet Trigger: User submits code functions or React components.<br />
              2. Test Automation: Quinn maps boundary conditions, sets mock requests, and returns test scripts.
            </p>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Sample Prompt:</h5>
            <pre className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg overflow-x-auto">
"Write unit tests using Jest for a function that parses database timestamps and filters out entries older than 24 hours."
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'agent-cy',
      category: 'agents',
      title: 'Cy (Security Analyst)',
      subtitle: 'The audit and compliance security specialist.',
      icon: <Cpu size={20} className="text-purple-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Cy</strong> audits source codes, database structures, and environment policies to prevent vulnerabilities.
          </p>

          <div className="bg-purple-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Security Auditing', 'Vulnerability Assessments', 'GDPR / HIPAA', 'Penetration Testing', 'Row Level Security'].map(s => (
                <span key={s} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Operational Workflow:</h5>
            <p className="text-xs text-gray-600 mb-3">
              1. Codebase Trigger: User supplies source code, database tables, or configurations.<br />
              2. Vulnerability Review: Cy runs diagnostics, checking for OWASP Top 10 vulnerabilities and SQL injections.
            </p>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Sample Prompt:</h5>
            <pre className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg overflow-x-auto">
"Audit this Node.js API controller that accepts email inputs. Identify potential injection routes and suggest validation patches."
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'agent-marcus',
      category: 'agents',
      title: 'Marcus (Growth Hacker)',
      subtitle: 'The content marketer and viral growth campaign strategist.',
      icon: <Cpu size={20} className="text-green-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Marcus</strong> designs LinkedIn hooks, Twitter launch threads, ad copy, and general organic marketing funnels.
          </p>

          <div className="bg-green-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Viral Marketing', 'LinkedIn Hooks', 'Twitter Threads', 'Ad Copy', 'Copywriting', 'Conversion Funnels'].map(s => (
                <span key={s} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Sample Prompt:</h5>
            <pre className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg overflow-x-auto">
"Draft a 4-tweet Twitter thread announcing the rollout of our new interactive developer sandboxes. Include conversion metrics."
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'agent-stella',
      category: 'agents',
      title: 'Stella (Social Media Mgr)',
      subtitle: 'The audience engagement and visual brand script designer.',
      icon: <Cpu size={20} className="text-green-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Stella</strong> creates structured scripts for Reels, YouTube Shorts, TikToks, and captions.
          </p>

          <div className="bg-green-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Short Video Scripting', 'Instagram Captions', 'Audience Growth', 'Content Calendar Outline', 'Trend Optimization'].map(s => (
                <span key={s} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Sample Prompt:</h5>
            <pre className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg overflow-x-auto">
"Write a 30-second video script demonstrating how our QA agent Quinn automates Jest testing. Include visual directions."
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'agent-gordon',
      category: 'agents',
      title: 'Gordon (SEO Blog Writer)',
      subtitle: 'The content optimization and search blog post writer.',
      icon: <Cpu size={20} className="text-green-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Gordon</strong> researches high-ranking keywords, organizes articles using proper heading structures, and drafts SEO blogs.
          </p>

          <div className="bg-green-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['SEO Optimization', 'Long Form Writing', 'Keyword Density', 'Meta Descriptions', 'Content Strategy'].map(s => (
                <span key={s} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Sample Prompt:</h5>
            <pre className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg overflow-x-auto">
"Write a 1,000-word post on 'Why Local Database persistence is crucial in Vercel apps'. Focus on the keyword 'database validation'."
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'agent-vic',
      category: 'agents',
      title: 'Vic (Video Scripter)',
      subtitle: 'The video scripting and storyboard structure compiler.',
      icon: <Cpu size={20} className="text-green-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Vic</strong> maps video flow, details visual actions, and writes technical storyboards.
          </p>

          <div className="bg-green-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['YouTube Scripting', 'Storyboarding', 'Creative Pacing', 'Visual Cues', 'Educational Tech Scripts'].map(s => (
                <span key={s} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Sample Prompt:</h5>
            <pre className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg overflow-x-auto">
"Turn our documentation on 'Setting Up Supabase Service Keys' into a step-by-step YouTube script with narration."
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'agent-sarah',
      category: 'agents',
      title: 'Sarah (SDR / Outreach)',
      subtitle: 'The client outreach and business development email designer.',
      icon: <Cpu size={20} className="text-red-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Sarah</strong> researches customer profiles and designs high-conversion cold email outreach sequences.
          </p>

          <div className="bg-red-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Cold Outreach', 'Email Sequencing', 'Lead Conversion', 'B2B Sales Copy', 'Call to Action Optimization'].map(s => (
                <span key={s} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Sample Prompt:</h5>
            <pre className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg overflow-x-auto">
"Draft a 3-email sequence introducing startup founders to our API console. Focus on saving LLM token execution logs."
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'agent-larry',
      category: 'agents',
      title: 'Larry (Lead Enricher)',
      subtitle: 'The business list research and lead enrichment specialist.',
      icon: <Cpu size={20} className="text-red-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Larry</strong> gathers business data parameters and formats lead sheets for outbound targets.
          </p>

          <div className="bg-red-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Lead List Enrichment', 'Data Aggregation', 'B2B Research', 'Formatting Excel/CSV Schemas', 'Market Segmentation'].map(s => (
                <span key={s} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Sample Prompt:</h5>
            <pre className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg overflow-x-auto">
"Structure a database schema layout to store target contacts including company domain, employee size, and direct emails."
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'agent-holly',
      category: 'agents',
      title: 'Holly (HR Manager)',
      subtitle: 'The hiring workflow and human resources analyst.',
      icon: <Cpu size={20} className="text-yellow-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Holly</strong> compiles corporate policies, designs job descriptions, and structures candidate screening checksheets.
          </p>

          <div className="bg-yellow-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Job Description Design', 'Policy Drafting', 'Screening Checklists', 'Interview Templates', 'HR Checksheets'].map(s => (
                <span key={s} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Sample Prompt:</h5>
            <pre className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg overflow-x-auto">
"Draft a job description for a React Developer focusing on Tailwind. Include 4 screening questions about component state hooks."
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'agent-finn',
      category: 'agents',
      title: 'Finn (Finance Analyst)',
      subtitle: 'The corporate P&L and tax metrics analyst.',
      icon: <Cpu size={20} className="text-yellow-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Finn</strong> reviews costing ledgers, details EBITDA percentages, and creates cost-optimization sheets.
          </p>

          <div className="bg-yellow-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['P&L Analysis', 'Expense Categorization', 'EBITDA Projections', 'Tax Checklists', 'Cost Optimization'].map(s => (
                <span key={s} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Sample Prompt:</h5>
            <pre className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg overflow-x-auto">
"Analyze this serverless routing overhead: Cloud database: $800, Token APIs: $600. Suggest cost reduction strategies."
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'agent-lawson',
      category: 'agents',
      title: 'Lawson (Legal Assistant)',
      subtitle: 'The agreement templates and compliance document compiler.',
      icon: <Cpu size={20} className="text-yellow-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Lawson</strong> drafts contracts, Non-Disclosure Agreements (NDAs), and reviews terms frameworks.
          </p>

          <div className="bg-yellow-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['NDA Templates', 'Contract Drafting', 'Service Level Agreements', 'Compliance Reviews', 'Liabilities Checklists'].map(s => (
                <span key={s} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Sample Prompt:</h5>
            <pre className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg overflow-x-auto">
"Draft a mutual NDA template for a client consulting contract. Include typical sections for remedies and governing law."
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'agent-pat',
      category: 'agents',
      title: 'Pat (Product Manager)',
      subtitle: 'The agile roadmap and product story compiler.',
      icon: <Cpu size={20} className="text-yellow-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Pat</strong> compiles user stories, prioritizes roadmap milestones, and writes requirements docs (PRDs).
          </p>

          <div className="bg-yellow-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Product Spec Design', 'User Stories mapping', 'Agile Roadmaps', 'UX Requirements', 'Feature Backlog Priority'].map(s => (
                <span key={s} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Sample Prompt:</h5>
            <pre className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg overflow-x-auto">
"Write user story parameters for adding an interactive playground terminal. Include acceptance checklist criteria."
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'agent-sam',
      category: 'agents',
      title: 'Sam (Customer Support)',
      subtitle: 'The conflict resolution and support ticket reply designer.',
      icon: <Cpu size={20} className="text-orange-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Sam</strong> reviews user complaints and generates polite, helpful support email drafts.
          </p>

          <div className="bg-orange-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Customer Empathy', 'Conflict Resolution', 'Support Response Checklists', 'SLA Inquiries', 'Account Status Updates'].map(s => (
                <span key={s} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Sample Prompt:</h5>
            <pre className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg overflow-x-auto">
"Draft an empathetic email reply to a user reporting their key validation is failing. Provide basic trouble steps."
            </pre>
          </div>
        </div>
      )
    },

    // --- DEVELOPER API ---
    {
      id: 'api-auth',
      category: 'api',
      title: 'Developer Console & Bearer Keys',
      subtitle: 'Trigger your workforce agents from external endpoints.',
      icon: <Terminal size={20} className="text-yellow-600" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            You can generate custom developer API keys directly inside `/settings` to call your provisioned Pixorva workforce agents 
            from external platforms like CI/CD runners, personal terminals, or Slack bots.
          </p>

          <div className="space-y-4">
            <h4 className="font-black text-xs uppercase text-black">Configuring Service Keys</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Because external terminal calls are executed outside user browser sessions, Supabase's Row-Level Security (RLS) blocks anonymous selects by default. 
              To validate keys externally, copy your project secret `service_role` key from Supabase Dashboard and set it inside your environment variables:
            </p>
            <code className="text-xs bg-black text-green-400 p-4 rounded-xl block select-all font-mono">
              SUPABASE_SERVICE_ROLE_KEY=your_copied_secret_service_role_key
            </code>
          </div>
        </div>
      )
    },
    {
      id: 'api-reference',
      category: 'api',
      title: 'POST /api/run-agent',
      subtitle: 'API specification for agent execution runs.',
      icon: <Terminal size={20} className="text-green-600" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            Send a POST request to execute an autonomous agent instruction run.
          </p>

          <div className="border-2 border-black rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
            <div className="bg-gray-100 px-4 py-2 border-b-2 border-black font-black text-xs flex justify-between items-center">
              <span>CURL SAMPLE REQUEST</span>
              <button 
                onClick={() => handleCopyCode(
                  `curl -X POST "https://pixorva.com/api/run-agent" \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer px_live_your_key_here" \\\n  -d '{\n    "input": "Explain why API key authentication is secure in one sentence.",\n    "agentId": "your_agent_uuid_here",\n    "agentRole": "Cy (Security Analyst)"\n  }'`,
                  'curl-spec'
                )}
                className="text-[9px] uppercase border border-black px-2 py-0.5 rounded bg-white hover:bg-gray-100 flex items-center gap-1 font-bold"
              >
                {copiedText === 'curl-spec' ? <Check size={10}/> : <Copy size={10}/>}
                {copiedText === 'curl-spec' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-black text-green-400 font-mono text-[10px] overflow-x-auto">
{`curl -X POST "https://pixorva.com/api/run-agent" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer px_live_your_key_here" \\
  -d '{
    "input": "Explain why API key authentication is secure in one sentence.",
    "agentId": "your_agent_uuid_here",
    "agentRole": "Cy (Security Analyst)"
  }'`}
            </pre>
          </div>
        </div>
      )
    },

    // --- GOVERNANCE ---
    {
      id: 'gov-review',
      category: 'governance',
      title: 'Compliance & Governance Gates',
      subtitle: 'Regulating AI workforce outputs securely.',
      icon: <ShieldCheck size={20} className="text-yellow-500" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            The Pixorva Governance panel provides administrative oversight for running AI workforces:
          </p>

          <ul className="list-disc pl-5 space-y-2 text-xs text-gray-700 font-medium">
            <li><strong>Audit Logging:</strong> Monitor execution logs across all API keys and channels to track telemetry levels.</li>
            <li><strong>Merge Gating:</strong> Set rules determining whether agents can push codes directly to repository branches or must block for manual reviews.</li>
            <li><strong>Grievance Role:</strong> All corporate grievances are routed to the Grievance Desk at `grievance@pixorva.com`.</li>
          </ul>
        </div>
      )
    }
  ];

  // Search filter matching titles and subtitles
  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const matchText = `${a.title} ${a.subtitle}`.toLowerCase();
      return matchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  const activeArticle = useMemo(() => {
    return articles.find(a => a.id === activeTab) || articles[0];
  }, [activeTab]);

  return (
    <div className={`min-h-screen bg-gray-50 text-black ${inter.className} flex flex-col`}>
      
      {/* Top Header */}
      <header className="bg-white border-b-4 border-black px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="bg-black text-white p-2 rounded-lg border-2 border-black hover:bg-yellow-400 hover:text-black transition shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-none hover:translate-y-0.5 flex items-center justify-center shrink-0">
            <ArrowLeft size={16} />
          </Link>
          <span className={`text-2xl font-black uppercase tracking-wider ${oswald.className}`}>
            Pixorva Docs
          </span>
        </div>
        <div className="text-[10px] font-black uppercase bg-black text-white px-3 py-1 rounded-full">
          v1.4.0 Live Spec
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 md:p-8 gap-6">
        
        {/* Left Sidebar */}
        <aside className="w-full md:w-64 shrink-0 md:sticky md:top-24 md:max-h-[calc(100vh-140px)] flex flex-col overflow-hidden">
          {/* Search box */}
          <div className="relative shrink-0 mb-4">
            <input 
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-black rounded-xl text-xs font-bold focus:outline-none placeholder-gray-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-none transition-all"
            />
            <Search size={14} className="absolute left-3 top-3.5 text-gray-400" />
          </div>

          {/* Navigation Links list */}
          <nav className="flex-grow overflow-y-auto pr-1 space-y-6 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
            {categories.map(cat => {
              const catArticles = filteredArticles.filter(art => art.category === cat.id);
              if (catArticles.length === 0) return null;

              return (
                <div key={cat.id} className="pr-1">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
                    {cat.icon}
                    {cat.name}
                  </h4>
                  <ul className="space-y-1 border-l-2 border-gray-200 ml-2 pl-2">
                    {catArticles.map(art => (
                      <li key={art.id}>
                        <button
                          onClick={() => setActiveTab(art.id)}
                          className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                            activeTab === art.id 
                              ? 'bg-yellow-400 text-black border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                              : 'text-gray-500 hover:text-black hover:bg-gray-100 border border-transparent'
                          }`}
                        >
                          <span className="truncate">{art.title}</span>
                          <ChevronRight size={10} className={activeTab === art.id ? 'opacity-100' : 'opacity-30'} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>
        </aside>

        {/* Right content viewer */}
        <main className="flex-grow bg-white border-4 border-black rounded-3xl p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] min-h-[500px]">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-gray-400 mb-4">
            <span>Pixorva</span>
            <span>/</span>
            <span>Docs</span>
            <span>/</span>
            <span className="text-yellow-600">
              {categories.find(c => c.id === activeArticle.category)?.name}
            </span>
          </div>

          {/* Article Header */}
          <div className="flex items-start gap-4 border-b-2 border-gray-100 pb-6 mb-6">
            <div className="bg-yellow-400 p-3 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0">
              {activeArticle.icon}
            </div>
            <div>
              <h2 className={`text-3xl uppercase leading-tight font-black ${oswald.className}`}>
                {activeArticle.title}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {activeArticle.subtitle}
              </p>
            </div>
          </div>

          {/* Article Content */}
          <article className="prose max-w-none text-sm text-gray-800">
            {activeArticle.content}
          </article>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white py-6 text-center text-xs font-black uppercase mt-12">
        Pixorva Documentation Platform © 2026. Billed with precision.
      </footer>
    </div>
  );
}
