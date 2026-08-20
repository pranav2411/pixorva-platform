"use client";

import React from "react";
import { Oswald, Inter } from "next/font/google";
import { Check, X, Zap, ArrowLeft, Crown, Shield, Rocket } from "lucide-react";
import Link from "next/link";
import Image from "next/image";


const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function PricingPage() {
  return (
    <div className={`min-h-screen bg-white text-black ${inter.className}`}>
      
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b-4 border-black sticky top-0 bg-white z-50">
        <Link href="/" className="flex items-center gap-2">
            <Image
                src="/favicon.ico"
                alt="Pixorva Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded"
            />
        <span className={`text-2xl uppercase italic ${oswald.className}`}>Pixorva</span>
        </Link>
        <Link href="/trial">
            <button className="bg-yellow-400 text-black border-2 border-black px-4 py-2 rounded font-bold uppercase hover:bg-black hover:text-white transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none">
                Start Free Trial
            </button>
        </Link>
      </nav>

      {/* HERO */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-block bg-red-500 text-white border-2 border-black px-4 py-1 rounded-full text-xs font-black uppercase mb-6 transform -rotate-2">
            Stop Burning Cash on Payroll
        </div>
        <h1 className={`text-5xl md:text-8xl uppercase leading-[0.9] mb-8 ${oswald.className}`}>
          Hire an Entire Team <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600">
             For the Price of Lunch.
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Why pay ₹50,000/mo for one intern when you can have 20 Senior AI Experts for a fraction of the cost?
        </p>
      </div>

      {/* THE COMPARISON (US VS THEM) */}
      <div className="max-w-6xl mx-auto px-6 mb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-black rounded-3xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              
              {/* FREELANCER */}
              <div className="bg-gray-100 p-8 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col items-center text-center opacity-60">
                  <h3 className={`text-2xl uppercase mb-4 ${oswald.className}`}>Freelancer</h3>
                  <div className="text-4xl font-black mb-2 text-gray-500">₹30k<span className="text-sm">/mo</span></div>
                  <ul className="space-y-4 mt-6 text-sm font-bold text-gray-500">
                      <li className="flex items-center justify-center gap-2"><X size={16}/> Availability: 9-5 only</li>
                      <li className="flex items-center justify-center gap-2"><X size={16}/> Speed: 3-5 days/task</li>
                      <li className="flex items-center justify-center gap-2"><X size={16}/> Skills: Limited to one</li>
                      <li className="flex items-center justify-center gap-2"><X size={16}/> Reliability: Ghosting risk</li>
                  </ul>
              </div>

              {/* AGENCY */}
              <div className="bg-gray-100 p-8 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col items-center text-center opacity-60">
                  <h3 className={`text-2xl uppercase mb-4 ${oswald.className}`}>Traditional Agency</h3>
                  <div className="text-4xl font-black mb-2 text-gray-500">₹1.5L<span className="text-sm">/mo</span></div>
                  <ul className="space-y-4 mt-6 text-sm font-bold text-gray-500">
                      <li className="flex items-center justify-center gap-2"><Check size={16}/> Availability: 9-5 M-F</li>
                      <li className="flex items-center justify-center gap-2"><X size={16}/> Speed: Weeks/Months</li>
                      <li className="flex items-center justify-center gap-2"><Check size={16}/> Skills: High</li>
                      <li className="flex items-center justify-center gap-2"><X size={16}/> Meetings: Too many</li>
                  </ul>
              </div>

              {/* PIXORVA (HERO) */}
              <div className="bg-yellow-300 p-8 flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase">Winner</div>
                  <h3 className={`text-4xl uppercase mb-4 ${oswald.className}`}>Pixorva AI</h3>
                  <div className="text-5xl font-black mb-2">₹4,999<span className="text-xl">/mo</span></div>
                  <ul className="space-y-4 mt-6 text-sm font-black text-black">
                      <li className="flex items-center justify-center gap-2"><Zap size={18} fill="black"/> Availability: 24/7/365</li>
                      <li className="flex items-center justify-center gap-2"><Zap size={18} fill="black"/> Speed: Instant Results</li>
                      <li className="flex items-center justify-center gap-2"><Zap size={18} fill="black"/> Skills: 20+ Experts</li>
                      <li className="flex items-center justify-center gap-2"><Zap size={18} fill="black"/> Drama: Zero. None.</li>
                  </ul>
                  <Link href="/trial" className="w-full">
                    <button className="mt-8 w-full bg-black text-white py-3 rounded-lg font-bold uppercase hover:bg-white hover:text-black hover:border-2 hover:border-black transition">
                        Join the Revolution
                    </button>
                  </Link>
              </div>

          </div>
      </div>

      {/* PRICING TIERS */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
          <h2 className={`text-4xl text-center uppercase mb-12 ${oswald.className}`}>Choose Your Plan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* STARTER */}
              <div className="border-4 border-black rounded-2xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition hover:-translate-y-1 bg-white">
                  <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 border-2 border-black"><Shield size={24}/></div>
                  <h3 className={`text-2xl uppercase ${oswald.className}`}>Starter</h3>
                  <p className="text-gray-500 text-sm font-bold mb-6">For solo founders testing ideas.</p>
                  <div className="text-4xl font-black mb-6">₹0 <span className="text-sm font-medium text-gray-500">/ 7 Days</span></div>
                  <ul className="space-y-3 text-sm font-medium mb-8">
                      <li className="flex gap-2"><Check size={16}/> Access to 3 Basic Agents</li>
                      <li className="flex gap-2"><Check size={16}/> 10 Tasks / Day</li>
                      <li className="flex gap-2"><Check size={16}/> Standard Speed</li>
                  </ul>
                  <Link href="/trial">
                    <button className="w-full border-2 border-black py-3 rounded-lg font-bold uppercase hover:bg-black hover:text-white transition">Start Free Trial</button>
                  </Link>
              </div>

              {/* PRO (HIGHLIGHTED) */}
              <div className="border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-black text-white relative transform md:-translate-y-4">
                  <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-black px-3 py-1 uppercase rounded-bl-lg border-l-2 border-b-2 border-black">Most Popular</div>
                  <div className="bg-yellow-400 text-black w-12 h-12 rounded-full flex items-center justify-center mb-4 border-2 border-white"><Rocket size={24}/></div>
                  <h3 className={`text-2xl uppercase ${oswald.className}`}>Growth Pro</h3>
                  <p className="text-gray-400 text-sm font-bold mb-6">For scaling startups.</p>
                  <div className="text-4xl font-black mb-6 text-yellow-400">₹4,999 <span className="text-sm font-medium text-gray-400">/ mo</span></div>
                  <ul className="space-y-3 text-sm font-medium mb-8">
                      <li className="flex gap-2"><Check size={16}/> Access to ALL 20 Agents</li>
                      <li className="flex gap-2"><Check size={16}/> Unlimited Tasks</li>
                      <li className="flex gap-2"><Check size={16}/> &quot;Flash&quot; Speed (Fast)</li>
                      <li className="flex gap-2"><Check size={16}/> Save History</li>
                  </ul>
                  <button className="w-full bg-yellow-400 text-black border-2 border-yellow-400 py-3 rounded-lg font-bold uppercase hover:bg-white hover:border-white transition">Get Growth Pro</button>
              </div>

              {/* AGENCY */}
              <div className="border-4 border-black rounded-2xl p-8 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition hover:-translate-y-1 bg-white">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4 border-2 border-black"><Crown size={24}/></div>
                  <h3 className={`text-2xl uppercase ${oswald.className}`}>Enterprise</h3>
                  <p className="text-gray-500 text-sm font-bold mb-6">For heavy workflows.</p>
                  <div className="text-4xl font-black mb-6">₹19,999 <span className="text-sm font-medium text-gray-500">/ mo</span></div>
                  <ul className="space-y-3 text-sm font-medium mb-8">
                      <li className="flex gap-2"><Check size={16}/> Build Custom Agents</li>
                      <li className="flex gap-2"><Check size={16}/> &quot;Pro&quot; Intelligence (Smarter)</li>
                      <li className="flex gap-2"><Check size={16}/> API Access</li>
                      <li className="flex gap-2"><Check size={16}/> Dedicated Support</li>
                  </ul>
                  <button className="w-full border-2 border-black py-3 rounded-lg font-bold uppercase hover:bg-black hover:text-white transition">Contact Sales</button>
              </div>

          </div>
      </div>

    </div>
  );
}