'use client';
import { useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

interface HireProps {
  agentName: string;
  agentId: string;
  planId: string; // Pass the Plan ID from Razorpay Dashboard here
  price: number;
}

export default function HireButton({ agentName, agentId, planId, price }: HireProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);

    // 1. Create Subscription
    const res = await fetch('/api/checkout/razorpay', {
      method: 'POST',
      body: JSON.stringify({ planId, agentId }),
    });
    const data = await res.json();

    if (!data.sub_id) {
      alert("Server error. Please try again.");
      setLoading(false);
      return;
    }

    // 2. Open Razorpay Modal
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      subscription_id: data.sub_id,
      name: "Pixorva Marketplace",
      description: `Hire ${agentName}`,
      image: "https://your-logo-url.com/logo.png", // Optional
      handler: async function (response: any) {
        // 3. Verify Payment on Success
        const verifyRes = await fetch('/api/checkout/verify', {
          method: 'POST',
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_subscription_id: response.razorpay_subscription_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });
        
        const verifyData = await verifyRes.json();
        if (verifyData.success) {
           // Redirect to the "Studio" to meet the new employee
           router.push(`/studio?agent=${agentId}&welcome=true`);
        } else {
           alert("Payment verification failed.");
        }
      },
      theme: { color: "#FFC800" }, // Matches your Brand Yellow
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
    setLoading(false);
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-[#FFC800] border-[3px] border-black text-black font-black uppercase py-3 px-6 shadow-[4px_4px_0px_#000000] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000000] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Hire for ₹${price}/mo +`}
      </button>
    </>
  );
}