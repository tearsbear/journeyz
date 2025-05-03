"use client";

import { Button } from "@/components/ui/button";
import { LoadingDialog } from "../ui/LoadingDialog";
import { BottomSheet } from "../ui/BottomSheet";
import Image from "next/image";
import { useState, useEffect } from "react";

interface WelcomeProps {
  onStart: () => void;
}

const LOCAL_STORAGE_NAME_KEY = "journeyz_user_name";

export function Welcome({ onStart }: WelcomeProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Load name from localStorage on component mount
  useEffect(() => {
    const savedName = localStorage.getItem(LOCAL_STORAGE_NAME_KEY);
    if (savedName) {
      setName(savedName);
    }
  }, []);

  // Save name to localStorage whenever it changes
  useEffect(() => {
    if (name.trim()) {
      localStorage.setItem(LOCAL_STORAGE_NAME_KEY, name.trim());
    }
  }, [name]);

  useEffect(() => {
    // Open bottom sheet automatically after a short delay
    const timer = setTimeout(() => {
      setIsBottomSheetOpen(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    setIsLoading(true);
    setTimeout(() => {
      onStart();
      setIsLoading(false);
    }, 3200);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const actions = [
    {
      icon: "/assets/export.svg",
      title: "Upload Image",
      description:
        "Share your favorite photos from your camera roll and add them to the album in seconds.",
    },
    {
      icon: "/assets/favorite.svg",
      title: "View Recent Uploads",
      description:
        "Take a quick look at the latest photos shared by you and others in your album.",
    },
    {
      icon: "/assets/camera.svg",
      title: "Try Photo Booth",
      description:
        "Snap fun, spontaneous pics with our built-in photo booth — perfect for capturing the vibe in the moment.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-black w-full overflow-x-hidden">
      {/* Background Image */}
      <div className="absolute w-[780px] h-screen left-1/2 -translate-x-1/2 top-0">
        <Image
          src="/assets/bg.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md mx-auto text-center pt-10">
        <h1 className="text-[15px] font-montserrat font-light mb-4 text-white tracking-widest">
          WELCOME TO <br /> OUR ENGAGEMENT
        </h1>

        <div className="mb-0 -mt-10 relative h-[300px] w-[300px] mx-auto">
          <Image
            src="/assets/love.svg"
            alt="Love icon"
            fill
            className="animate-[float_3s_ease-in-out_infinite]"
            priority
          />
        </div>

        <p className="font-inter font-light text-white mb-8 max-w-md mx-auto -mt-8">
          04/05/2025
        </p>

        {/* Input form section */}
        <div className="space-y-2 mt-10">
          <h2 className="text-white font-montserrat font-semibold text-xl">
            Please tell me your name
          </h2>

          <div className="px-6 py-4 z-20 relative">
            <input
              type="text"
              placeholder="type here...."
              className="w-full rounded-[10px] px-6 py-4 bg-white outline-none text-black placeholder:text-gray-400"
              value={name}
              onChange={handleNameChange}
            />
          </div>

          <div className="flex items-center justify-between mt-0 select-none">
            <div className="-ml-16 relative w-full h-[450px] -mt-34 select-none">
              {" "}
              {/* Container for the kid image */}
              <Image
                src="/assets/hb1.png"
                alt="Pointing kid"
                fill
                className="object-cover"
              />
            </div>
            <div className="mr-7 mt-10">
              <Button
                onClick={handleStart}
                size="lg"
                className="bg-white inter-font cursor-pointer text-[#3B75C2] hover:bg-white/90 font-semibold rounded-[30px] px-10 py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!name.trim()}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Dialog */}
      <LoadingDialog
        isOpen={isLoading}
        gifSrc="/assets/hb2.webp"
        message="please wait a second..."
      />

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        title="Capture the Moment!"
        actions={actions}
        primaryButtonText="Let's Go"
        onPrimaryButtonClick={() => setIsBottomSheetOpen(false)}
      />
    </div>
  );
}
