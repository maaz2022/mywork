"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "./components/mode-toggle";
import { Benefits } from "./components/Benefits";
import { ArrowRight, Shield, Zap, Users, BarChart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Loader2 } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleNavigation = (path: string) => {
    setIsNavigating(true);
    router.push(path);
  };

  const scrollToPlans = () => {
    const benefitsSection = document.querySelector('[data-section="benefits"]');
    if (benefitsSection) {
      benefitsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const stats = [
    { number: "500+", label: "Active Resellers", icon: Users },
    { number: "98%", label: "Success Rate", icon: BarChart },
    { number: "24/7", label: "Support", icon: Shield },
    { number: "10k+", label: "Orders", icon: Zap },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ModeToggle />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-32">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <Image
                src="/logo2.jpeg"
                alt="Logo"
                width={200}
                height={200}
                className="shadow-lg transform rounded-full hover:scale-105 transition-transform duration-300 relative z-10"
              />
            </div>
          </div>
          <h1 className={`text-6xl font-bold text-purple-600 dark:text-purple-400 mb-6 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Welcome to Reseller Portal
          </h1>
          <p className={`text-xl text-muted-foreground mb-8 max-w-2xl mx-auto transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            Your one-stop solution for premium reselling services. Join our community of successful resellers and grow your business today.
          </p>
          <div className={`flex justify-center gap-4 transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Button
              onClick={scrollToPlans}
              size="lg"
              className="group bg-purple-600 hover:bg-purple-700 text-white"
              disabled={isNavigating}
            >
              {isNavigating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
            <Button
              onClick={() => handleNavigation('/login')}
              variant="outline"
              size="lg"
              className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950"
              disabled={isNavigating}
            >
              {isNavigating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="relative mb-32">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-3xl transform -skew-y-3"></div>
          <div className={`relative grid grid-cols-2 md:grid-cols-4 gap-8 p-8 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {stats.map((stat, index) => (
              <Card
                key={stat.label}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg transform hover:scale-105 transition-all duration-300 border-purple-100 dark:border-purple-900"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-center mb-4">
                    <stat.icon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">{stat.number}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="relative mb-32">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 rounded-3xl transform rotate-1"></div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
            {[
              {
                title: "Premium Services",
                description: "Access exclusive premium services and features",
                icon: "✨"
              },
              {
                title: "Easy Management",
                description: "Manage your reselling business with ease",
                icon: "📊"
              },
              {
                title: "24/7 Support",
                description: "Get help whenever you need it",
                icon: "🛟"
              }
            ].map((feature, index) => (
              <Card
                key={index}
                className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg transform transition-all duration-1000 delay-${(index + 1) * 200} hover:scale-105 hover:shadow-xl border-purple-100 dark:border-purple-900 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
              >
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle className="text-purple-600 dark:text-purple-400">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div data-section="benefits" className={`transform transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Benefits />
        </div>

        {/* CTA Section */}
        <div className={`relative mt-32 mb-20 transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-purple-100 dark:border-purple-900">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl text-purple-600 dark:text-purple-400">Ready to Start Your Journey?</CardTitle>
              <CardDescription className="text-xl mt-4">
                Join our community of successful resellers and take your business to the next level.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={scrollToPlans}
                size="lg"
                className="group bg-purple-600 hover:bg-purple-700 text-white"
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-purple-100 dark:border-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">About Us</h3>
              <p className="text-muted-foreground">
                Your trusted partner in reselling success. We provide the tools and support you need to grow your business.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Home</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">Contact</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>support@resellerportal.com</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+44 123 456 7890</span>
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>London, UK</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-purple-100 dark:border-purple-900 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Reseller Portal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
