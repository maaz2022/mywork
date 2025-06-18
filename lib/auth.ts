'use client';

// Add token to all fetch requests
export function addAuthTokenToRequest(request: Request): Request {
  if (typeof window === 'undefined') return request;
  
  const token = localStorage.getItem('firebase-token')
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`)
  }
  return request
}

// Only run in browser environment
if (typeof window !== 'undefined') {
  // Intercept fetch requests to add auth token
  const originalFetch = window.fetch
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    if (typeof input === 'string') {
      input = new Request(input, init)
    }
    return originalFetch(addAuthTokenToRequest(input as Request), init)
  }
} 