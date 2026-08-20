"use client";

import { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { Oswald, Inter } from "next/font/google";
import { ArrowLeft, Save, User as UserIcon, Loader2, Zap, X, Trash2 } from "lucide-react";
import Link from 'next/link';
import { showToast } from '../utils/Toast';

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [plan, setPlan] = useState('free');
  const [subscriptionAgents, setSubscriptionAgents] = useState<any[]>([]);
  const [paidAgents, setPaidAgents] = useState<any[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // 1. Load User Data
  useEffect(() => {
    const getProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserId(user.id);
        setEmail(user.email || '');
        
        // Fetch Profile Data
        const { data, error } = await supabase
            .from('profiles')
            .select('full_name, plan')
            .eq('id', user.id)
            .single();

        if (data) {
            setFullName(data.full_name || '');
            setPlan(data.plan || 'free');
        }

        // Fetch Agents
        const { data: agentsData } = await supabase
            .from('agents')
            .select('*')
            .eq('user_id', user.id);

        if (agentsData) {
            setSubscriptionAgents(agentsData.filter((a: any) => !a.is_paid_individually));
            setPaidAgents(agentsData.filter((a: any) => a.is_paid_individually));
        }
      }
      setLoading(false);
    };
    getProfile();
  }, []);

  // 2. Update Profile
  const updateProfile = async () => {
     setSaving(true);
     const supabase = createClient();

     const { error } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            full_name: fullName,
            updated_at: new Date().toISOString(),
        });

      if (error) {
         showToast("Error updating profile!", "error");
      } else {
         showToast("Profile updated successfully!", "success");
      }
     setSaving(false);
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    const supabase = createClient();
    try {
        // 1. Downgrade plan to 'free' in profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ plan: 'free' })
            .eq('id', userId);

        if (profileError) throw profileError;

        // 2. Deactivate/delete plan slot agents (is_paid_individually = false)
        const { error: agentsError } = await supabase
            .from('agents')
            .delete()
            .eq('user_id', userId)
            .eq('is_paid_individually', false);

        if (agentsError) throw agentsError;

        showToast("Subscription cancelled successfully.", "success");
        setPlan('free');
        setSubscriptionAgents([]);
        setShowCancelModal(false);
    } catch (e: any) {
        showToast("Failed to cancel subscription: " + e.message, "error");
    } finally {
        setCancelling(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className={`min-h-screen bg-gray-50 text-black ${inter.className}`}>
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft size={20}/></Link>
            <h1 className={`text-xl uppercase ${oswald.className}`}>Settings</h1>
         </div>
      </nav>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
         
         <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="bg-yellow-400 p-2 rounded-lg"><UserIcon size={24}/></div>
                Profile Details
            </h2>

            <div className="space-y-6">
                
                {/* Email (Read Only) */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email Address</label>
                    <input type="text" value={email} disabled className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" />
                    <p className="text-xs text-gray-400 mt-2">Email cannot be changed.</p>
                </div>

                {/* Full Name */}
                <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Full Name</label>
                    <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ex. John Doe"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black" 
                    />
                </div>

                {/* Save Button */}
                <button 
                    onClick={updateProfile}
                    disabled={saving}
                    className="bg-black text-white px-8 py-3 rounded-xl font-bold uppercase hover:bg-yellow-400 hover:text-black transition-all flex items-center gap-2"
                >
                    {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                    Save Changes
                </button>

            </div>
         </div>

         {/* Subscription & Plan Status Card */}
         <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-10">
            <h2 className="text-3xl font-black mb-6 uppercase flex items-center gap-3">
                <div className="bg-yellow-400 p-2 rounded-xl border-2 border-black"><Zap size={24}/></div>
                Plan & Subscription
            </h2>

            <div className="space-y-6">
                <div className="flex justify-between items-center bg-gray-50 border-2 border-black p-4 rounded-xl">
                    <div>
                        <p className="text-xs font-bold uppercase text-gray-500">Current Plan</p>
                        <p className={`text-2xl font-black uppercase ${oswald.className}`}>
                            {plan === 'growth_pro' ? 'Growth Pro Plan' : plan === 'enterprise' ? 'Enterprise Plan' : 'Free Trial / Individual'}
                        </p>
                    </div>
                    <span className="bg-yellow-400 text-black px-3 py-1.5 rounded-lg border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        Active
                    </span>
                </div>

                {/* Progress Bar (Only for Growth Pro Plan) */}
                {plan === 'growth_pro' && (
                    <div className="border-2 border-black p-6 rounded-2xl bg-white">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-bold uppercase text-gray-700">Free Subscription Slots Used</span>
                            <span className="text-sm font-black uppercase text-black">
                                {subscriptionAgents.length} / 4 Agents
                            </span>
                        </div>

                        {/* Progress Bar Track */}
                        <div className="w-full bg-gray-100 border-2 border-black rounded-full h-6 overflow-hidden p-0.5">
                            <div 
                                className="bg-yellow-400 h-full rounded-full border border-black transition-all duration-500"
                                style={{ width: `${Math.min(100, (subscriptionAgents.length / 4) * 100)}%` }}
                            />
                        </div>

                        {/* List of Agents under subscription */}
                        <div className="mt-8">
                            <h3 className="text-xs font-bold uppercase text-gray-500 mb-4">Included in your subscription:</h3>
                            {subscriptionAgents.length === 0 ? (
                                <p className="text-sm text-gray-400 font-medium italic">No subscription agents hired yet. Go to Marketplace to pick up to 4 agents.</p>
                            ) : (
                                <div className="space-y-3">
                                    {subscriptionAgents.map((agent) => (
                                        <div key={agent.id} className="flex justify-between items-center border border-gray-200 px-4 py-3 rounded-xl bg-gray-50">
                                            <span className="font-bold text-gray-800">{agent.name}</span>
                                            <span className="text-[10px] font-black uppercase bg-green-100 text-green-700 px-2.5 py-1 rounded border border-green-300">
                                                Plan Active
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Renewal Note Callout */}
                        <div className="mt-8 bg-yellow-50 border-2 border-black border-dashed p-4 rounded-xl flex gap-3 text-sm text-gray-700 font-medium leading-relaxed">
                            <span className="text-xl">💡</span>
                            <div>
                                <strong>Important Note:</strong> You can swap or change which 4 agents are active under your plan at the time of renewal. If you need more active slots simultaneously, you can upgrade to the <strong>Enterprise Plan</strong> (Unlimited access) or purchase a second plan for 4 additional slots.
                            </div>
                        </div>
                    </div>
                )}

                {/* Info for Enterprise plan */}
                {plan === 'enterprise' && (
                    <div className="border-2 border-black p-6 rounded-2xl bg-white text-sm text-gray-600 font-medium">
                        🎉 You have <strong>Enterprise Plan</strong> access! You can hire as many agents from the Marketplace as you want, completely free and unlimited.
                    </div>
                )}

                {/* Info for Free plan */}
                {plan === 'free' && (
                    <div className="border-2 border-black p-6 rounded-2xl bg-white text-sm text-gray-600 font-medium leading-relaxed">
                        You are currently on the <strong>Free Tier</strong>. Hires are made either through your one-time 3-day Free Trial or as individual one-off purchases. 
                        <br/><br/>
                        <Link href="/pricing" className="text-black font-black underline hover:text-yellow-500">
                            Upgrade to Growth Pro or Enterprise for bundled discounts &rarr;
                        </Link>
                    </div>
                )}

                {/* Cancel Option (Only for active plan users) */}
                {(plan === 'growth_pro' || plan === 'enterprise') && (
                    <div className="flex justify-end pt-6 border-t-2 border-black border-dashed mt-6">
                        <button
                            onClick={() => setShowCancelModal(true)}
                            className="bg-red-500 hover:bg-black text-white hover:text-white px-6 py-3 rounded-xl border-2 border-black font-bold uppercase text-xs tracking-wider transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-1"
                        >
                            Cancel Subscription
                        </button>
                    </div>
                )}
            </div>
         </div>

      {/* CUSTOM NEOBRUTALIST CANCEL SUBSCRIPTION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black p-8 rounded-3xl max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200 text-center relative">
                <button 
                  disabled={cancelling}
                  onClick={() => setShowCancelModal(false)} 
                  className="absolute right-4 top-4 text-gray-400 hover:text-black transition"
                >
                    <X size={24} />
                </button>

                <div className="mb-6 flex justify-center">
                    <div className="bg-red-100 p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-red-600">
                        <Trash2 size={36} />
                    </div>
                </div>

                <h3 className={`text-3xl uppercase mb-3 ${oswald.className}`}>
                    Cancel Subscription?
                </h3>

                <p className="text-sm font-semibold text-gray-600 mb-8 leading-relaxed">
                    Are you sure you want to cancel your subscription? You will lose access to your plan slots and all your agents under the plan will be deactivated. This cannot be undone.
                </p>

                <div className="flex flex-col gap-3">
                    <button 
                      disabled={cancelling}
                      onClick={handleCancelSubscription}
                      className="w-full bg-red-500 text-white hover:bg-black py-4 rounded-xl border-2 border-black font-black uppercase text-sm tracking-wider transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {cancelling ? <Loader2 className="animate-spin" size={16} /> : 'Yes, Cancel Subscription'}
                    </button>
                    <button 
                      disabled={cancelling}
                      onClick={() => setShowCancelModal(false)}
                      className="w-full bg-white text-gray-500 hover:text-black py-2 font-bold uppercase text-xs tracking-wider transition"
                    >
                        Keep My Plan
                    </button>
                </div>
            </div>
        </div>
      )}

       </main>
    </div>
  );
}