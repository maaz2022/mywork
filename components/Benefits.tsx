'use client'

import { Button } from './ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card'
import { useRouter } from 'next/navigation'

export function Benefits() {
  const router = useRouter()

  const handlePlanSelection = (plan: 'free' | 'premium') => {
    // Store the selected plan in localStorage
    localStorage.setItem('selectedPlan', plan)
    // Navigate to signup
    router.push('/signup')
  }

  return (
    <section id="benefits" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Premium Card */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Premium Reseller</CardTitle>
              <p className="text-3xl font-bold">£49.99</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Unbranded brochure (PDF)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Product catalogue
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Online + printable order forms
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handlePlanSelection('premium')}
              >
                Join as Premium
              </Button>
            </CardFooter>
          </Card>

          {/* Free Card */}
          <Card>
            <CardHeader>
              <CardTitle>Free Reseller</CardTitle>
              <p className="text-3xl font-bold">£0</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  View reseller-only products
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  Place orders online
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={() => handlePlanSelection('free')}
              >
                Join for Free
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  )
}