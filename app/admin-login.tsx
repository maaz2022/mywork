"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ADMIN_EMAIL = "admin@hackin.com";
const ADMIN_PASSWORD = "Super$ecretP@ssw0rd2024!"; // Change to your strong password

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (
        form.email.trim().toLowerCase() === ADMIN_EMAIL &&
        form.password === ADMIN_PASSWORD
      ) {
        localStorage.setItem("admin-auth", "true");
        router.replace("/admin");
      } else {
        setError("Invalid credentials");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md mx-auto bg-white/90 dark:bg-gray-900/90 border-2 border-transparent bg-clip-padding shadow-2xl rounded-2xl animate-in fade-in-0 zoom-in-95 duration-300" style={{ borderImage: 'linear-gradient(135deg, #a78bfa, #60a5fa) 1' }}>
        <CardHeader>
          <CardTitle className="text-center text-purple-600 dark:text-purple-300">Admin Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="mt-1"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                className="mt-1"
                autoComplete="current-password"
              />
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full h-11 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-200 shadow-lg" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 