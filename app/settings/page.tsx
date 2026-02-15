"use client";

import { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/client';
import { Oswald, Inter } from "next/font/google";
import { ArrowLeft, Save, User as UserIcon, Loader2 } from "lucide-react";
import Link from 'next/link';

const oswald = Oswald({ subsets: ["latin"], weight: "700" });
const inter = Inter({ subsets: ["latin"] });

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');

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
            .select('full_name')
            .eq('id', user.id)
            .single();

        if (data) {
            setFullName(data.full_name || '');
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
        alert("Error updating profile!");
     } else {
        alert("Profile updated successfully!");
     }
     setSaving(false);
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

      </main>
    </div>
  );
}