"use client";

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import { useAuth } from '@/app/context/AuthContext'
import Cookies from 'js-cookie'
import Link from 'next/link';


export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userRole } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const hasRedirected = useRef(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (hasRedirected.current) return
    setLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )

      if (userCredential.user) {
        // Set auth-token cookie
        const idToken = await userCredential.user.getIdToken()
        Cookies.set('auth-token', idToken, { 
          expires: 7, // Cookie expires in 7 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        
        toast.success('Login successful!')
        
        try {
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const fromParam = searchParams.get('from')
            
            // If there's a 'from' parameter and it's a dashboard path, use it
            if (fromParam && ['/dashboard', '/premium-dashboard'].includes(fromParam)) {
              console.log('Redirecting to:', fromParam)
              hasRedirected.current = true
              setTimeout(() => {
                router.replace(fromParam)
              }, 100)
            } else {
              // Otherwise, redirect based on user role
              const redirectPath = userData.role === 'premium' ? '/premium-dashboard' : '/dashboard'
              console.log('Redirecting to:', redirectPath)
              hasRedirected.current = true
              setTimeout(() => {
                router.replace(redirectPath)
              }, 100)
            }
          } else {
            toast.error('User data not found')
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          toast.error('Error fetching user data')
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      let errorMessage = 'Failed to log in'
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address'
          break
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled'
          break
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email'
          break
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password'
          break
        default:
          errorMessage = error.message || 'Failed to log in'
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

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
          <Link  href="/" className="flex justify-center mb-4">
            <Image
              src="/logo.jpeg"
              alt="Logo"
              width={150}
              height={150}
              className="rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300"
            />
          </Link>
          <h2 className="text-4xl font-bold text-purple-600 mb-2 animate-fade-in">Welcome Back</h2>
          <p className="text-muted-foreground text-lg animate-fade-in animation-delay-200">Sign in to your account</p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-xl border border-purple-100 dark:border-purple-900 p-8 backdrop-blur-lg transform hover:scale-[1.01] transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => window.location.href = '/signup'}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}