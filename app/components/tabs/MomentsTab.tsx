import Image from "next/image";
import { useState, useEffect } from "react";
import { ImagePopup } from "../ui/ImagePopup";
import { RefreshCw } from "lucide-react";

interface Upload {
  file_id: string;
  name: string;
  message: string;
  date: string;
  imageUrl: string;
  timestamp: number;
}

interface PolaroidProps {
  imageUrl: string;
  caption: string;
  message: string;
  date: string;
}

interface MomentsTabProps {
  onPopupStateChange: (isOpen: boolean) => void;
}

function Polaroid({
  imageUrl,
  caption,
  message,
  date,
  onPopupStateChange,
}: PolaroidProps & { onPopupStateChange: (isOpen: boolean) => void }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handlePopupStateChange = (state: boolean) => {
    setIsPopupOpen(state);
    onPopupStateChange(state);
  };

  return (
    <>
      <div
        className="w-full h-full bg-white rounded-[2px] p-2 shadow-lg cursor-pointer transition-transform hover:scale-[1.02]"
        onClick={() => handlePopupStateChange(true)}
      >
        <div className="relative w-full h-[120px] mx-auto mb-2">
          <Image
            src={imageUrl}
            alt={caption}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <p className="text-center text-sm font-write">by {caption}</p>
      </div>

      <ImagePopup
        isOpen={isPopupOpen}
        onClose={() => handlePopupStateChange(false)}
        imageUrl={imageUrl}
        caption={caption}
        message={message}
        date={date}
      />
    </>
  );
}

function PolaroidSkeleton() {
  return (
    <div className="w-full h-full bg-white/10 rounded-[2px] p-2 shadow-lg animate-pulse">
      <div className="relative w-full h-full mx-auto mb-2 bg-white/20 rounded-sm" />
      <div className="h-4 bg-white/20 w-16 mx-auto rounded" />
    </div>
  );
}

export function MomentsTab({ onPopupStateChange }: MomentsTabProps) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUploads = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const response = await fetch("/api/upload");

      if (!response.ok) {
        throw new Error("Failed to fetch uploads");
      }

      const data = await response.json();
      setUploads(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load moments");
      console.error("Error fetching uploads:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Logo and Refresh Button */}
      <div className="flex items-center justify-between px-3 mb-8 mt-2">
        <div className="w-24 h-24 relative">
          <Image
            src="/assets/logo.svg"
            alt="Logo"
            fill
            className="object-contain"
          />
        </div>
        <button
          onClick={fetchUploads}
          disabled={isRefreshing}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw
            className={`w-5 h-5 text-white ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* Grid Container */}
      <div className="w-full px-3 -mt-5">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {Array.from({ length: 6 }).map((_, index) => (
              <PolaroidSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-white py-8">{error}</div>
        ) : uploads.length === 0 ? (
          <div className="text-center text-white py-8">
            No moments shared yet
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 justify-items-center">
            {uploads.map((upload, index) => (
              <Polaroid
                key={upload.file_id || index}
                imageUrl={upload.imageUrl}
                caption={upload.name}
                message={upload.message}
                date={upload.date}
                onPopupStateChange={onPopupStateChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
