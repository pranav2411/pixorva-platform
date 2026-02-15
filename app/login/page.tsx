"use client";

import { useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { Oswald, Inter } from "next/font/google";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import Link from 'next/link';

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    
    // Validate email
    if (!email.includes('@')) {
        setMessage({ type: 'error', text: "Please enter a valid email." });
        setLoading(false);
        return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: "Magic Link sent! Check your inbox." });
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 ${inter.className}`}>
      
      {/* Back Button */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
           <div className={`text-4xl uppercase tracking-tighter italic mb-2 ${oswald.className}`}>
             Pixorva
           </div>
           <h1 className="text-2xl font-bold">Welcome back</h1>
           <p className="text-gray-500 mt-2">Enter your email to sign in to your workspace.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
           <div>
             <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email Address</label>
             <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition"
                  required
                />
             </div>
           </div>

           <button 
             type="submit" 
             disabled={loading}
             className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-wide hover:bg-yellow-400 hover:text-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
           >
             {loading ? <Loader2 className="animate-spin" /> : "Send Magic Link"}
           </button>
        </form>

        {/* Messages */}
        {message && (
            <div className={`mt-6 p-4 rounded-xl text-sm font-medium text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
            </div>
        )}
        
        <p className="text-center text-xs text-gray-400 mt-8">
            By clicking continue, you agree to our Terms of Service and Privacy Policy.
        </p>

      </div>
    </div>
  );
}