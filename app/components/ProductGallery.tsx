"use client";
import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images, name, productId }: { images: any[]; name: string; productId: number }) {
  const [mainIdx, setMainIdx] = useState(0);
  return (
    <div className="w-full md:w-1/2 flex flex-col items-center">
      <div className="relative aspect-square w-full max-w-md rounded-2xl overflow-hidden border border-purple-100 dark:border-purple-800 bg-white dark:bg-gray-900 mb-4 shadow-lg">
        <Image src={images[mainIdx]?.src} alt={name} fill className="object-cover" />
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        {images.map((img, idx) => (
          <button
            key={productId + '-' + (img.id || idx)}
            className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 ${mainIdx === idx ? 'border-purple-500' : 'border-gray-200 dark:border-gray-700'} focus:outline-none`}
            onClick={() => setMainIdx(idx)}
            aria-label={`Show image ${idx + 1}`}
            type="button"
          >
            <Image src={img.src} alt={name} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
} 