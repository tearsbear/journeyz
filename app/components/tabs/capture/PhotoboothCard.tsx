import { useState } from "react";
import Image from "next/image";
import { PhotoboothPopup } from "../../ui/PhotoboothPopup";

interface PhotoboothCardProps {
  onPopupStateChange: (isOpen: boolean) => void;
  onSuccessfulUpload?: () => void;
}

export function PhotoboothCard({
  onPopupStateChange,
  onSuccessfulUpload,
}: PhotoboothCardProps) {
  const [isPhotoboothOpen, setIsPhotoboothOpen] = useState(false);

  const handlePopupState = (state: boolean) => {
    setIsPhotoboothOpen(state);
    onPopupStateChange(state);
  };

  return (
    <>
      <button
        onClick={() => handlePopupState(true)}
        className="w-full bg-[#3B75C2]/18 rounded-[16px] p-8 flex flex-col items-center gap-4 border-2 border-[#488AE2] hover:scale-[1.02] transition-transform active:scale-[0.98]"
      >
        <div className="w-12 h-12 relative">
          <Image
            src="/assets/camera-white.svg"
            alt="Photobooth"
            fill
            className="object-contain"
          />
        </div>
        <span className="text-white text-xl font-semibold montserrat-font">
          Try Photobooth
        </span>
      </button>

      <PhotoboothPopup
        isOpen={isPhotoboothOpen}
        onClose={() => handlePopupState(false)}
        onSuccessfulUpload={onSuccessfulUpload}
        onPopupStateChange={handlePopupState}
      />
    </>
  );
}
