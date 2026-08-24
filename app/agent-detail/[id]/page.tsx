'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Oswald, Inter } from 'next/font/google';
import { ArrowLeft, Check, Sparkles, CreditCard, ShoppingBag, Layers, Shield, Cpu, MessageSquare } from 'lucide-react';
import { EMPLOYEES } from '../../employees/page';
import { createClient } from '../../utils/supabase/client';
import { triggerRazorpayCheckout } from '../../utils/RazorpayCheckout';
import { showToast } from '../../utils/Toast';

const oswald = Oswald({ subsets: ['latin'], weight: ['400', '700'] });
const inter = Inter({ subsets: ['latin'] });

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [agreeHire, setAgreeHire] = useState(false);

  const employee = EMPLOYEES.find(e => e.id === id);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) setProfile(data);
      }
    };
    checkUser();
  }, []);

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-3xl font-black uppercase mb-4">Agent Not Found</h2>
        <p className="text-gray-500 mb-6">The requested AI employee profile does not exist in our registry.</p>
        <Link href="/employees" className="bg-black text-white px-6 py-3 rounded-xl font-bold uppercase hover:bg-yellow-400 hover:text-black transition">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const handleHireNow = async () => {
    if (!user) {
      showToast("Please log in to hire an AI employee.", "error");
      router.push("/login");
      return;
    }

    if (!agreeHire) {
      showToast("Please agree to the Terms of Service & Privacy Policy to continue.", "error");
      return;
    }

    setLoading(true);
    try {
      const amountVal = parseInt(employee.price.replace(/[^\d]/g, ""), 10) * 100;
      
      await triggerRazorpayCheckout({
        userId: user.id,
        agentName: `${employee.name} (${employee.role})`,
        icon: employee.icon,
        steps: employee.steps,
        amount: amountVal,
        email: user.email || '',
        isSubscription: true,
        onSuccess: () => {
          showToast(`${employee.name} hired successfully!`, "success");
          router.push("/workspace");
        },
        onFailure: () => {
          setLoading(false);
        }
      });
    } catch (e: any) {
      showToast("Failed to initiate checkout: " + e.message, "error");
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 text-black ${inter.className} flex flex-col`}>
      {/* Navbar Header */}
      <header className="bg-white border-b-4 border-black px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="bg-black text-white p-2 rounded-lg border-2 border-black hover:bg-yellow-400 hover:text-black transition shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-none hover:translate-y-0.5 flex items-center justify-center shrink-0">
            <ArrowLeft size={16} />
          </Link>
          <span className={`text-2xl font-black uppercase tracking-wider ${oswald.className}`}>
            Pixorva Registry
          </span>
        </div>
        <Link href="/employees" className="text-xs font-black uppercase border-2 border-black px-4 py-2 rounded-xl hover:bg-gray-100 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5">
          Marketplace
        </Link>
      </header>

      {/* Main Body */}
      <main className="flex-grow max-w-4xl mx-auto w-full p-4 md:p-8 flex flex-col gap-8">
        <div className="bg-white border-4 border-black rounded-3xl p-6 md:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row gap-8 items-start">
          
          {/* Left Visual Icon Card */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className={`w-32 h-32 rounded-3xl border-4 border-black bg-yellow-400 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4`}>
              <Cpu size={64} className="text-black" />
            </div>
            <span className="bg-black text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">
              {employee.category} Agent
            </span>
            <span className="text-2xl font-black text-green-600">{employee.price}</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase">per month subscription</span>
          </div>

          {/* Right Info Section */}
          <div className="w-full md:w-2/3 space-y-6">
            <div>
              <h1 className={`text-4xl md:text-5xl uppercase font-black leading-none ${oswald.className}`}>
                {employee.name}
              </h1>
              <p className="text-sm font-bold text-gray-500 uppercase mt-1">
                {employee.role}
              </p>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              {employee.desc}
            </p>

            {/* Skills */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Core Skills</h4>
              <div className="flex flex-wrap gap-2">
                {employee.skills.map(s => (
                  <span key={s} className="bg-white border-2 border-black px-2.5 py-1 rounded-lg text-xs font-black uppercase">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Pipeline Execution steps */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Execution Pipeline</h4>
              <div className="flex items-center gap-2">
                {employee.steps.map((st, idx) => (
                  <React.Fragment key={idx}>
                    <div className="border-2 border-black bg-gray-50 p-2 rounded-xl flex items-center gap-1.5 text-[10px] font-black uppercase">
                      <span className="text-yellow-600">★</span>
                      {st.name}
                    </div>
                    {idx < employee.steps.length - 1 && <span className="text-gray-400 font-bold">&rarr;</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Buying Gating Options */}
            <div className="border-t-2 border-gray-100 pt-6 space-y-4">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={agreeHire}
                  onChange={(e) => setAgreeHire(e.target.checked)}
                  className="mt-1 border-2 border-black rounded"
                />
                <span className="text-[10px] text-gray-500 font-medium">
                  I agree to Pixorva&apos;s <Link href="/terms" className="underline hover:text-black">Terms of Service</Link> & <Link href="/privacy" className="underline hover:text-black">Privacy Policy</Link> to commission this AI employee.
                </span>
              </label>

              <button
                onClick={handleHireNow}
                disabled={loading}
                className="w-full bg-yellow-400 hover:bg-black hover:text-white border-4 border-black text-black font-black uppercase py-4 rounded-2xl tracking-wider text-sm transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : `⚡ Hire ${employee.name} (${employee.price})`}
              </button>
            </div>
          </div>

        </div>

        {/* Explore more in Marketplace */}
        <div className="text-center">
          <Link href="/employees" className="inline-flex items-center gap-2 text-sm font-black uppercase text-gray-500 hover:text-black transition">
            &larr; Explore more agents in the Marketplace
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white py-6 text-center text-xs font-black uppercase mt-12">
        Pixorva AI Workforce Registry © 2026.
      </footer>
    </div>
  );
}
