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
            **Devon** is optimized to construct rich HTML structures, CSS styling templates, and React component blocks.
          </p>

          <div className="bg-yellow-50 border-2 border-black rounded-2xl p-6">
            <h4 className="font-black text-xs uppercase mb-1">Key Strengths:</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Writing highly responsive neobrutalist styling patterns, binding forms to Next.js routes, and outputting clean, compile-safe source files.
            </p>
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
            **Ruby** specializes in backend architectural layouts, SQL migrations, database index structures, and secure server-side controllers.
          </p>

          <div className="bg-blue-50 border-2 border-black rounded-2xl p-6">
            <h4 className="font-black text-xs uppercase mb-1">Key Strengths:</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Structuring Pl/pgSQL procedures, designing REST endpoints, and optimizing performance bottlenecks on Supabase queries.
            </p>
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
            **Cy** audits input variables, reviews SQL tables for potential injection vectors, and ensures compliance standards (GDPR, HIPAA) are enforced.
          </p>
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
          <Link href="/" className="bg-yellow-400 p-2 rounded-xl border-2 border-black hover:bg-black hover:text-yellow-400 transition">
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
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          {/* Search box */}
          <div className="relative">
            <input 
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border-2 border-black rounded-xl text-xs font-bold focus:outline-none placeholder-gray-400"
            />
            <Search size={14} className="absolute left-3 top-3.5 text-gray-400" />
          </div>

          {/* Navigation Links list */}
          <nav className="space-y-6">
            {categories.map(cat => {
              const catArticles = filteredArticles.filter(art => art.category === cat.id);
              if (catArticles.length === 0) return null;

              return (
                <div key={cat.id}>
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
