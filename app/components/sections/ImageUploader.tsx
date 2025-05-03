"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

interface Upload {
  file_id: string;
  guestName: string;
  imageUrl: string;
  date: number;
}

export function ImageUploader() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const fetchUploads = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch("/api/upload");
      if (!response.ok) throw new Error("Failed to fetch uploads");
      const data = await response.json();
      setUploads(data);
    } catch (error) {
      toast.error("Failed to load uploaded images");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const file = formData.get("image") as File;
      const guestName = formData.get("guestName") as string;

      if (!file) {
        throw new Error("Please select an image");
      }

      if (!guestName) {
        throw new Error("Please enter your name");
      }

      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to upload image");
      }

      toast.success("Image uploaded successfully!");
      formRef.current?.reset();

      fetchUploads();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Image Uploader</h1>
        <p className="text-gray-500 mt-2">Upload your captured moments</p>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          <Input
            id="guestName"
            name="guestName"
            type="text"
            placeholder="Enter your name"
            disabled={isUploading}
            required
          />
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            disabled={isUploading}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload Image"}
        </Button>
      </form>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Uploads</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUploads}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : uploads.length === 0 ? (
          <div className="text-center text-gray-500">No uploads yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploads.map((upload) => (
              <div
                key={upload.file_id}
                className="border rounded-lg overflow-hidden shadow-sm"
              >
                <img
                  src={upload.imageUrl}
                  alt={`Uploaded by ${upload.guestName}`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="font-medium">Uploaded by: {upload.guestName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(upload.date * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
