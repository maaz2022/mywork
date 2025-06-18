"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle2, Star } from "lucide-react";

export function Benefits() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById("benefits-section");
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const handlePlanSelection = (plan: 'free' | 'premium') => {
    localStorage.setItem('selectedPlan', plan);
    router.push('/signup');
  };

  return (
    <section id="benefits-section" className="py-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold text-purple-600 mb-4">Choose Your Plan</h2>
        <p className="text-xl text-muted-foreground">Select the perfect plan for your business</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Premium Card */}
        <div
          className={`transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-purple-200 dark:border-purple-800 hover:scale-105 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-600 text-white px-4 py-1 rounded-bl-lg text-sm font-medium flex items-center gap-1">
              <Star className="w-4 h-4" />
              Popular
            </div>
            <CardHeader className="pt-8">
              <CardTitle className="text-2xl font-bold text-purple-600">Premium Reseller</CardTitle>
              <div className="mt-2">
                <p className="text-4xl font-bold">£49.99</p>
                <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Unbranded brochure (PDF)</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Product catalogue</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Online + printable order forms</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Priority support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-6">
              <Button 
                className="w-full h-12 text-lg font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg" 
                onClick={() => handlePlanSelection('premium')}
              >
                Join as Premium
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Free Card */}
        <div
          className={`transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{ transitionDelay: '400ms' }}
        >
          <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg hover:scale-105 transition-all duration-300">
            <CardHeader className="pt-8">
              <CardTitle className="text-2xl font-bold text-purple-600">Free Reseller</CardTitle>
              <div className="mt-2">
                <p className="text-4xl font-bold">£0</p>
                <p className="text-sm text-muted-foreground mt-1">No payment required</p>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">View reseller-only products</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Place orders online</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Basic support</span>
                </li>
                <li className="flex items-start space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">Standard delivery</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-6">
              <Button 
                variant="outline"
                className="w-full h-12 text-lg font-medium border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg" 
                onClick={() => handlePlanSelection('free')}
              >
                Join for Free
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
} 