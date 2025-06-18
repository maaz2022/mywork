"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: string;
  images: { src: string }[];
  short_description: string;
  attributes: { name: string; options: string[] }[];
}

interface ProductGridProps {
  discountPercent?: number;
}

export default function ProductGrid({ discountPercent = 0 }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [hoveredImage, setHoveredImage] = useState<{ [id: number]: string }>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || "Error fetching products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-8 mx-auto">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="border-2 border-purple-100 dark:border-purple-800 rounded-3xl overflow-hidden shadow-lg bg-gradient-to-br from-white via-purple-50 to-blue-100 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950 animate-pulse">
              <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-800" />
              <div className="p-6">
                <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-800 rounded mb-3" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded mb-2" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
                <div className="flex justify-between items-center mt-4">
                  <div className="h-6 w-1/4 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (error) {
    return <div className="text-center text-red-500 py-12">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {products.map((product) => {
        const colorAttr = product.attributes.find(attr => attr.name.toLowerCase() === "color");
        const mainImage = hoveredImage[product.id] || product.images[0]?.src || '/placeholder.png';
        const price = parseFloat(product.price);
        const hasDiscount = discountPercent > 0;
        const discountedPrice = hasDiscount ? (price * (1 - discountPercent / 100)).toFixed(2) : product.price;
        return (
          <Link key={product.id} href={`/product/${product.id}`} className="block group">
            <div
              className="relative border-2 border-purple-200 dark:border-purple-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-gradient-to-br from-white via-purple-50 to-blue-100 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950 group transform hover:scale-105 hover:border-purple-500 hover:ring-4 hover:ring-purple-200/40 dark:hover:ring-purple-800/40"
            >
              {/* Discount Tag */}
              {hasDiscount && (
                <span className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
                  {discountPercent}% OFF
                </span>
              )}
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={mainImage}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ zIndex: 1 }}
                />
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2 text-purple-700 dark:text-purple-300 group-hover:text-purple-900 dark:group-hover:text-purple-100 transition-colors">{product.name}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: product.short_description }} />
                {colorAttr && colorAttr.options.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Color:</span>
                    {colorAttr.options.map((color, idx) => {
                      const colorImage = product.images[(idx + 1) % product.images.length]?.src;
                      return (
                        <span
                          key={product.id + '-' + color}
                          className="inline-block w-6 h-6 rounded-full border-2 border-gray-300 cursor-pointer ring-2 ring-transparent hover:ring-purple-500 transition-all"
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                          onMouseEnter={() => setHoveredImage(prev => ({ ...prev, [product.id]: colorImage || mainImage }))}
                          onMouseLeave={() => setHoveredImage(prev => { const copy = { ...prev }; delete copy[product.id]; return copy; })}
                        />
                      );
                    })}
                  </div>
                )}
                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                    {hasDiscount && (
                      <span className="line-through text-gray-400 text-base mr-2">£{product.price}</span>
                    )}
                    £{discountedPrice}
                  </span>
                  <span
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow-md hover:from-purple-700 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer select-none"
                  >
                    View Details
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
} 