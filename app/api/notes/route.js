import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = await createClient();
    const authData = await supabase.auth.getUser();
    const userId = authData.data?.user?.id;

    console.log("GET /api/notes - userId:", userId);

    if (!userId) {
      console.error("Unauthorized - no userId");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

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

    // Fetch all notes for the user
    const notes = await db.note.findMany({
      where: { userId: user.id },
      include: {
        course: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return new Response(JSON.stringify(notes), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    const supabase = await createClient();
    const authData = await supabase.auth.getUser();
    const userId = authData.data?.user?.id;

    console.log("POST /api/notes - userId:", userId);

    if (!userId) {
      console.error("Unauthorized - no userId");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { title, content, courseId, topic, tags, noteType } = await req.json();

    // Check if user exists, if not create them
    let user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.log("User not found in database, creating:", userId);
      user = await db.user.create({
        data: {
          id: userId,
          email: "",
          name: "",
        },
      });
    }

    // Create new note
    const note = await db.note.create({
      data: {
        title,
        content: content || {},
        userId: user.id,
        courseId: courseId || null,
        topic: topic || null,
        tags: tags || [],
        noteType: noteType || "DIGITAL",
      },
      include: {
        course: true,
      },
    });

    return new Response(JSON.stringify(note), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
