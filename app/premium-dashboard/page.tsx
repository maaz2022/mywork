"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { ShoppingBag, Download, Sun, Moon, ShoppingCart, KeyRound, LogOut } from "lucide-react";
import Image from "next/image";
import clsx from "clsx";
import { useTheme } from "next-themes";
import ProductGrid from "../components/ProductGrid";
import CartDrawer from "../components/CartDrawer";
import Navbar from "../components/Navbar";

export default function PremiumDashboard() {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    const verifyPremiumAccess = async () => {
      if (!loading && user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();

          // If user is not premium, redirect to home
          if (!userData || userData.role !== 'premium') {
            console.log("User is not premium, redirecting to home");
            router.replace("/");
            return;
          }

          // If payment status is not completed, redirect to payment
          if (!userData.paymentStatus || userData.paymentStatus !== 'completed') {
            console.log("Payment not completed, redirecting to payment");
            router.replace("/payment");
            return;
          }

          // Only verify payment intent if we have one
          if (userData.paymentIntentId) {
            const response = await fetch("/api/verify-payment-status", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentIntentId: userData.paymentIntentId,
              }),
            });

            const verificationData = await response.json();

            if (!verificationData.verified) {
              console.log("Payment verification failed:", verificationData.error);
              toast.error("Premium access verification failed. Please contact support.");
              router.replace("/");
              return;
            }
          }

          setVerifying(false);
        } catch (error) {
          console.error("Error verifying premium access:", error);
          toast.error("Error verifying premium access");
          router.replace("/");
      }
    }
    };

    verifyPremiumAccess();
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (loading || verifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-lg">Verifying premium access...</div>
        </div>
      </div>
    );
  }

  if (!user || userRole !== 'premium') {
    return null;
  }

  return (
    <>
      <Navbar
        onCartClick={() => setCartOpen(true)}
        showDownloadOption
        onDownloadClick={() => setShowDownload(true)}
        showChangePasswordOption
      />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {showDownload ? (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <h2 className="text-2xl font-bold mb-6 text-purple-600 dark:text-purple-300 text-center">Download Unbranded Brochure</h2>
              <a
                href="/Custom%20Kit%20Brochure2.pdf"
                download
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <Download className="mr-2" />
                Download PDF
              </a>
              <button
                className="mt-8 text-purple-600 underline hover:text-purple-800"
                onClick={() => setShowDownload(false)}
              >
                Back to Catalog
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-6 text-purple-600">Premium Product Catalog</h2>
              <ProductGrid discountPercent={30} />
              <div className="flex justify-center mt-10">
                <button
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  onClick={() => setShowDownload(true)}
                >
                  <Download className="mr-2" />
                  Download Unbranded Brochure
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}