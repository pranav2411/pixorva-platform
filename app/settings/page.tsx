"use client";

import { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Oswald, Inter } from "next/font/google";
import { ArrowLeft, Save, User as UserIcon, Loader2, Zap, X, Trash2, Shield, User, CreditCard } from "lucide-react";
import Link from 'next/link';
import { showToast } from '../utils/Toast';

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [plan, setPlan] = useState('free');
  
  const [subscriptionAgents, setSubscriptionAgents] = useState<any[]>([]);
  const [paidAgents, setPaidAgents] = useState<any[]>([]);
  
  // Modal toggles
  const [showCancelModal, setShowCancelModal] = useState(false); // Growth Pro/Enterprise
  const [showCancelGovModal, setShowCancelGovModal] = useState(false); // Governance Control Tower
  const [selectedAgentToCancel, setSelectedAgentToCancel] = useState<any | null>(null); // Individual hired employee
  const [cancelling, setCancelling] = useState(false);

  // Compliance States
  const [showErasureModal, setShowErasureModal] = useState(false);
  const [erasing, setErasing] = useState(false);

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

  // 3. Cancel Bundled Plan (Growth Pro / Enterprise)
  const handleCancelSubscription = async () => {
    setCancelling(true);
    const supabase = createClient();
    try {
        // Downgrade plan to 'free' in profiles
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ plan: 'free' })
            .eq('id', userId);

        if (profileError) throw profileError;

        // Deactivate/delete plan slot agents (is_paid_individually = false)
        const { error: agentsError } = await supabase
            .from('agents')
            .delete()
            .eq('user_id', userId)
            .eq('is_paid_individually', false);

        if (agentsError) throw agentsError;

        showToast("Subscription plan cancelled successfully.", "success");
        setPlan('free');
        setSubscriptionAgents([]);
        setShowCancelModal(false);
    } catch (e: any) {
        showToast("Failed to cancel subscription: " + e.message, "error");
    } finally {
        setCancelling(false);
    }
  };

  // 4. Cancel Governance Control Tower Plan
  const handleCancelGovernance = async () => {
    setCancelling(true);
    const supabase = createClient();
    try {
      const govAgent = paidAgents.find(a => a.name === "Governance Control Tower");
      if (govAgent) {
        const { error } = await supabase
          .from('agents')
          .delete()
          .eq('id', govAgent.id);
        if (error) throw error;
        
        showToast("Governance Control Tower subscription cancelled.", "success");
        setPaidAgents(prev => prev.filter(a => a.id !== govAgent.id));
      }
      setShowCancelGovModal(false);
    } catch (e: any) {
      showToast("Failed to cancel Governance Control Tower: " + e.message, "error");
    } finally {
      setCancelling(false);
    }
  };

  // 5. Cancel Individual Employee Subscription
  const handleCancelIndividual = async () => {
    if (!selectedAgentToCancel) return;
    setCancelling(true);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', selectedAgentToCancel.id);
      if (error) throw error;
      
      showToast(`Hiring subscription for ${selectedAgentToCancel.name.split('(')[0]} cancelled.`, "success");
      setPaidAgents(prev => prev.filter(a => a.id !== selectedAgentToCancel.id));
      setSelectedAgentToCancel(null);
    } catch (e: any) {
      showToast("Failed to cancel contract: " + e.message, "error");
    } finally {
      setCancelling(false);
    }
  };

  // 6. Download Compliance Data Archive
  const handleDownloadArchive = () => {
    try {
      const archiveData = {
        exportDate: new Date().toISOString(),
        profile: {
          id: userId,
          name: fullName,
          email: email,
          plan: plan
        },
        hiredAgents: paidAgents.concat(subscriptionAgents)
      };
      
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(archiveData, null, 2)
      )}`;
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `pixorva-data-archive-${userId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      showToast("Your data archive has been compiled and downloaded.", "success");
    } catch (err: any) {
      showToast("Failed to compile archive: " + err.message, "error");
    }
  };

  // 7. Request Compliance Data Erasure
  const handleRequestErasure = async () => {
    setErasing(true);
    const supabase = createClient();
    try {
      // Delete all agents
      const { error: agentsError } = await supabase
        .from('agents')
        .delete()
        .eq('user_id', userId);
      if (agentsError) throw agentsError;

      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (profileError) throw profileError;

      // Sign out
      await supabase.auth.signOut();
      
      showToast("Your profile and workforce data have been completely erased.", "success");
      router.push("/login");
    } catch (err: any) {
      showToast("Failed to complete data erasure: " + err.message, "error");
      setErasing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const hasGovernance = paidAgents.some(a => a.name === "Governance Control Tower");
  const hiredIndividuals = paidAgents.filter(a => a.name !== "Governance Control Tower");

  return (
    <div className={`min-h-screen bg-gray-50 text-black pb-20 ${inter.className}`}>
      
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

         {/* Compliance & Data Control Desk */}
          <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-10">
             <h2 className="text-3xl font-black mb-4 uppercase flex items-center gap-3">
                 <div className="bg-yellow-400 p-2 rounded-xl border-2 border-black"><Shield size={24}/></div>
                 Compliance & Data Control Desk
             </h2>
             <p className="text-xs font-semibold text-gray-500 mb-6 leading-relaxed">
               In accordance with India DPDPA, EU GDPR, and CCPA standards, you hold full sovereignty over your stored data. Access data portability archives or request total erasure here.
             </p>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button
                 onClick={handleDownloadArchive}
                 className="bg-white hover:bg-gray-50 text-black py-4 px-6 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5 flex items-center justify-center gap-2"
               >
                 Download Data Archive
               </button>
               <button
                 onClick={() => setShowErasureModal(true)}
                 className="bg-red-500 hover:bg-black text-white py-4 px-6 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-y-0.5 flex items-center justify-center gap-2"
               >
                 Request Data Erasure
               </button>
             </div>
          </div>

         {/* Subscription & Plan Status Card */}
         <div className="bg-white border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mt-10">
            <h2 className="text-3xl font-black mb-6 uppercase flex items-center gap-3">
                <div className="bg-yellow-400 p-2 rounded-xl border-2 border-black"><Zap size={24}/></div>
                Plan & Subscription Status
            </h2>

            <div className="space-y-8">
                
                {/* 1. Bundled Plans (Growth Pro / Enterprise) */}
                <div className="border-2 border-black p-6 rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                        <h3 className="font-black text-sm uppercase text-gray-700 flex items-center gap-2">
                           <CreditCard size={18} />
                           Growth Pro / Enterprise Bundle
                        </h3>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded border ${plan !== 'free' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>
                            {plan !== 'free' ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {plan === 'growth_pro' && (
                        <div className="space-y-4">
                            <p className={`text-xl font-black uppercase ${oswald.className}`}>Growth Pro Plan (₹1,999/mo)</p>
                            
                            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold uppercase text-gray-500">Plan Slot Utilisation</span>
                                    <span className="text-xs font-black uppercase text-black">{subscriptionAgents.length} / 4 slots</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${(subscriptionAgents.length / 4) * 100}%` }} />
                                </div>
                            </div>
                            
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="w-full bg-red-500 hover:bg-black text-white py-2 rounded-xl border-2 border-black font-bold uppercase text-[10px] tracking-wider transition"
                            >
                                Cancel Growth Pro Subscription
                            </button>
                        </div>
                    )}

                    {plan === 'enterprise' && (
                        <div className="space-y-4">
                            <p className={`text-xl font-black uppercase ${oswald.className}`}>Enterprise Plan (₹4,999/mo)</p>
                            <p className="text-xs font-semibold text-gray-500 leading-normal">Allows unlimited hires and control integrations across all channels.</p>
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="w-full bg-red-500 hover:bg-black text-white py-2 rounded-xl border-2 border-black font-bold uppercase text-[10px] tracking-wider transition"
                            >
                                Cancel Enterprise Subscription
                            </button>
                        </div>
                    )}

                    {plan === 'free' && (
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-gray-400 italic">No bundled platform plan active.</p>
                            <Link href="/pricing" className="text-xs font-black uppercase text-yellow-600 hover:underline block">&rarr; Browse Platform Plans</Link>
                        </div>
                    )}
                </div>

                {/* 2. Governance Control Tower Plan */}
                <div className="border-2 border-black p-6 rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                        <h3 className="font-black text-sm uppercase text-gray-700 flex items-center gap-2">
                           <Shield size={18} />
                           Governance Gate
                        </h3>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded border ${hasGovernance ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>
                            {hasGovernance ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    {hasGovernance ? (
                        <div className="space-y-4">
                            <p className={`text-xl font-black uppercase ${oswald.className}`}>Governance Control Tower (₹1,999/mo)</p>
                            <p className="text-xs font-semibold text-gray-500 leading-normal">Grants proxy gating, auditing vaults, and admission policies checks.</p>
                            <button
                                onClick={() => setShowCancelGovModal(true)}
                                className="w-full bg-red-500 hover:bg-black text-white py-2 rounded-xl border-2 border-black font-bold uppercase text-[10px] tracking-wider transition"
                            >
                                Cancel Governance Subscription
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs font-medium text-gray-400 italic">Governance Gate is locked.</p>
                            <Link href="/governance/info" className="text-xs font-black uppercase text-yellow-600 hover:underline block">&rarr; Subscribe to Governance Gate</Link>
                        </div>
                    )}
                </div>

                {/* 3. Individual Hired Employee Subscriptions */}
                <div className="border-2 border-black p-6 rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                        <h3 className="font-black text-sm uppercase text-gray-700 flex items-center gap-2">
                           <User size={18} />
                           Individual AI Employee Subscriptions
                        </h3>
                        <span className="text-xs font-black uppercase text-black">
                            {hiredIndividuals.length} Hired
                        </span>
                    </div>

                    {hiredIndividuals.length === 0 ? (
                        <p className="text-xs font-medium text-gray-400 italic">No individually hired employee subscriptions active.</p>
                    ) : (
                        <div className="space-y-4">
                            {hiredIndividuals.map((agent) => {
                              let price = "₹999/mo"; // Default
                              const lowerName = agent.name.toLowerCase();
                              if (lowerName.includes("ruby")) price = "₹1,299/mo";
                              else if (lowerName.includes("quinn")) price = "₹799/mo";
                              else if (lowerName.includes("cy")) price = "₹1,499/mo";
                              else if (lowerName.includes("marcus")) price = "₹899/mo";
                              else if (lowerName.includes("stella")) price = "₹699/mo";
                              else if (lowerName.includes("gordon")) price = "₹799/mo";
                              else if (lowerName.includes("vic")) price = "₹899/mo";
                              else if (lowerName.includes("sarah")) price = "₹999/mo";
                              else if (lowerName.includes("larry")) price = "₹899/mo";
                              else if (lowerName.includes("holly")) price = "₹1,199/mo";
                              else if (lowerName.includes("finn")) price = "₹1,499/mo";
                              else if (lowerName.includes("lawson")) price = "₹1,999/mo";
                              else if (lowerName.includes("pat")) price = "₹1,099/mo";
                              else if (lowerName.includes("sam")) price = "₹499/mo";

                              return (
                                <div key={agent.id} className="flex justify-between items-center border-2 border-black p-4 rounded-xl bg-gray-50">
                                    <div>
                                        <p className="font-black text-sm uppercase leading-none">{agent.name.split('(')[0]}</p>
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mt-1 block">Hired Subscription • {price}</span>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedAgentToCancel(agent)}
                                        className="bg-red-500 hover:bg-black text-white px-4 py-1.5 rounded-lg border-2 border-black text-[9px] font-black uppercase transition"
                                    >
                                        Cancel Contract
                                    </button>
                                </div>
                              );
                            })}
                        </div>
                    )}
                </div>

            </div>
         </div>

      </main>

      {/* CANCEL BUNDLED PLAN MODAL (Growth Pro / Enterprise) */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black p-8 rounded-3xl max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative">
                <button disabled={cancelling} onClick={() => setShowCancelModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-black transition">
                    <X size={24} />
                </button>
                <div className="mb-6 flex justify-center">
                    <div className="bg-red-100 p-4 rounded-2xl border-4 border-black text-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Trash2 size={36} /></div>
                </div>
                <h3 className={`text-3xl uppercase mb-3 ${oswald.className}`}>Cancel Bundle Plan?</h3>
                <p className="text-sm font-semibold text-gray-600 mb-8 leading-relaxed">Are you sure you want to cancel your platform bundle subscription? You will immediately lose slots access and all included employee slots will be terminated.</p>
                <div className="flex flex-col gap-3">
                    <button 
                      disabled={cancelling}
                      onClick={handleCancelSubscription}
                      className="w-full bg-red-500 text-white hover:bg-black py-4 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition shadow-md flex items-center justify-center gap-2"
                    >
                        {cancelling ? <Loader2 className="animate-spin" size={16} /> : 'Yes, Cancel Plan'}
                    </button>
                    <button disabled={cancelling} onClick={() => setShowCancelModal(false)} className="w-full bg-white text-gray-500 hover:text-black py-2 font-bold uppercase text-xs tracking-wider transition">Keep My Plan</button>
                </div>
            </div>
        </div>
      )}

      {/* CANCEL GOVERNANCE MODAL */}
      {showCancelGovModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black p-8 rounded-3xl max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative">
                <button disabled={cancelling} onClick={() => setShowCancelGovModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-black transition">
                    <X size={24} />
                </button>
                <div className="mb-6 flex justify-center">
                    <div className="bg-red-100 p-4 rounded-2xl border-4 border-black text-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Shield size={36} /></div>
                </div>
                <h3 className={`text-3xl uppercase mb-3 ${oswald.className}`}>Cancel Governance?</h3>
                <p className="text-sm font-semibold text-gray-600 mb-8 leading-relaxed">Are you sure you want to cancel your Governance Control Tower subscription? You will lose Proxy gating and admission policies audit access immediately.</p>
                <div className="flex flex-col gap-3">
                    <button 
                      disabled={cancelling}
                      onClick={handleCancelGovernance}
                      className="w-full bg-red-500 text-white hover:bg-black py-4 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition shadow-md flex items-center justify-center gap-2"
                    >
                        {cancelling ? <Loader2 className="animate-spin" size={16} /> : 'Yes, Cancel Governance'}
                    </button>
                    <button disabled={cancelling} onClick={() => setShowCancelGovModal(false)} className="w-full bg-white text-gray-500 hover:text-black py-2 font-bold uppercase text-xs tracking-wider transition">Keep My Subscription</button>
                </div>
            </div>
        </div>
      )}

      {/* CANCEL INDIVIDUAL AGENT CONTRACT MODAL */}
      {selectedAgentToCancel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black p-8 rounded-3xl max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative">
                <button disabled={cancelling} onClick={() => setSelectedAgentToCancel(null)} className="absolute right-4 top-4 text-gray-400 hover:text-black transition">
                    <X size={24} />
                </button>
                <div className="mb-6 flex justify-center">
                    <div className="bg-red-100 p-4 rounded-2xl border-4 border-black text-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><User size={36} /></div>
                </div>
                <h3 className={`text-3xl uppercase mb-3 ${oswald.className}`}>Cancel Contract?</h3>
                <p className="text-sm font-semibold text-gray-600 mb-8 leading-relaxed">Are you sure you want to terminate the hiring subscription for <strong>{selectedAgentToCancel.name.split('(')[0]}</strong>? This employee will be removed from your office immediately.</p>
                <div className="flex flex-col gap-3">
                    <button 
                      disabled={cancelling}
                      onClick={handleCancelIndividual}
                      className="w-full bg-red-500 text-white hover:bg-black py-4 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition shadow-md flex items-center justify-center gap-2"
                    >
                        {cancelling ? <Loader2 className="animate-spin" size={16} /> : 'Yes, Terminate Contract'}
                    </button>
                    <button disabled={cancelling} onClick={() => setSelectedAgentToCancel(null)} className="w-full bg-white text-gray-500 hover:text-black py-2 font-bold uppercase text-xs tracking-wider transition">Keep Employee</button>
                </div>
            </div>
        </div>
      )}

      {/* COMPLIANCE DATA ERASURE MODAL */}
      {showErasureModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black p-8 rounded-3xl max-w-md w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center relative">
                <button disabled={erasing} onClick={() => setShowErasureModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-black transition">
                    <X size={24} />
                </button>
                <div className="mb-6 flex justify-center">
                    <div className="bg-red-100 p-4 rounded-2xl border-4 border-black text-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"><Shield size={36} /></div>
                </div>
                <h3 className={`text-3xl uppercase mb-3 ${oswald.className}`}>Erase Personal Data?</h3>
                <p className="text-sm font-semibold text-gray-600 mb-8 leading-relaxed">
                  Warning: Under GDPR and DPDPA, this triggers total erasure of your profile and deletes all hired employees from database storage. This action is permanent and cannot be undone.
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                      disabled={erasing}
                      onClick={handleRequestErasure}
                      className="w-full bg-red-600 text-white hover:bg-black py-4 rounded-xl border-2 border-black font-black uppercase text-xs tracking-wider transition shadow-md flex items-center justify-center gap-2"
                    >
                        {erasing ? <Loader2 className="animate-spin" size={16} /> : 'Yes, Delete My Account'}
                    </button>
                    <button disabled={erasing} onClick={() => setShowErasureModal(false)} className="w-full bg-white text-gray-500 hover:text-black py-2 font-bold uppercase text-xs tracking-wider transition">Cancel</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}