'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AgentAvatar from '../components/AgentAvatar';
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
  ExternalLink,
  X 
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <h4 className="font-black text-xs uppercase text-black">✉️ Outbound Email Services</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Pixorva agents hook directly into outbound notification loops:
            </p>
            <ul className="list-disc pl-4 text-xs text-gray-700 space-y-1">
              <li><strong>Billing & Invoices:</strong> Successful payment runs automatically trigger secure email gateway service workers to generate custom tax PDFs and deliver them to your mailbox.</li>
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
      icon: <AgentAvatar id="dev-1" className="w-8 h-8 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Devon</strong> is optimized to construct rich HTML structures, CSS styling templates, and React component blocks. She is highly proficient in Tailwind utility structures, TypeScript definitions, React hooks state orchestration, and Next.js dynamic routing structures.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Devon can sandbox UI ideas rapidly, verify CSS responsiveness across viewports, compile typescript configurations, and write drop-in reusable components for your layouts.
          </p>

          <div className="bg-yellow-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'State Management', 'Neobrutalist UI', 'Responsive Design', 'Babel Sandbox'].map(s => (
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
      icon: <AgentAvatar id="dev-2" className="w-8 h-8 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Ruby</strong> specializes in database architecture, backend SQL data manipulation routines, and API route controllers. She excels at writing highly-optimized PostgreSQL queries, designing relational database schemas, setting indexing parameters to reduce query latency, and drafting Express/Node.js backend service frameworks.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Ruby maps foreign key relationships, writes database migrations, structures trigger events, and designs secure route endpoints.
          </p>

          <div className="bg-blue-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['PostgreSQL', 'Node.js', 'SQL Schema Design', 'API Route Handlers', 'Query Optimization', 'Relational Databases', 'Database Migrations', 'Foreign Keys'].map(s => (
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
      icon: <AgentAvatar id="dev-3" className="w-8 h-8 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Quinn</strong> writes Jest unit tests, Cypress end-to-end integration tests, and identifies logical edge cases inside codebases. She focuses on securing 100% test coverage parameters, setting up network call mocks, tracking variable outputs, and finding hidden logic glitches.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Quinn runs test assertions on form inputs, tracks authentication state shifts, and validates page rendering conditions.
          </p>

          <div className="bg-gray-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Jest', 'Cypress', 'Unit Testing', 'Regression Testing', 'CI/CD Pipelines', 'Logical Edge Cases', 'Mock Assertions', 'Test Coverage'].map(s => (
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
      icon: <AgentAvatar id="dev-4" className="w-8 h-8 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Cy</strong> audits source codes, database structures, and environment policies to prevent vulnerabilities. She checks for OWASP top vulnerabilities, audits Row-Level Security (RLS) configurations, secures authorization variables, and writes clear threat analysis reports.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Cy is your secure gates protector, helping you lock down open ports, scan dependencies for security leaks, and pass compliance checks.
          </p>

          <div className="bg-purple-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Security Auditing', 'Vulnerability Assessments', 'GDPR / HIPAA', 'Penetration Testing', 'Row Level Security', 'Compliance Gates', 'Dependency Audits', 'OWASP Rules'].map(s => (
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
      icon: <AgentAvatar id="mkt-1" className="w-8 h-8 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Marcus</strong> designs LinkedIn hooks, Twitter launch threads, ad copy, and general organic marketing funnels. He studies conversion metrics, structures targeted email campaigns, and optimizes lead-generation loops.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Marcus understands conversion coefficients, dynamic referral pipelines, and helps you convert landing page traffic into active clients.
          </p>

          <div className="bg-green-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Viral Marketing', 'LinkedIn Hooks', 'Twitter Threads', 'Ad Copy', 'Copywriting', 'Conversion Funnels', 'Growth Coefficient', 'Referrals Log'].map(s => (
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
      icon: <AgentAvatar id="mkt-2" className="w-8 h-8 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Stella</strong> creates structured scripts for Reels, YouTube Shorts, TikToks, and captions. She researches peak engagement parameters, monitors algorithmic updates, and schedules posts to maximize social media reach.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Stella drafts engaging copy, selects high-impact tags, and manages monthly posting schedules.
          </p>

          <div className="bg-green-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Short Video Scripting', 'Instagram Captions', 'Audience Growth', 'Content Calendar Outline', 'Trend Optimization', 'Algorithmic Pacing', 'Engagement KPIs'].map(s => (
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
      icon: <AgentAvatar id="mkt-3" className="w-8 h-8 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Gordon</strong> researches high-ranking keywords, organizes articles using proper heading structures, and drafts SEO blogs. He focuses on keyword search difficulty indices, designs semantic header hierarchies, and writes engaging content that ranks at the top.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Gordon ensures your blog matches search engine queries, writes clear meta summaries, and boosts organic CTR profiles.
          </p>

          <div className="bg-green-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['SEO Optimization', 'Long Form Writing', 'Keyword Density', 'Meta Descriptions', 'Content Strategy', 'SERP Ranking', 'Semantic Headers'].map(s => (
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
      icon: <AgentAvatar id="mkt-4" className="w-8 h-8 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Vic</strong> maps video flow, details visual actions, and writes technical storyboards. He structures pacing guides, outlines text overlay locations, and designs short-form scripts that optimize audience retention metrics.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Vic helps you compile storyboards, organize voiceover sequences, and script promo clips for your SaaS features.
          </p>

          <div className="bg-green-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['YouTube Scripting', 'Storyboarding', 'Creative Pacing', 'Visual Cues', 'Educational Tech Scripts', 'Video Overlay Map', 'Retention Hooks'].map(s => (
                <span key={s} className="bg-white border border-black text-[9px] font-black uppercase px-2 py-0.5 rounded">{s}</span>
              ))}
            </div>
            <h5 className="font-black text-[10px] uppercase text-black mb-1">Sample Prompt:</h5>
            <pre className="p-3 bg-black text-green-400 font-mono text-[9px] rounded-lg overflow-x-auto">
