import Image from "next/image";
import { PhotoboothCard } from "./capture/PhotoboothCard";
import { UploadCard } from "./capture/UploadCard";

interface CaptureTabProps {
  onPopupStateChange: (isOpen: boolean) => void;
}

export function CaptureTab({ onPopupStateChange }: CaptureTabProps) {
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
        <PhotoboothCard />
        <UploadCard onPopupStateChange={onPopupStateChange} />
      </div>
    </div>
  );
}
