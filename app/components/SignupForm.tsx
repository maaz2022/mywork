"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import PhoneInput from "react-phone-input-2"; 
import "react-phone-input-2/lib/style.css";
import Image from "next/image";
import Link from "next/link";



export default function SignupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    userType: "individual",
    companyName: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if a plan was selected
    const selectedPlan = localStorage.getItem('selectedPlan');
    if (!selectedPlan) {
      toast.error('Please select a plan first');
      router.replace('/');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      phoneNumber: value,
    }));
  };

  const handleUserTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      userType: value,
      companyName: value === 'individual' ? '' : prev.companyName,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const selectedPlan = localStorage.getItem('selectedPlan') || 'free';
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        userType: formData.userType,
        companyName: formData.userType === 'company' ? formData.companyName : null,
        role: selectedPlan,
        createdAt: new Date().toISOString(),
      });

      localStorage.removeItem('selectedPlan');
      
      if (selectedPlan === 'premium') {
        // Store user data in localStorage for payment page
        localStorage.setItem('pendingPremiumUser', JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }));
        router.replace('/payment');
      } else {
        toast.success("Account created successfully! Please log in.");
        await auth.signOut();
        router.replace('/login');
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Link href="/" className="flex justify-center mb-4">
            <Image
              src="/logo.jpeg"
              alt="Logo"
              width={150}
              height={150}
              className="rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <h2 className="text-4xl font-bold text-purple-600 mb-2 animate-fade-in">Create Account</h2>
          <p className="text-muted-foreground text-lg animate-fade-in animation-delay-200">Join our community today</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-purple-100 dark:border-purple-900 p-8 backdrop-blur-lg transform hover:scale-[1.01] transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-purple-600">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="first name"
                  className="h-10 focus:border-purple-500 focus:ring-purple-500 bg-white dark:bg-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-purple-600">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="last name"
                  className="h-10 focus:border-purple-500 focus:ring-purple-500 bg-white dark:bg-gray-700"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-purple-600">User Type</Label>
              <RadioGroup
                value={formData.userType}
                onValueChange={handleUserTypeChange}
                className="flex gap-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" className="text-purple-600" />
                  <Label htmlFor="individual" className="cursor-pointer font-medium">Individual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="company" id="company" className="text-purple-600" />
                  <Label htmlFor="company" className="cursor-pointer font-medium">Company</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.userType === 'company' && (
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-purple-600">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter your company name"
                  className="h-10 focus:border-purple-500 focus:ring-purple-500 bg-white dark:bg-gray-700"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium text-purple-600">Phone Number</Label>
              <PhoneInput 
                country={'gb'}
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                inputClass="h-10 w-full rounded-md border border-input bg-background dark:bg-gray-800 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                buttonClass="border-input bg-background dark:bg-gray-800"
                containerClass="phone-input-container"
                dropdownClass="phone-dropdown"
                searchClass="phone-search"
                enableSearch={true}
                searchPlaceholder="Search country..."
                inputProps={{
                  name: 'phoneNumber', 
                  required: true,
                  placeholder: 'Enter your phone number'
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-purple-600">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="h-10 focus:border-purple-500 focus:ring-purple-500 bg-white dark:bg-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-purple-600">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="h-10 focus:border-purple-500 focus:ring-purple-500 bg-white dark:bg-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-purple-600">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className="h-10 focus:border-purple-500 focus:ring-purple-500 bg-white dark:bg-gray-700"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg" 
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        .phone-input-container {
          width: 100% !important;
        }
        .phone-input-container .form-control {
          background-color: var(--background) !important;
          color: var(--foreground) !important;
          border: 1px solid var(--border) !important;
          border-radius: 0.5rem !important;
          box-shadow: none !important;
        }
        .dark .phone-input-container .form-control {
          background-color: #23272f !important;
          color: #f3f4f6 !important;
          border: 1px solid #4b5563 !important;
        }
        .phone-dropdown {
          background-color: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        .dark .phone-dropdown {
          background-color: #23272f !important;
          color: #f3f4f6 !important;
          border-color: #4b5563 !important;
        }
        .phone-search {
          background-color: var(--background);
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          padding: 0.5rem;
          margin: 0.5rem;
          width: calc(100% - 1rem);
        }
        .dark .phone-search {
          background-color: #23272f !important;
          color: #f3f4f6 !important;
          border-color: #4b5563 !important;
        }
        .country-list {
          background-color: var(--background) !important;
          color: var(--foreground) !important;
        }
        .dark .country-list {
          background-color: #23272f !important;
          color: #f3f4f6 !important;
        }
        .country {
          color: var(--foreground) !important;
        }
        .dark .country {
          color: #f3f4f6 !important;
        }
        .country:hover {
          background-color: var(--accent) !important;
        }
        .dark .country:hover {
          background-color: #4f46e5 !important;
        }
        .selected-flag {
          border-radius: 0.375rem 0 0 0.375rem !important;
          background-color: var(--background) !important;
        }
        .dark .selected-flag {
          background-color: #23272f !important;
        }
        .selected-flag:hover, .selected-flag:focus {
          background-color: var(--accent) !important;
        }
        .dark .selected-flag:hover, .dark .selected-flag:focus {
          background-color: #4f46e5 !important;
        }
        .country-list .country.highlight {
          background-color: var(--accent) !important;
        }
        .country-list .country.selected {
          background-color: var(--accent) !important;
        }
        .dark .country-list .country.highlight,
        .dark .country-list .country.selected {
          background-color: #4f46e5 !important;
        }
      `}</style>
    </div>
  );
}