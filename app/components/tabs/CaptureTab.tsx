import Image from "next/image";
import { PhotoboothCard } from "./capture/PhotoboothCard";
import { UploadCard } from "./capture/UploadCard";

interface CaptureTabProps {
  onPhotoboothStateChange: (isOpen: boolean) => void;
  onUploadStateChange: (isOpen: boolean) => void;
  setActiveTab: (tab: "moments" | "capture") => void;
}

export function CaptureTab({
  onPhotoboothStateChange,
  onUploadStateChange,
  setActiveTab,
}: CaptureTabProps) {
  return (
    <div className="flex flex-col w-full">
      {/* Logo */}
      <div className="w-24 h-24 relative mx-auto mb-8 mt-2">
        <Image
          src="/assets/logo.svg"
          alt="Logo"
          fill
          className="object-contain"
        />
      </div>

      {/* Action Cards */}
      <div className="px-6 space-y-4">
        <PhotoboothCard
          onPopupStateChange={onPhotoboothStateChange}
          onSuccessfulUpload={() => setActiveTab("moments")}
        />
        <UploadCard
          onPopupStateChange={onUploadStateChange}
          onSuccessfulUpload={() => setActiveTab("moments")}
        />
      </div>
    </div>
  );
}
