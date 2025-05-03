import Image from "next/image";
import { useEffect, useState } from "react";

interface LoadingDialogProps {
  isOpen: boolean;
  gifSrc: string;
  message: string;
}

export function LoadingDialog({ isOpen, gifSrc, message }: LoadingDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 500); // Increased duration for smoother exit
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/82 transition-opacity duration-500 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Dialog Content */}
      <div
        className={`bg-white rounded-lg p-6 max-w-sm w-full mx-4 relative z-10 
          transition-all duration-500 ease-out transform
          ${
            isOpen
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-8 scale-95"
          }`}
      >
        <div className="relative w-full h-48 mb-4">
          <Image
            src={gifSrc}
            alt="Loading animation"
            fill
            unoptimized
            className="object-contain"
          />
        </div>
        <p className="text-[#3B75C2] text-center text-lg montserrat-font font-semibold">
          {message}
        </p>
      </div>
    </div>
  );
}
