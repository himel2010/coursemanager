import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(req, { params }) {
  try {
    const supabase = await createClient();
    const authData = await supabase.auth.getUser();
    const userId = authData.data?.user?.id;

    console.log("GET /api/notes/[noteId] - userId:", userId);

    if (!userId) {
      console.error("Unauthorized - no userId");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { noteId } = await params;

    // Get user from database
    let user = await db.user.findUnique({
      where: { id: userId },
    });

    // If user doesn't exist, create them
    if (!user) {
      console.log("User not found, creating user:", userId);
      user = await db.user.create({
        data: {
          id: userId,
          email: "",
          name: "",
        },
      });
    }

    // Fetch note and verify ownership
    const note = await db.note.findUnique({
      where: { id: noteId },
      include: {
        course: true,
        uploads: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            createdAt: true,
            // Exclude pdfData as it's binary and not needed in the response
          },
        },
      },
    });

    if (!note) {
      return new Response(JSON.stringify({ error: "Note not found" }), {
        status: 404,
      });
    }

    if (note.userId !== user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify(note), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching note:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function PATCH(req, { params }) {
  try {
    const supabase = await createClient();
    const authData = await supabase.auth.getUser();
    const userId = authData.data?.user?.id;

    console.log("PATCH /api/notes/[noteId] - userId:", userId);

    if (!userId) {
      console.error("Unauthorized - no userId");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { noteId } = await params;
    const body = await req.json();
    const { title, content, topic, tags, courseId, noteType, progress } = body;
    
    console.log("PATCH body received:", { 
      noteId,
      hasContent: !!content,
      hasProgress: !!progress,
      fields: Object.keys(body)
    });

    // Get user from database
    let user = await db.user.findUnique({
      where: { id: userId },
    });

    // If user doesn't exist, create them
    if (!user) {
      console.log("User not found, creating user:", userId);
      user = await db.user.create({
        data: {
          id: userId,
          email: "",
          name: "",
        },
      });
    }

    // Fetch note and verify ownership
    const note = await db.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return new Response(JSON.stringify({ error: "Note not found" }), {
        status: 404,
      });
    }

    if (note.userId !== user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
      });
    }

    // Update note
    const updateData = {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(topic !== undefined && { topic }),
      ...(tags !== undefined && { tags }),
      ...(courseId !== undefined && { courseId }),
      ...(noteType !== undefined && { noteType }),
      ...(progress !== undefined && { progress }),
    };
    
    console.log("Updating note with data:", { 
      noteId, 
      updateFields: Object.keys(updateData),
      hasContent: !!updateData.content,
      hasProgress: !!updateData.progress
    });

    const updatedNote = await db.note.update({
      where: { id: noteId },
      data: updateData,
      include: {
        course: true,
        uploads: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            createdAt: true,
            // Exclude pdfData as it's binary and not needed in the response
          },
        },
      },
    });

    console.log("Note updated successfully:", { noteId, updatedAt: updatedNote.updatedAt });

    return new Response(JSON.stringify(updatedNote), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating note:", { 
      error: error.message,
      stack: error.stack,
      code: error.code
    });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    const supabase = await createClient();
    const authData = await supabase.auth.getUser();
    const userId = authData.data?.user?.id;

    console.log("DELETE /api/notes/[noteId] - userId:", userId);

    if (!userId) {
      console.error("Unauthorized - no userId");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { noteId } = await params;
    console.log("Deleting note:", noteId);

    // Get user from database
    let user = await db.user.findUnique({
      where: { id: userId },
    });

    // If user doesn't exist, create them
    if (!user) {
      console.log("User not found, creating user:", userId);
      user = await db.user.create({
        data: {
          id: userId,
          email: "",
          name: "",
        },
      });
    }

    // Fetch note and verify ownership
    const note = await db.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      console.warn("Note not found for deletion:", noteId);
      return new Response(JSON.stringify({ error: "Note not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (note.userId !== user.id) {
      console.error("Unauthorized delete attempt - user mismatch");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete all uploads first, then delete the note
    console.log("Deleting uploads for note:", noteId);
    await db.upload.deleteMany({
      where: { noteId: noteId },
    });

    console.log("Deleting note:", noteId);
    await db.note.delete({
      where: { id: noteId },
    });

    console.log("Note deleted successfully:", noteId);

    return new Response(JSON.stringify({ success: true, deletedNoteId: noteId }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting note:", { 
      error: error.message, 
      code: error.code,
      stack: error.stack
    });
    return new Response(JSON.stringify({ error: error.message || "Failed to delete note" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
