import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseClient"; // Adjust the path as necessary

interface UploadInfo {
  file_id: string;
  name: string;
  message: string;
  date: string;
  imageUrl: string;
  timestamp: number;
}

export async function GET() {
  try {
    const { data: uploads, error } = await supabase.from("uploads").select("*");

    if (error) throw error;

    return NextResponse.json(uploads);
  } catch (error) {
    console.error("Failed to fetch uploads:", error);
    return NextResponse.json(
      { error: "Failed to fetch uploads" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;
    const name = formData.get("name") as string;
    const message = formData.get("message") as string;
    const date = formData.get("date") as string;

    if (!image || !name || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await image.arrayBuffer());

    // Create form data for Telegram API
    const telegramFormData = new FormData();
    telegramFormData.append("chat_id", process.env.TELEGRAM_STORAGE_CHAT_ID!);
    telegramFormData.append("photo", new Blob([buffer], { type: image.type }));
    telegramFormData.append(
      "caption",
      `📸 New Moment Shared!\n\nBy: ${name}\nMessage: ${message}\nDate: ${date}`
    );

    // Send to Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        body: telegramFormData,
      }
    );

    if (!telegramResponse.ok) {
      const error = await telegramResponse.text();
      console.error("Telegram API error:", error);
      return NextResponse.json(
        { error: "Failed to send image to Telegram" },
        { status: 500 }
      );
    }

    const telegramData = await telegramResponse.json();

    // Get the file path
    const photo =
      telegramData.result.photo[telegramData.result.photo.length - 1];
    const fileResponse = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${photo.file_id}`
    );

    if (!fileResponse.ok) {
      throw new Error("Failed to get file info");
    }

    const fileData = await fileResponse.json();
    const filePath = fileData.result.file_path;

    // Store the upload information
    const uploadInfo: UploadInfo = {
      file_id: photo.file_id,
      name,
      message,
      date,
      imageUrl: `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`,
      timestamp: Math.floor(Date.now() / 1000), // Current timestamp in seconds
    };

    // Insert into Supabase
    const { error } = await supabase.from("uploads").insert([uploadInfo]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
