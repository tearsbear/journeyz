import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingDialog } from "./LoadingDialog";
import { toast } from "sonner";

interface PhotoboothPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessfulUpload?: () => void;
  onPopupStateChange: (isOpen: boolean) => void;
}

type Filter = "none" | "b&w" | "polaroid";

interface CapturedImage {
  dataUrl: string;
  filter: Filter;
}

export function PhotoboothPopup({
  isOpen,
  onClose,
  onSuccessfulUpload,
  onPopupStateChange,
}: PhotoboothPopupProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [selectedFilter, setSelectedFilter] = useState<Filter>("none");
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreatingCollage, setIsCreatingCollage] = useState(false);
  const [showCollagePreview, setShowCollagePreview] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Apply filter to canvas context
  const applyFilter = useCallback(
    (context: CanvasRenderingContext2D, filter: Filter) => {
      console.log("Applying filter:", filter);
      try {
        if (filter === "b&w") {
          const imageData = context.getImageData(
            0,
            0,
            context.canvas.width,
            context.canvas.height
          );
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
          }
          context.putImageData(imageData, 0, 0);
        } else if (filter === "polaroid") {
          context.globalCompositeOperation = "multiply";
          context.fillStyle = "rgba(255, 243, 220, 0.4)";
          context.fillRect(0, 0, context.canvas.width, context.canvas.height);
          context.globalCompositeOperation = "source-over";
        }
      } catch (error) {
        console.error("Error applying filter:", error);
      }
    },
    []
  );

  // Draw video frame with filter
  const drawVideoFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = previewCanvasRef.current;

    if (!video || !canvas || showCollagePreview || video.readyState < 2) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    // Set canvas size to match video
    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Clear previous frame and reset composite operation
    context.globalCompositeOperation = "source-over";
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw current frame
    context.drawImage(video, 0, 0);

    // Apply filter if not "none"
    if (selectedFilter !== "none") {
      applyFilter(context, selectedFilter);
    }

    // Request next frame only if we're still showing camera
    if (!showCollagePreview) {
      animationFrameRef.current = requestAnimationFrame(drawVideoFrame);
    }
  }, [selectedFilter, showCollagePreview, applyFilter]);

  // Effect to handle filter changes
  useEffect(() => {
    if (!isCameraReady || showCollagePreview) return;

    // Cancel existing animation frame if any
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }

    // Start new drawing loop
    drawVideoFrame();

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [selectedFilter, isCameraReady, showCollagePreview, drawVideoFrame]);

  // Effect for handling video stream and filter application
  useEffect(() => {
    if (!isOpen) return;

    let animationFrameId: number;
    let stream: MediaStream | null = null;

    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });

        if (videoRef.current && canvasRef.current) {
          videoRef.current.srcObject = stream;
          const ctx = canvasRef.current.getContext("2d");

          const drawFrame = () => {
            if (!videoRef.current || !canvasRef.current || !ctx) return;

            // Match canvas size to video
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;

            // Clear previous frame
            ctx.clearRect(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );

            // Reset composite operation
            ctx.globalCompositeOperation = "source-over";

            // Draw video frame
            ctx.drawImage(videoRef.current, 0, 0);

            // Apply selected filter
            if (selectedFilter === "b&w") {
              ctx.filter = "grayscale(100%)";
              ctx.drawImage(canvasRef.current, 0, 0);
              ctx.filter = "none";
            } else if (selectedFilter === "polaroid") {
              ctx.filter = "contrast(120%) saturate(90%) brightness(110%)";
              ctx.drawImage(canvasRef.current, 0, 0);
              ctx.filter = "none";
            }

            // Request next frame
            animationFrameId = requestAnimationFrame(drawFrame);
          };

          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              setIsCameraReady(true);
              drawFrame();
            });
          };
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        toast.error(
          "Failed to access camera. Please ensure camera permissions are granted."
        );
      }
    };

    initCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setIsCameraReady(false);
    };
  }, [isOpen, selectedFilter]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    setIsCameraReady(false);
    setShowCollagePreview(false);
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Create final collage
  const createCollage = useCallback(
    async (shouldUpload: boolean = false) => {
      if (capturedImages.length !== 3 || !canvasRef.current) {
        console.error("Invalid state for collage creation:", {
          imageCount: capturedImages.length,
          hasCanvas: !!canvasRef.current,
        });
        return;
      }

      setIsProcessing(true);
      setIsCreatingCollage(true);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) {
        console.error("Failed to get canvas context");
        setIsProcessing(false);
        setIsCreatingCollage(false);
        return;
      }

      try {
        // Set fixed dimensions for the collage with padding for logos
        const width = 900;
        const height = 1200;

        // Initialize main canvas
        canvas.width = width;
        canvas.height = height;

        // Initialize preview canvas
        if (!previewCanvasRef.current) {
          console.error("Preview canvas ref is null");
          throw new Error("Preview canvas not available");
        }

        const previewCanvas = previewCanvasRef.current;
        previewCanvas.width = width;
        previewCanvas.height = height;

        const previewContext = previewCanvas.getContext("2d");
        if (!previewContext) {
          console.error("Failed to get preview canvas context");
          throw new Error("Preview canvas context not available");
        }

        // Fill main canvas with blue background
        context.fillStyle = "#99C0F3";
        context.fillRect(0, 0, width, height);

        // Load the logo
        const logo = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new window.Image(1, 1);
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = "/assets/logo.svg";
        });

        // Calculate logo dimensions (assuming square logo)
        const logoSize = 80;
        const logoTopPadding = 40;

        // Draw left logo
        context.drawImage(logo, 40, logoTopPadding, logoSize, logoSize);
        // Draw right logo
        context.drawImage(
          logo,
          width - logoSize - 40,
          logoTopPadding,
          logoSize,
          logoSize
        );

        // Calculate image dimensions and spacing
        const topPadding = logoTopPadding + logoSize + 40; // Space for logos
        const bottomPadding = 100; // Space for text
        const sidePadding = 60; // Padding on sides
        const imageGap = 40; // Gap between images

        // Calculate available space for images
        const availableHeight =
          height - topPadding - bottomPadding - imageGap * 2; // Space for 2 gaps between 3 images
        const singleImageHeight = availableHeight / 3;
        const maxImageWidth = width - sidePadding * 2;

        // Target aspect ratio (4:3 or whatever looks best for your photos)
        const targetAspectRatio = 4 / 3;

        // Calculate final image dimensions maintaining aspect ratio
        let finalImageWidth = maxImageWidth;
        let finalImageHeight = singleImageHeight;

        // Adjust dimensions to maintain aspect ratio
        if (finalImageWidth / finalImageHeight > targetAspectRatio) {
          finalImageWidth = finalImageHeight * targetAspectRatio;
        } else {
          finalImageHeight = finalImageWidth / targetAspectRatio;
        }

        // Center horizontally
        const imageX = (width - finalImageWidth) / 2;

        // Load all images first
        const loadedImages = await Promise.all(
          capturedImages.map(
            (capture, index) =>
              new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new window.Image(1, 1);
                img.onload = () => {
                  console.log(`Image ${index + 1} loaded:`, {
                    width: img.width,
                    height: img.height,
                  });
                  resolve(img);
                };
                img.onerror = (e) => {
                  console.error(`Failed to load image ${index + 1}:`, e);
                  reject(new Error(`Failed to load image ${index + 1}`));
                };
                img.src = capture.dataUrl;
              })
          )
        );

        // Draw each image
        loadedImages.forEach((img, i) => {
          const y = topPadding + (singleImageHeight + imageGap) * i;

          // Draw image centered
          context.save();
          context.drawImage(img, imageX, y, finalImageWidth, finalImageHeight);
          context.restore();
        });

        // Add text at the bottom
        context.font = "bold 32px Arial";
        context.fillStyle = "#FFFFFF";
        context.textAlign = "left";
        context.fillText("#ourjourneyz", sidePadding, height - 40);

        context.textAlign = "right";
        context.fillText("#zahwajian", width - sidePadding, height - 40);

        // Update preview canvas with collage
        previewContext.clearRect(0, 0, width, height);
        previewContext.drawImage(canvas, 0, 0);
        setShowCollagePreview(true);

        // Handle upload if requested
        if (shouldUpload) {
          const finalImage = canvas.toDataURL("image/jpeg", 0.8);
          const formData = new FormData();
          const blob = await (await fetch(finalImage)).blob();
          formData.append("image", blob, "photobooth.jpg");
          formData.append(
            "name",
            localStorage.getItem("journeyz_user_name") || "Anonymous"
          );
          formData.append("message", "Captured with Photobooth");

          const now = new Date();
          const formattedDate = `${String(now.getDate()).padStart(
            2,
            "0"
          )}/${String(now.getMonth() + 1).padStart(
            2,
            "0"
          )}/${now.getFullYear()} - ${String(now.getHours()).padStart(
            2,
            "0"
          )}:${String(now.getMinutes()).padStart(2, "0")}`;
          formData.append("date", formattedDate);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error("Failed to upload image");

          toast.success("Your photobooth moment has been shared!");
          onSuccessfulUpload?.();
          onClose();
        }
      } catch (error) {
        console.error("Error creating/uploading collage:", error);
        toast.error("Failed to create collage. Please try again.");
        setShowCollagePreview(false);
      } finally {
        setIsProcessing(false);
        setIsCreatingCollage(false);
      }
    },
    [capturedImages, onClose, onSuccessfulUpload]
  );

  // Handle capture with countdown
  const startCapture = useCallback(async () => {
    // Prevent capturing if we already have 3 images
    if (capturedImages.length >= 3) {
      return;
    }

    if (!isCameraReady || isCountingDown) {
      return;
    }

    setIsCountingDown(true);
    setCountdownValue(3);

    const cleanup = () => {
      setIsCountingDown(false);
    };

    const countdownInterval = setInterval(() => {
      setCountdownValue((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Capture after countdown
    const captureTimeout = setTimeout(async () => {
      if (!videoRef.current || !canvasRef.current) {
        cleanup();
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        try {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0);
          applyFilter(context, selectedFilter);

          const dataUrl = canvas.toDataURL("image/jpeg");
          setCapturedImages((prev) => [
            ...prev,
            { dataUrl, filter: selectedFilter },
          ]);
        } catch (err) {
          console.error("Error during capture:", err);
          toast.error("Failed to capture photo. Please try again.");
        }
      }
      cleanup();
      clearInterval(countdownInterval);
      clearTimeout(captureTimeout);
    }, 3000);

    return () => {
      cleanup();
      clearInterval(countdownInterval);
      clearTimeout(captureTimeout);
    };
  }, [
    capturedImages.length,
    isCameraReady,
    isCountingDown,
    selectedFilter,
    applyFilter,
  ]);

  // Reset all states when closing
  const handleClose = useCallback(() => {
    console.log("PhotoboothPopup - handleClose called");
    // Reset all states
    setIsCameraReady(false);
    setIsCountingDown(false);
    setCountdownValue(3);
    setSelectedFilter("none");
    setCapturedImages([]);
    setIsProcessing(false);
    setIsCreatingCollage(false);
    setShowCollagePreview(false);

    // Notify state changes
    onPopupStateChange(false);
    onClose();
  }, [onClose, onPopupStateChange]);

  useEffect(() => {
    if (!isOpen) {
      handleClose();
    }
  }, [isOpen, handleClose]);

  // Add effect to initialize canvas dimensions
  useEffect(() => {
    if (previewCanvasRef.current && canvasRef.current) {
      const width = 900;
      const height = 1200;

      previewCanvasRef.current.width = width;
      previewCanvasRef.current.height = height;

      canvasRef.current.width = width;
      canvasRef.current.height = height;
    }
  }, []);

  // Add effect to ensure canvas dimensions when collage preview is shown
  useEffect(() => {
    if (showCollagePreview && previewCanvasRef.current) {
      const width = 900;
      const height = 1200;

      if (
        previewCanvasRef.current.width !== width ||
        previewCanvasRef.current.height !== height
      ) {
        console.log("Resetting preview canvas dimensions");
        previewCanvasRef.current.width = width;
        previewCanvasRef.current.height = height;
      }
    }
  }, [showCollagePreview]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#3B75C2] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={handleClose}
                className="w-10 h-10 relative"
                disabled={isProcessing}
              >
                <Image
                  src="/assets/close-white.svg"
                  alt="Close"
                  fill
                  className="object-contain"
                />
              </button>
              <div className="text-white text-xl font-semibold">
                {showCollagePreview
                  ? "Your Photobooth Collage"
                  : "Take Photos (3 Required)"}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative overflow-y-auto">
              {/* Preview Canvas */}
              <div className="relative w-full aspect-square bg-black">
                {!showCollagePreview && !isCreatingCollage && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                {isCreatingCollage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#99C0F3]">
                    <div className="text-center">
                      <Image
                        src="/assets/hb3.gif"
                        alt="Creating collage..."
                        width={100}
                        height={100}
                        className="mx-auto mb-4"
                      />
                      <div className="text-white text-lg">
                        Creating your collage...
                      </div>
                    </div>
                  </div>
                )}
                <canvas
                  ref={previewCanvasRef}
                  className={`absolute inset-0 w-full h-full ${
                    showCollagePreview
                      ? "object-contain bg-[#99C0F3]"
                      : "object-cover"
                  }`}
                />
                {isCountingDown && !isCreatingCollage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-8xl font-bold">
                      {countdownValue}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail Grid */}
              <div className="absolute bottom-32 left-4 right-4 flex justify-center gap-4">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className={`relative w-20 h-20 ${
                      capturedImages[index]
                        ? "bg-white"
                        : "bg-white/10 border-2 border-dashed border-white/30"
                    } rounded-lg overflow-hidden`}
                  >
                    {capturedImages[index] && (
                      <>
                        <Image
                          src={capturedImages[index].dataUrl}
                          alt={`Capture ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </>
                    )}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Button */}
              <div className="p-4 mt-36 pb-20">
                {!showCollagePreview ? (
                  capturedImages.length === 3 ? (
                    <button
                      onClick={() => {
                        setIsCreatingCollage(true);
                        // Stop the video preview
                        if (videoRef.current?.srcObject) {
                          const stream = videoRef.current
                            .srcObject as MediaStream;
                          stream.getTracks().forEach((track) => track.stop());
                          videoRef.current.srcObject = null;
                        }
                        createCollage(false).catch((error) => {
                          console.error("Failed to create collage:", error);
                          setIsCreatingCollage(false);
                          toast.error(
                            "Failed to create collage. Please try again."
                          );
                        });
                      }}
                      disabled={isProcessing || isCreatingCollage}
                      className="w-full py-4 bg-white rounded-full text-[#3B75C2] font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingCollage
                        ? "Creating Collage..."
                        : "Create Collage"}
                    </button>
                  ) : (
                    <button
                      onClick={startCapture}
                      disabled={
                        !isCameraReady ||
                        isCountingDown ||
                        isProcessing ||
                        capturedImages.length >= 3
                      }
                      className="w-full py-4 bg-white rounded-full text-[#3B75C2] font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCountingDown
                        ? "Capturing..."
                        : `Take Photo ${Math.min(
                            capturedImages.length + 1,
                            3
                          )} of 3`}
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => createCollage(true)}
                    disabled={isProcessing}
                    className="w-full py-4 bg-white rounded-full text-[#3B75C2] font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing
                      ? "Processing..."
                      : "Share Your Photobooth Collage"}
                  </button>
                )}
              </div>
            </div>

            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Dialog */}
      <LoadingDialog
        isOpen={isCreatingCollage}
        message="Creating your photobooth moment..."
        gifSrc="/assets/hb3.gif"
      />
    </>
  );
}
