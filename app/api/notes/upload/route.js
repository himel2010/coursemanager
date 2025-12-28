import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req) {
  try {
    const supabase = await createClient();
    const authData = await supabase.auth.getUser();
    const userId = authData.data?.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Parse FormData
    const formData = await req.formData();
    const file = formData.get("file");
    const courseId = formData.get("courseId");
    const title = formData.get("title");

    if (!file) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
      });
    }

    // Validate file type (PDF only)
    if (file.type !== "application/pdf") {
      return new Response(
        JSON.stringify({ error: "Only PDF files are allowed" }),
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for database storage)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "File size must be less than 10MB" }),
        { status: 400 }
      );
    }

    // Get user from database
    let user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          id: userId,
          email: "",
          name: "",
        },
      });
    }

    console.log("Processing PDF upload:", { fileName: file.name, fileSize: file.size, userId });

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create a note entry for the PDF
    const note = await db.note.create({
      data: {
        title: title || file.name,
        content: {
          type: "pdf",
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
        },
        userId: user.id,
        courseId: courseId || null,
        noteType: "SCANNED",
      },
      include: {
        course: true,
        uploads: true,
      },
    });

    // Create upload record with PDF data stored in database
    const upload = await db.upload.create({
      data: {
        fileName: file.name,
        fileUrl: null, // No external URL since we're storing in DB
        fileType: "application/pdf",
        fileSize: file.size,
        pdfData: buffer, // Store binary PDF data directly in database
        userId: user.id,
        noteId: note.id,
      },
    });

    console.log("PDF upload successful:", { uploadId: upload.id, noteId: note.id });

    return new Response(
      JSON.stringify({
        success: true,
        note,
        upload: {
          id: upload.id,
          fileName: upload.fileName,
          fileSize: upload.fileSize,
          fileType: upload.fileType,
          createdAt: upload.createdAt,
        },
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error uploading PDF:", {
      message: error.message,
      stack: error.stack,
    });
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to upload PDF",
        details: error.message
      }), 
      { status: 500 }
    );
  }
}
