"use client";
import { useEffect, useState, Suspense } from "react";
import { useParams, notFound } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import ProductGallery from "@/app/components/ProductGallery";
import CartDrawer from "@/app/components/CartDrawer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/app/context/CartContext";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

function ProductPageContent() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const { userRole } = useAuth();

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      setLoading(true);
      const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/products/${id}`);
      if (!res.ok) {
        setProduct(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setProduct(data);
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navbar onCartClick={() => setCartOpen(true)} />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <div className="flex justify-center items-center py-12">
          <div className="w-full max-w-4xl bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-800 p-8 flex flex-col md:flex-row gap-10 animate-pulse">
            {/* Gallery Skeleton */}
            <div className="w-full md:w-1/2 flex flex-col items-center">
              <div className="relative aspect-square w-full max-w-md rounded-2xl overflow-hidden border border-purple-100 dark:border-purple-800 bg-gray-200 dark:bg-gray-800 mb-4 shadow-lg" />
              <div className="flex gap-3 flex-wrap justify-center mt-2">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="w-16 h-16 rounded-xl bg-gray-200 dark:bg-gray-800" />
                ))}
              </div>
            </div>
            {/* Info Skeleton */}
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <div className="h-8 w-2/3 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-24 w-full bg-gray-200 dark:bg-gray-800 rounded mb-4" />
              <div className="h-12 w-1/2 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return notFound();

  // Calculate discount
  let discountPercent = 0;
  if (userRole === 'premium') discountPercent = 30;
  else if (userRole === 'free') discountPercent = 10;
  const price = parseFloat(product.price);
  const discountedPrice = (price * (1 - discountPercent / 100)).toFixed(2);
  const hasDiscount = discountPercent > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar onCartClick={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <div className="flex justify-center items-center py-12">
        <div className="w-full max-w-4xl bg-white/90 dark:bg-gray-900/90 rounded-3xl shadow-2xl border border-purple-100 dark:border-purple-800 p-8 flex flex-col md:flex-row gap-10">
          <ProductGallery images={product.images} name={product.name} productId={product.id} />
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-200 mb-4">{product.name}</h1>
            <div className="text-lg font-bold mb-4 flex items-center gap-2">
              {hasDiscount && (
                <span className="line-through text-gray-400 text-base">£{product.price}</span>
              )}
              <span className="text-green-600 dark:text-green-400">£{discountedPrice}</span>
              {hasDiscount && (
                <span className="ml-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">{discountPercent}% OFF</span>
              )}
            </div>
            <div className="prose dark:prose-invert max-w-none mb-6" dangerouslySetInnerHTML={{ __html: product.description }} />
            <Button
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
              onClick={() => addToCart({
                id: product.id,
                name: product.name,
                price: discountedPrice,
                image: product.images[0]?.src || '/placeholder.png',
              })}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center py-12">
        <p className="text-purple-700 dark:text-purple-200">Return to <Link href="/dashboard" className="text-purple-700 dark:text-purple-200">Dashboard</Link></p>
      </div>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductPageContent />
    </Suspense>
  );
} 