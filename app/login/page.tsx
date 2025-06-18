"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (userRole === "premium") {
        router.replace("/premium-dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, userRole, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
        <LoginForm />
    </div>
  );
}