import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(req, { params }) {
  try {
    const { noteId } = params;
    const supabase = await createClient();
    const authData = await supabase.auth.getUser();
    const userId = authData.data?.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Get uploads for the note
    const uploads = await db.upload.findMany({
      where: {
        noteId: noteId,
        userId: userId,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
        // Exclude pdfData from the response
      },
    });

    return new Response(JSON.stringify(uploads), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching uploads:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { noteId } = params;
    const supabase = await createClient();
    const authData = await supabase.auth.getUser();
    const userId = authData.data?.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { uploadId } = await req.json();

    if (!uploadId) {
      return new Response(JSON.stringify({ error: "Upload ID required" }), {
        status: 400,
      });
    }

    // Get upload to verify ownership
    const upload = await db.upload.findUnique({
      where: { id: uploadId },
    });

    if (!upload || upload.userId !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
      });
    }

    // Delete from database - PDF data is automatically cleaned up
    await db.upload.delete({
      where: { id: uploadId },
    });

    console.log("Upload deleted:", { uploadId, fileName: upload.fileName });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting upload:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
