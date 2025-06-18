import { Button } from './ui/button'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Start Your Reselling Journey Today
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Join our community of successful resellers and access exclusive products,
            better margins, and dedicated support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#benefits">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
