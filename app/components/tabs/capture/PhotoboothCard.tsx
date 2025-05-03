import Image from "next/image";

export function PhotoboothCard() {
  const handlePhotobooth = () => {
    // Handle photobooth action
    console.log("Opening photobooth...");
  };

  return (
    <button
      onClick={handlePhotobooth}
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
  );
}
