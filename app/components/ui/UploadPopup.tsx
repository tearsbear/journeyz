import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingDialog } from "./LoadingDialog";
import { toast } from "sonner";

interface UploadPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessfulUpload?: () => void;
  onPopupStateChange: (isOpen: boolean) => void;
}

const LOCAL_STORAGE_NAME_KEY = "journeyz_user_name";

export function UploadPopup({
  isOpen,
  onClose,
  onSuccessfulUpload,
  onPopupStateChange,
}: UploadPopupProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const resetForm = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
    setMessage("");
  }, [preview]);

  const handleClose = () => {
    console.log("UploadPopup - handleClose called");
    if (!isUploading) {
      resetForm();
      onPopupStateChange(false);
      onClose();
    }
  };

  // Reset form when popup is closed externally
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
      const newPreview = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreview(newPreview);
    }
  };

  const removeImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setSelectedFile(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !message.trim()) return;

    // Format date as "DD/MM/YYYY - HH:mm"
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear()} - ${String(
      now.getHours()
    ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const userName =
      localStorage.getItem(LOCAL_STORAGE_NAME_KEY) || "Anonymous";
    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("name", userName);
    formData.append("message", message.trim());
    formData.append("date", formattedDate);

    setIsUploading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to upload image");
      }

      // Add a shorter delay before closing
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Show success toast
      toast.success("Your moment has been shared successfully!");

      // Call the onSuccessfulUpload callback if provided
      onSuccessfulUpload?.();

      // Success
      handleClose();
    } catch (error) {
      console.error("Upload error:", error);
      // Add a shorter delay before hiding the loading dialog on error
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Show fixed error toast
      toast.error("Please choose another image or try again");
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid = selectedFile && message.trim().length > 0;

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
                disabled={isUploading}
              >
                <Image
                  src="/assets/close-white.svg"
                  alt="Back"
                  fill
                  className="object-contain"
                />
              </button>
              <h1 className="text-white text-xl font-semibold">Upload Image</h1>
              <div className="w-10" /> {/* Spacer for alignment */}
            </div>

            {/* Content */}
            <div className="px-6 flex-1 overflow-y-auto">
              {/* Preview Area with Image Selection */}
              <div className="relative bg-white rounded-[20px] aspect-square w-full mb-6 flex items-center justify-center overflow-hidden">
                {preview ? (
                  <>
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center"
                      disabled={isUploading}
                    >
                      <span className="text-white text-lg">×</span>
                    </button>
                  </>
                ) : (
                  <label
                    className={`cursor-pointer flex flex-col items-center gap-4 ${
                      isUploading ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    <div className="w-16 h-16 relative">
                      <Image
                        src="/assets/export.svg"
                        alt="Choose Image"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                      disabled={isUploading}
                    />
                    <span className="text-[#3B75C2] text-xl font-semibold">
                      Choose Image
                    </span>
                  </label>
                )}
              </div>

              {/* Message Input */}
              <div className="space-y-2 mb-6">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full h-32 px-5 py-4 rounded-xl bg-white/10 text-white placeholder:text-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-white/30 inter-font"
                  disabled={isUploading}
                />
              </div>

              {/* Share Button */}
              <button
                onClick={handleUpload}
                disabled={!isFormValid || isUploading}
                className="w-full py-4 mb-20 bg-white rounded-full text-[#3B75C2] font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Share Moments"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Dialog - Moved outside the AnimatePresence */}
      <LoadingDialog
        isOpen={isUploading}
        message="Uploading your moment..."
        gifSrc="/assets/hb3.gif"
      />
    </>
  );
}
