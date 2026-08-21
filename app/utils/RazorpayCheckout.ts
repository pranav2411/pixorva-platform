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
  isSubscription?: boolean;
  isPlan?: boolean;
  planCode?: string;
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
        isSubscription: params.isSubscription !== false,
        notes: {
          userId: params.userId,
          agentName: params.agentName ? params.agentName.replace(/[^\x00-\x7F]/g, "") : "",
          icon: params.icon ? params.icon.replace(/[^\x00-\x7F]/g, "") : "",
          steps: params.steps ? JSON.stringify(params.steps).replace(/[^\x00-\x7F]/g, "") : "[]",
          isPlan: params.isPlan ? "true" : "false",
          planCode: params.planCode || ""
        }
      })
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      showToast(data.error || "Order creation failed.", "error");
      params.onFailure();
      return;
    }

    const options: any = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: "Pixorva Platform",
      description: `Hire Agent: ${params.agentName.split('(')[0]}`,
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
      },
      handler: async function (response: any) {
        try {
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id || null,
              razorpay_subscription_id: response.razorpay_subscription_id || null,
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
      }
    };

    // Inject either subscription ID or order ID parameters dynamically
    if (data.subscription_id) {
      options.subscription_id = data.subscription_id;
    } else {
      options.amount = data.amount;
      options.currency = data.currency;
      options.order_id = data.order_id;
    }

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
