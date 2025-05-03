import Image from "next/image";
import { useEffect, useState } from "react";

interface ActionItem {
  icon: string;
  title: string;
  description: string;
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  actions: ActionItem[];
  primaryButtonText: string;
  onPrimaryButtonClick: () => void;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  actions,
  primaryButtonText,
  onPrimaryButtonClick,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Toggle body scroll
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Start animation in the next frame
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      // Unmount after animation completes
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`absolute bottom-3 mx-2 left-0 right-0 bg-white rounded-[32px] transition-all duration-300 ease-out transform
          ${isAnimating ? "translate-y-0" : "translate-y-full"}`}
        style={{
          willChange: "transform",
          transformOrigin: "bottom",
        }}
      >
        <div className="p-8 overflow-auto max-h-[85vh]">
          <h2 className="text-[#3B75C2] text-2xl font-semibold mb-8">
            {title}
          </h2>

          <div className="space-y-6">
            {actions.map((action, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-8 h-8 relative flex-shrink-0">
                  <Image
                    src={action.icon}
                    alt={action.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-[#3B75C2] text-lg font-semibold mb-1">
                    {action.title}
                  </h3>
                  <p className="text-gray-500 text-base">
                    {action.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onPrimaryButtonClick}
            className="w-full bg-[#3B75C2] text-white rounded-full py-4 mt-8 font-semibold text-lg hover:bg-[#3B75C2]/90 transition-colors"
          >
            {primaryButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
