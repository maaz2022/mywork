"use client";
import { useTheme } from "next-themes";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Sun, Moon, ShoppingCart, LogOut, Menu } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function Navbar({ onCartClick, showDownloadOption = false, onDownloadClick, showChangePasswordOption = false, isAdmin = false }: {
  onCartClick: () => void;
  showDownloadOption?: boolean;
  onDownloadClick?: () => void;
  showChangePasswordOption?: boolean;
  isAdmin?: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const { cart } = useCart();
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();
          if (userData) {
            setUserName(`${userData.firstName} ${userData.lastName}`);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserName();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const initials = userName
    ? userName.split(" ").map((n: string) => n[0]).join("")
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-30 w-full bg-white/70 dark:bg-gray-900/70 border-b border-purple-200 dark:border-purple-800 shadow-lg backdrop-blur-xl rounded-b-2xl">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-3">
          <Image src="/logo2.png" alt="Logo" width={30} height={30}/>
          <span className="text-xl font-bold text-purple-700 dark:text-purple-300">Reseller Portal</span>
        </Link>
        {isAdmin ? (
          <div className="flex items-center gap-8">
            <span className="text-xl font-semibold text-purple-700 dark:text-purple-200">Welcome Admin</span>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-purple-100 dark:bg-purple-800 hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-purple-700" />}
            </button>
            <button
              onClick={() => { localStorage.removeItem('admin-auth'); router.replace('/admin-login'); }}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-purple-600 text-white rounded-lg font-semibold shadow-md hover:from-red-600 hover:to-purple-700 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <span className="text-gray-700 dark:text-gray-200 font-medium">
                {user ? `Welcome, ${userName || 'Loading...'}` : "Welcome!"}
              </span>
              {showDownloadOption && (
                <button
                  onClick={onDownloadClick}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                  Download
                </button>
              )}
              <button
                onClick={() => router.push('/orders')}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
                Order History
              </button>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full bg-purple-100 dark:bg-purple-800 hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-purple-700" />}
              </button>
              <button
                onClick={onCartClick}
                className="relative p-2 rounded-full bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                aria-label="View cart"
              >
                <ShoppingCart className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold flex items-center justify-center shadow-md border-2 border-white dark:border-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400 ring-2 ring-purple-300 dark:ring-purple-800 hover:scale-105 transition-transform"
                  aria-label="User menu"
                >
                  {initials}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-2xl border border-purple-100 dark:border-purple-800 py-2 z-50 backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="px-4 py-2 border-b border-purple-100 dark:border-purple-800 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold flex items-center justify-center text-lg">{initials}</span>
                      <span className="font-semibold text-purple-700 dark:text-purple-200">{userName || user?.email}</span>
                    </div>
                    <div className="my-2 border-t border-purple-100 dark:border-purple-800" />
                    {showChangePasswordOption && (
                      <button
                        onClick={() => { setDropdownOpen(false); router.push('/change-password'); }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-left text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-800 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 0v2m0 4h.01" /></svg>
                        Change Password
                      </button>
                    )}
                    <div className="my-2 border-t border-purple-100 dark:border-purple-800" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-600 dark:text-red-400 hover:bg-purple-50 dark:hover:bg-purple-800 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Hamburger for Mobile: hide for admin */}
            <button
              className="md:hidden p-2 rounded-full bg-purple-100 dark:bg-purple-800 hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-7 h-7 text-purple-700 dark:text-purple-300" />
            </button>
            {/* Mobile Menu Sheet: hide for admin */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetContent side="left" className="max-w-xs w-full p-0 bg-white/80 dark:bg-gray-900/80 rounded-r-2xl shadow-2xl backdrop-blur-xl animate-in slide-in-from-left-8 duration-300 border-none">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 px-4 pt-4">
                    <Image src="/logo2.png" alt="Logo" width={30} height={30}/>
                    <span className="text-xl font-bold text-purple-700 dark:text-purple-300">Reseller Portal</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 mt-6 px-4">
                  {user && (
                    <span className="text-gray-700 dark:text-gray-200 font-medium mb-2">Welcome, {userName || 'Loading...'}</span>
                  )}
                  {showDownloadOption && (
                    <button
                      onClick={() => { setMobileMenuOpen(false); onDownloadClick && onDownloadClick(); }}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                      Download
                    </button>
                  )}
                  <button
                    onClick={() => { setMobileMenuOpen(false); router.push('/orders'); }}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
                    Order History
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); setTheme(theme === "dark" ? "light" : "dark"); }}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded-lg font-semibold hover:bg-purple-200 dark:hover:bg-purple-700 transition-all duration-200"
                  >
                    {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-purple-700" />}
                    Toggle Theme
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); onCartClick(); }}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition-all duration-200"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Cart
                    {cart.length > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    )}
                  </button>
                  <div className="my-2 border-t border-purple-100 dark:border-purple-800" />
                  <button
                    onClick={() => { setMobileMenuOpen(false); setDropdownOpen(true); }}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-lg font-bold shadow-md border-2 border-white dark:border-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {initials}
                    Profile
                  </button>
                  {showChangePasswordOption && (
                    <button
                      onClick={() => { setMobileMenuOpen(false); router.push('/change-password'); }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-purple-700 dark:text-purple-200 hover:bg-purple-50 dark:hover:bg-purple-800 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 0v2m0 4h.01" /></svg>
                      Change Password
                    </button>
                  )}
                  <div className="my-2 border-t border-purple-100 dark:border-purple-800" />
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-purple-50 dark:hover:bg-purple-800 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>
    </nav>
  );
} 