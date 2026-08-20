import { showToast } from "./Toast";

const loadScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface CheckoutParams {
  userId: string;
  agentName: string;
  icon: string;
  steps: any[];
  amount: number; // in paise
  email: string;
  onSuccess: () => void;
  onFailure: () => void;
}

export const triggerRazorpayCheckout = async (params: CheckoutParams) => {
  const isLoaded = await loadScript();
  if (!isLoaded) {
    showToast("Failed to load Razorpay payment gateway.", "error");
    params.onFailure();
    return;
  }

  try {
    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: params.amount,
        currency: "INR",
        notes: {
          userId: params.userId,
          agentName: params.agentName,
          icon: params.icon,
          steps: JSON.stringify(params.steps)
        }
      })
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      showToast(data.error || "Order creation failed.", "error");
      params.onFailure();
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
      name: "Pixorva Platform",
      description: `Hire Agent: ${params.agentName.split('(')[0]}`,
      order_id: data.order_id,
      handler: async function (response: any) {
        try {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            showToast("🎉 Payment Successful! Contract verified.", "success");
            params.onSuccess();
          } else {
            showToast(verifyData.error || "Payment verification failed.", "error");
            params.onFailure();
          }
        } catch (err) {
          console.error("Verification error:", err);
          showToast("Payment verification server error.", "error");
          params.onFailure();
        }
      },
      prefill: {
        email: params.email
      },
      theme: {
        color: "#FACC15"
      },
      modal: {
        ondismiss: function () {
          showToast("Payment cancelled by user.", "error");
          params.onFailure();
        }
      }
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", function (response: any) {
      showToast(response.error.description || "Payment failed.", "error");
      params.onFailure();
    });
    rzp.open();

  } catch (err) {
    console.error("Razorpay trigger error:", err);
    showToast("Razorpay connection failed.", "error");
    params.onFailure();
  }
};
