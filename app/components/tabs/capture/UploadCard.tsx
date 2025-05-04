import { useState } from "react";
import Image from "next/image";
import { UploadPopup } from "../../ui/UploadPopup";

interface UploadCardProps {
  onPopupStateChange: (isOpen: boolean) => void;
  onSuccessfulUpload?: () => void;
}

export function UploadCard({
  onPopupStateChange,
  onSuccessfulUpload,
}: UploadCardProps) {
  const [isUploadPopupOpen, setIsUploadPopupOpen] = useState(false);

  const handlePopupState = (state: boolean) => {
    console.log("UploadCard - Setting state to:", state);
    setIsUploadPopupOpen(state);
    onPopupStateChange(state);
  };

  return (
    <>
      <button
        onClick={() => handlePopupState(true)}
        className="w-full bg-white rounded-[16px] p-8 flex flex-col items-center gap-4 border-3 border-[#3B75C2] hover:scale-[1.02] transition-transform active:scale-[0.98]"
      >
        <div className="w-12 h-12 relative">
          <Image
            src="/assets/export.svg"
            alt="Upload"
            fill
            className="object-contain"
          />
        </div>
        <span className="text-[#3B75C2] text-xl font-semibold montserrat-font">
          Upload Image
        </span>
      </button>

      <UploadPopup
        isOpen={isUploadPopupOpen}
        onClose={() => handlePopupState(false)}
        onSuccessfulUpload={onSuccessfulUpload}
        onPopupStateChange={onPopupStateChange}
      />
    </>
  );
}
