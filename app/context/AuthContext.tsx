"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  userRole: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.uid);
      setUser(user);

      if (user) {
        try {
          // Update auth-token cookie
          const idToken = await user.getIdToken()
          Cookies.set('auth-token', idToken, {
            expires: 7,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
          })

          // Get user role from Firestore with retry logic
          let retries = 3;
          while (retries > 0) {
            try {
              const userDoc = await getDoc(doc(db, "users", user.uid));
              const userData = userDoc.data();
              const role = userData?.role || "free";
              console.log("User role from Firestore:", role);
              setUserRole(role);
              break;
            } catch (error) {
              console.error("Error fetching user role:", error);
              retries--;
              if (retries === 0) {
                setUserRole("free"); // Default to free if all retries fail
              }
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            }
          }
        } catch (error) {
          console.error("Error in auth state change:", error);
          setUserRole("free"); // Default to free on error
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle route protection
  useEffect(() => {
    if (!loading && user && userRole && !hasRedirected.current) {
      console.log('Route protection check:', {
        hasUser: !!user,
        userRole,
        loading,
        currentPath: pathname,
        searchParams: searchParams.toString()
      });

      const isPublicPath = ['/login', '/signup', '/'].includes(pathname);
      const isDashboardPath = ['/dashboard', '/premium-dashboard'].includes(pathname);
      const fromParam = searchParams.get('from');

      if (user) {
        if (isPublicPath) {
          console.log('User is authenticated, redirecting to dashboard');
          hasRedirected.current = true;
          // If there's a 'from' parameter and it's a dashboard path, use it
          if (fromParam && isDashboardPath) {
            console.log('Redirecting to:', fromParam);
            setTimeout(() => {
              router.replace(fromParam);
            }, 100);
          } else {
            const redirectPath = userRole === 'premium' ? '/premium-dashboard' : '/dashboard';
            console.log('Redirecting to:', redirectPath);
            setTimeout(() => {
              router.replace(redirectPath);
            }, 100);
          }
        } else if (isDashboardPath) {
          // Ensure user is on the correct dashboard
          if (userRole === 'premium' && pathname !== '/premium-dashboard') {
            console.log('Redirecting to premium dashboard');
            hasRedirected.current = true;
            setTimeout(() => {
              router.replace('/premium-dashboard');
            }, 100);
          } else if (userRole !== 'premium' && pathname !== '/dashboard') {
            console.log('Redirecting to regular dashboard');
            hasRedirected.current = true;
            setTimeout(() => {
              router.replace('/dashboard');
            }, 100);
          }
        }
      } else if (!isPublicPath) {
        console.log('No user found, redirecting to login');
        hasRedirected.current = true;
        // Preserve the current path as the 'from' parameter
        const redirectUrl = `/login?from=${encodeURIComponent(pathname)}`;
        setTimeout(() => {
          router.replace(redirectUrl);
        }, 100);
      }
    }
  }, [user, loading, userRole, pathname, searchParams, router]);

  return (
    <AuthContext.Provider value={{ user, loading, userRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);