"Turn our documentation on 'Setting Up Secure Database Service Keys' into a step-by-step YouTube script with narration."
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
      icon: <AgentAvatar id="sales-1" className="w-8 h-8 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Sarah</strong> researches customer profiles and designs high-conversion cold email outreach sequences. She focuses on writing non-spammy subject headers, personalizing outreach to target domains, and structuring follow-up schedules.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Sarah sets up email trigger pathways, automates B2B sequences, and books meetings for your sales representatives.
          </p>

          <div className="bg-red-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Cold Outreach', 'Email Sequencing', 'Lead Conversion', 'B2B Sales Copy', 'Call to Action Optimization', 'SDR Workflows', 'Domain Research'].map(s => (
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
      icon: <AgentAvatar id="sales-2" className="w-8 h-8 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Larry</strong> gathers business data parameters and formats lead sheets for outbound targets. He validates emails, checks decision-maker direct lines, filters contacts by industry size, and cleans list details.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Larry minimizes B2B bounce rates, extracts target contact maps, and builds clean Excel lists for outbound tools.
          </p>

          <div className="bg-red-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Lead List Enrichment', 'Data Aggregation', 'B2B Research', 'Formatting Excel/CSV Schemas', 'Market Segmentation', 'Email Verification', 'List Cleaning'].map(s => (
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
      icon: <AgentAvatar id="ops-1" className="w-8 h-8 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Holly</strong> compiles corporate policies, designs job descriptions, and structures candidate screening checksheets. She designs onboarding guides, formats HR policy manuals, and sets up employee benefit outlines.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Holly helps you automate candidate screening filters, coordinates company handbooks, and saves HR operations hours.
          </p>

          <div className="bg-yellow-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Job Description Design', 'Policy Drafting', 'Screening Checklists', 'Interview Templates', 'HR Checksheets', 'Onboarding Guides', 'Employee Handbooks'].map(s => (
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
      icon: <AgentAvatar id="ops-2" className="w-8 h-8 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Finn</strong> reviews costing ledgers, details EBITDA percentages, and creates cost-optimization sheets. He analyzes bank data, identifies duplicate subscriptions, tracks cash burn rates, and suggests margin optimizations.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Finn calculates cost parameters, models EBITDA projection metrics, and automates balance ledger auditing.
          </p>

          <div className="bg-yellow-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['P&L Analysis', 'Expense Categorization', 'EBITDA Projections', 'Tax Checklists', 'Cost Optimization', 'Ledger Auditing', 'Cash Burn Track'].map(s => (
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
      icon: <AgentAvatar id="ops-3" className="w-8 h-8 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Lawson</strong> drafts contracts, Non-Disclosure Agreements (NDAs), and reviews terms frameworks. He identifies liability risks inside vendor agreements, suggests protection clauses, and structures standard template layouts.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Lawson provides clean boilerplates, structures custom consulting charters, and audits legal terms for accuracy.
          </p>

          <div className="bg-yellow-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['NDA Templates', 'Contract Drafting', 'Service Level Agreements', 'Compliance Reviews', 'Liabilities Checklists', 'Risk Audits', 'Boilerplate Design'].map(s => (
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
      icon: <AgentAvatar id="ops-4" className="w-8 h-8 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Pat</strong> compiles user stories, prioritizes roadmap milestones, and writes requirements docs (PRDs). He tracks sprint deliverables, logs team action items, sets up Jira tickets, and ensures agile roadmap alignment.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Pat translates feature concepts into dev requirements, structures backlog priorities, and monitors project execution velocity.
          </p>

          <div className="bg-yellow-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Product Spec Design', 'User Stories mapping', 'Agile Roadmaps', 'UX Requirements', 'Feature Backlog Priority', 'Scrum Velocity', 'Sprint Action Logs'].map(s => (
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
      icon: <AgentAvatar id="sup-1" className="w-8 h-8 rounded-xl border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0" />,
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            <strong>Sam</strong> reviews user complaints and generates polite, helpful support email drafts. He focuses on customer satisfaction scoring (CSAT), tracks resolution speed parameters, and handles SLA billing questions.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Sam helps you draft empathetic help desk responses, structures FAQ articles, and maintains SLA compliance.
          </p>

          <div className="bg-orange-50 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <h4 className="font-black text-xs uppercase mb-2 text-black">Core Competencies & Tools</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {['Customer Empathy', 'Conflict Resolution', 'Support Response Checklists', 'SLA Inquiries', 'Account Status Updates', 'FAQ Drafting', 'CSAT Optimization'].map(s => (
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
              Because external terminal calls are executed outside user browser sessions, the database's Row-Level Security (RLS) blocks anonymous selects by default. 
              To validate keys externally, copy your project secret `service_role` key from your database dashboard and set it inside your environment variables:
            </p>
            <code className="text-xs bg-black text-green-400 p-4 rounded-xl block select-all font-mono">
              DATABASE_SERVICE_ROLE_KEY=your_copied_secret_service_role_key
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

  const selectedAgentName = useMemo(() => {
    if (activeArticle.category !== 'agents') return null;
    const raw = activeArticle.id.replace('agent-', '').trim();
    if (!raw) return null;
    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  }, [activeArticle]);

  return (
    <div className={`min-h-screen bg-[#0e0f12] text-white ${inter.className} flex flex-col selection:bg-[#ffc700] selection:text-black`}>
      
      {/* Top Header */}
      <header className="bg-[#141519]/90 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <Link href="/" className="bg-black/50 text-white p-2 rounded-xl hover:bg-[#ffc700] hover:text-black transition border border-white/15 shadow-sm flex items-center justify-center shrink-0">
            <ArrowLeft size={16} />
          </Link>
          <h1 className={`text-2xl font-black uppercase tracking-wider text-white ${oswald.className}`}>Developer Docs</h1>
        </div>
        <div className="bg-[#ffc700] text-black border border-yellow-300 px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider shadow-sm">
          Live Spec v1.4.0
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 md:p-8 gap-6">
        
        {/* Mobile Backdrop overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <aside className={`fixed md:sticky top-0 left-0 h-screen md:h-auto w-[280px] md:w-64 bg-[#141519] md:bg-transparent border-r border-white/10 md:border-r-0 p-6 md:p-0 z-40 transition-transform duration-300 flex flex-col overflow-hidden shrink-0 md:top-24 md:max-h-[calc(100vh-140px)] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}>
          {/* Mobile Sidebar Close Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10 md:hidden shrink-0">
            <span className={`text-lg font-black uppercase tracking-wider text-white ${oswald.className}`}>Menu</span>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 border border-white/20 rounded-lg hover:bg-white/10 text-white flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search box */}
          <div className="relative shrink-0 mb-4">
            <input 
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-[#ffc700] shadow-sm transition-all"
            />
            <Search size={14} className="absolute left-3 top-3.5 text-neutral-500" />
          </div>

          {/* Navigation Links list */}
          <nav className="flex-grow overflow-y-auto pr-1 space-y-6 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-600">
            {categories.map(cat => {
              const catArticles = filteredArticles.filter(art => art.category === cat.id);
              if (catArticles.length === 0) return null;

              return (
                <div key={cat.id} className="pr-1">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                    {cat.icon}
                    {cat.name}
                  </h4>
                  <ul className="space-y-1 border-l-2 border-white/10 ml-2 pl-2">
                    {catArticles.map(art => (
                      <li key={art.id}>
                        <button
                          onClick={() => {
                            setActiveTab(art.id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full text-left py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-between ${
                            activeTab === art.id 
                              ? 'bg-[#ffc700] text-black border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                              : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
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
        <main className="flex-grow bg-[#141519]/80 backdrop-blur-xl border border-white/15 rounded-3xl p-6 md:p-10 shadow-2xl min-h-[500px] relative overflow-hidden text-white">
          {/* Ambient Video Player behind selected Agent Doc */}
          {selectedAgentName && (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
              <video
                key={selectedAgentName}
                src={`/GIF/${selectedAgentName}.mp4`}
                poster={`/GIF/${selectedAgentName}.png`}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover opacity-35 scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0e0f12]/85 via-[#0e0f12]/65 to-[#0e0f12]/90" />
            </div>
          )}

          <div className="relative z-10">
            {/* Breadcrumbs - Fully Clickable */}
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-neutral-400 mb-4 tracking-wider">
              <Link href="/" className="hover:text-[#ffc700] transition">
                Pixorva
              </Link>
              <span>/</span>
              <button 
                onClick={() => { setActiveTab('intro'); setSearchQuery(''); }}
                className="hover:text-[#ffc700] transition uppercase font-black"
              >
                Docs
              </button>
              <span>/</span>
              {activeArticle.category === 'agents' ? (
                <Link href="/employees" className="text-[#ffc700] hover:underline transition font-black">
                  AI Workforce Agents
                </Link>
              ) : activeArticle.category === 'workspace' ? (
                <Link href="/workspace" className="text-[#ffc700] hover:underline transition font-black">
                  Collaborative Workspace
                </Link>
              ) : activeArticle.category === 'api' ? (
                <Link href="/settings#api" className="text-[#ffc700] hover:underline transition font-black">
                  Developer API Console
                </Link>
              ) : activeArticle.category === 'governance' ? (
                <Link href="/governance" className="text-[#ffc700] hover:underline transition font-black">
                  Governance & Rules
                </Link>
              ) : (
                <button 
                  onClick={() => setActiveTab('intro')}
                  className="text-[#ffc700] hover:underline transition font-black uppercase"
                >
                  {categories.find(c => c.id === activeArticle.category)?.name}
                </button>
              )}
            </div>

            {/* Article Header */}
            <div className="flex items-start gap-4 border-b border-white/10 pb-6 mb-6">
              <div className="bg-[#ffc700] p-3 rounded-2xl border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black shrink-0">
                {activeArticle.icon}
              </div>
              <div>
                <h2 className={`text-3xl uppercase leading-tight font-black text-white ${oswald.className}`}>
                  {activeArticle.title}
                </h2>
                <p className="text-xs text-neutral-400 font-medium mt-1">
                  {activeArticle.subtitle}
                </p>
              </div>
            </div>

            {/* Article Content with Dark Mode Scoped CSS */}
            <article className="prose prose-invert max-w-none text-sm doc-article-content">
              {activeArticle.content}
            </article>

            <style jsx global>{`
              .doc-article-content p {
                color: #d4d4d8 !important;
              }
              .doc-article-content strong {
                color: #ffffff !important;
              }
              .doc-article-content h3,
              .doc-article-content h4,
              .doc-article-content h5 {
                color: #ffffff !important;
              }
              /* Any inner cards/boxes */
              .doc-article-content div[class*="bg-"] {
                background-color: rgba(0, 0, 0, 0.65) !important;
                border-color: rgba(255, 255, 255, 0.15) !important;
                backdrop-filter: blur(8px) !important;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
              }
              .doc-article-content div[class*="bg-"] h4 {
                color: #ffc700 !important;
                font-weight: 900 !important;
                letter-spacing: 0.05em !important;
              }
              .doc-article-content div[class*="bg-"] h5 {
                color: #ffc700 !important;
                font-weight: 900 !important;
                letter-spacing: 0.05em !important;
              }
              .doc-article-content div[class*="bg-"] p,
              .doc-article-content div[class*="bg-"] li {
                color: #e4e4e7 !important;
              }
              /* Pill tags inside cards */
              .doc-article-content span[class*="bg-white"],
              .doc-article-content span[class*="bg-"] {
                background-color: rgba(255, 255, 255, 0.12) !important;
                color: #ffffff !important;
                border-color: rgba(255, 255, 255, 0.25) !important;
                font-weight: 800 !important;
              }
              /* Terminal prompts and code blocks */
              .doc-article-content pre {
                background-color: #000000 !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                color: #4ade80 !important;
              }
              .doc-article-content code {
                color: #ffc700 !important;
                background-color: rgba(0, 0, 0, 0.6) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                padding: 0.15rem 0.4rem !important;
                border-radius: 0.375rem !important;
              }
            `}</style>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0e0f12] py-6 text-center text-xs font-black uppercase mt-12 text-neutral-500">
        Pixorva Documentation Platform © 2026. Billed with precision.
      </footer>

      {/* Floating Mobile Sidebar Trigger Button */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-30 bg-[#ffc700] text-black border-2 border-black p-3.5 rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 active:shadow-none hover:bg-white hover:text-black transition flex items-center justify-center animate-bounce"
      >
        <FileText size={20} />
      </button>
    </div>
  );
}
