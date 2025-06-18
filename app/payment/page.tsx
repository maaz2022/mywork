"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import StripePaymentForm from "../components/StripePaymentForm";

export default function PaymentPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Check if there's a pending premium user
    const pendingUser = localStorage.getItem('pendingPremiumUser');
    if (!pendingUser) {
      router.replace('/');
    }
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">Complete Your Premium Subscription</h1>
          <p className="text-muted-foreground text-lg">
            You're just one step away from accessing premium features
          </p>
        </div>
        <StripePaymentForm />
      </div>
    </div>
  );
} 