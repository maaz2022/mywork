"use client";

import Link from 'next/link'
import { useAuth } from "@/app/context/AuthContext";
import { Button } from './ui/button'
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function Navbar() {
  const { user, userRole } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            Reseller Portal
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" onClick={handleLogout}>
                  Logout
                </Button>
                <Button
                  onClick={() =>
                    router.push(
                      userRole === "premium"
                        ? "/premium-dashboard"
                        : "/dashboard"
                    )
                  }
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}