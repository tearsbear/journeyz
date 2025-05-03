import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ImagePopupProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  caption: string;
  date?: string;
  message?: string;
}

export function ImagePopup({
  isOpen,
  onClose,
  imageUrl,
  caption,
  date = "04/05/2025 - 09:50",
  message = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the",
}: ImagePopupProps) {
  const [imageLoading, setImageLoading] = useState(true);

  const handleOpenImageInNewTab = () => {
    try {
      // Open the image URL in a new tab
      window.open(imageUrl, "_blank");
    } catch (error) {
      console.error("Error opening image in new tab:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 bg-black z-50 flex flex-col"
        >
          {/* Fixed Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between px-6 py-4 bg-black"
          >
            <button onClick={onClose} className="w-8 h-8 relative">
              <Image
                src="/assets/close.svg"
                alt="Close"
                fill
                className="object-contain"
              />
            </button>
            <button
              className="text-[#3B75C2] text-lg font-semibold inter-font"
              onClick={handleOpenImageInNewTab}
            >
              Open Image
            </button>
          </motion.div>

          {/* Scrollable Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex-1 overflow-y-auto"
          >
            <div className="px-4 pb-8">
              {/* Image Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden"
              >
                {/* Skeleton */}
                {imageLoading && (
                  <div className="absolute inset-0 bg-white/10 animate-pulse" />
                )}

                {/* Image */}
                <Image
                  src={imageUrl}
                  alt={caption}
                  fill
                  className="object-cover"
                  onLoadingComplete={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              </motion.div>

              {/* Caption and Date */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-center mb-8"
              >
                <p className="text-white/80 font-write text-lg mb-1">
                  Captured by {caption}
                </p>
                <p className="text-white/60 font-write text-base">{date}</p>
              </motion.div>

              {/* Message Section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <h3 className="text-[#979797] text-[13px] mb-2 inter-font">
                  Message
                </h3>
                <p className="text-white text-[13px] leading-relaxed inter-font">
                  {message}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
