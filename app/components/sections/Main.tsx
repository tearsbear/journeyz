"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MomentsTab } from "../tabs/MomentsTab";
import { CaptureTab } from "../tabs/CaptureTab";
import Image from "next/image";

export function Main() {
  const [activeTab, setActiveTab] = useState<"moments" | "capture">("moments");
  const [isAnyPopupOpen, setIsAnyPopupOpen] = useState(false);

  const handlePopupStateChange = (isOpen: boolean) => {
    setIsAnyPopupOpen(isOpen);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background Image */}
      <div className="fixed inset-0">
        <Image
          src="/assets/bg.png"
          alt="Background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-auto pb-25">
        <AnimatePresence mode="wait">
          {activeTab === "moments" ? (
            <motion.div
              key="moments"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <MomentsTab onPopupStateChange={handlePopupStateChange} />
            </motion.div>
          ) : (
            <motion.div
              key="capture"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <CaptureTab onPopupStateChange={handlePopupStateChange} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <AnimatePresence>
        {!isAnyPopupOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-transparent flex justify-center z-40"
          >
            <div className="bg-white rounded-full p-1 flex items-center w-[320px] shadow-[0_8px_32px_rgba(0,0,0,0.16)] backdrop-blur-sm">
              <div className="relative flex-1 flex">
                {/* Slider background */}
                <div
                  className="absolute inset-y-0 transition-all duration-300 ease-out bg-[#3B75C2] rounded-full shadow-[0_2px_8px_rgba(59,117,194,0.25)]"
                  style={{
                    width: "50%",
                    left: activeTab === "moments" ? "0%" : "50%",
                  }}
                />

                {/* Tabs */}
                <button
                  onClick={() => setActiveTab("moments")}
                  className={`flex-1 py-3 px-6 rounded-full relative z-10 transition-colors duration-300 font-medium text-[17px] ${
                    activeTab === "moments"
                      ? "text-white inter-font font-semibold"
                      : "text-[#75767B] inter-font font-regular"
                  }`}
                >
                  Moments
                </button>
                <button
                  onClick={() => setActiveTab("capture")}
                  className={`flex-1 py-3 px-6 rounded-full relative z-10 transition-colors duration-300 font-medium text-[17px] ${
                    activeTab === "capture"
                      ? "text-white inter-font font-semibold"
                      : "text-[#75767B] inter-font font-regular"
                  }`}
                >
                  Capture
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
