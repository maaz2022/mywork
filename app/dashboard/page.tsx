"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import ProductGrid from "../components/ProductGrid";
import Navbar from "../components/Navbar";
import CartDrawer from "../components/CartDrawer";

function DashboardContent() {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('No user found, redirecting to login');
        router.replace('/login');
      } else if (userRole === 'premium') {
        console.log('User is premium, redirecting to premium dashboard');
        router.replace('/premium-dashboard');
      }
    }
  }, [user, loading, userRole, router]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || userRole === 'premium') {
    return null; // Don't render anything while redirecting
  }

  return (
    <>
      <Navbar onCartClick={() => setCartOpen(true)} showChangePasswordOption />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-6 text-purple-600">Product Catalog</h2>
            <ProductGrid discountPercent={10} />
          </div>
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}