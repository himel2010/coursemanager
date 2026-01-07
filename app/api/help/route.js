import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(req) {
  try {
    const supabase = await createClient();
    const authData = await supabase.auth.getUser();
    const userId = authData.data?.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { courseId, forumPostId, title, question, answer, tags = [] } = body;

    if (!courseId || !title || !question || !answer) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create search index from title, question, and tags
    const searchIndex = `${title} ${question} ${tags.join(" ")}`.toLowerCase();

    // Create help article
    const helpArticle = await db.helpArticle.create({
      data: {
        courseId,
        forumPostId: forumPostId || null,
        title,
        question,
        answer,
        authorId: userId,
        tags,
        searchIndex,
      },
      include: {
        author: true,
        course: true,
        forumPost: true,
      },
    });

    return new Response(JSON.stringify(helpArticle), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating help article:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(req) {
  try {
    const supabase = await createClient();
    const authData = await supabase.auth.getUser();
    const userId = authData.data?.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      courseId: courseId || undefined,
    };

    // Add search filter if provided
    if (search) {
      where.searchIndex = {
        search: search.split(" ").join(" & "),
      };
    }

    // Fetch help articles
    const helpArticles = await db.helpArticle.findMany({
      where: Object.fromEntries(
        Object.entries(where).filter(([, v]) => v !== undefined)
      ),
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            code: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    // Get total count
    const total = await db.helpArticle.count({
      where: Object.fromEntries(
        Object.entries(where).filter(([, v]) => v !== undefined)
      ),
    });

    return new Response(
      JSON.stringify({
        data: helpArticles,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching help articles:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
