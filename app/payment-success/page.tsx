"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (hasRedirected) return;

    const payment_intent = searchParams.get("payment_intent");
    const payment_intent_client_secret = searchParams.get("payment_intent_client_secret");
    const redirect_status = searchParams.get("redirect_status");

    console.log("Payment success params:", {
      payment_intent,
      payment_intent_client_secret,
      redirect_status
    });

    if (!payment_intent || !payment_intent_client_secret || !redirect_status) {
      setErrorMessage("Missing payment information");
      setVerificationStatus('failed');
      router.replace("/");
      return;
    }

    const verifyAndUpdateUserRole = async () => {
      if (!user) {
        setErrorMessage("User not authenticated");
        setVerificationStatus('failed');
        router.replace("/login");
        return;
      }

      try {
        // First verify the payment with Stripe
        const response = await fetch("/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_intent,
            payment_intent_client_secret,
          }),
        });

        const verificationData = await response.json();
        console.log("Verification response:", verificationData);

        if (!verificationData.verified) {
          setErrorMessage(verificationData.error || "Payment verification failed");
          setVerificationStatus('failed');
          toast.error(verificationData.error || "Payment verification failed. Please contact support.");
          return;
        }

        // Get current user data
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        console.log("Current user data:", userData);

        // Always update the payment status and intent ID
        const updateData = {
          role: "premium",
          paymentStatus: "completed",
          paymentDate: new Date().toISOString(),
          paymentIntentId: payment_intent,
          lastPaymentVerification: new Date().toISOString(),
        };
        console.log("Updating user with data:", updateData);
        
        await updateDoc(doc(db, "users", user.uid), updateData);
        
        // Verify the update was successful
        const updatedUserDoc = await getDoc(doc(db, "users", user.uid));
        const updatedUserData = updatedUserDoc.data();
        console.log("Updated user data:", updatedUserData);

        if (!updatedUserData || updatedUserData.role !== 'premium' || updatedUserData.paymentStatus !== 'completed') {
          throw new Error("Failed to update user role and payment status");
        }

        setVerificationStatus('success');
        toast.success("Payment verified successfully! Welcome to premium!");
        
        // Set hasRedirected to true before redirecting
        setHasRedirected(true);
        
        // Wait for 2 seconds before redirecting to show success message
        setTimeout(() => {
          router.replace("/premium-dashboard");
        }, 2000);
      } catch (error: any) {
        console.error("Error verifying payment:", error);
        setErrorMessage(error.message || "Error verifying payment");
        setVerificationStatus('failed');
        toast.error("Error verifying payment. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    if (redirect_status === "succeeded") {
      verifyAndUpdateUserRole();
    } else {
      setErrorMessage("Payment was not successful");
      setVerificationStatus('failed');
      toast.error("Payment failed. Please try again.");
      setTimeout(() => {
        router.replace("/");
      }, 2000);
    }
  }, [user, router, searchParams, hasRedirected]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-center text-purple-600">Verifying Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Please wait while we verify your payment...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-center text-purple-600">
            {verificationStatus === 'success' ? 'Payment Successful!' : 'Payment Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            {verificationStatus === 'success' ? (
              <>
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <p className="text-muted-foreground mb-6">
                  Your payment has been verified successfully. Redirecting to premium dashboard...
                </p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-4">❌</div>
                <p className="text-muted-foreground mb-2">
                  There was an issue with your payment:
                </p>
                <p className="text-red-500 mb-6">{errorMessage}</p>
                <Button onClick={() => router.push("/")}>Return to Home</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 