"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import SignupForm from "../components/SignupForm";

function SignupPageContent() {
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

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-lg">Loading...</div>
  //     </div>
  //   );
  // }

  return (
    <div >
        {/* <h1 className="text-2xl font-bold text-center mb-8">Create Account</h1> */}
        <SignupForm />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupPageContent />
    </Suspense>
  );
}