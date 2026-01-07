import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(req, { params }) {
  try {
    const { articleId } = await params;

    // Get help article and increment view count
    const helpArticle = await db.helpArticle.update({
      where: { id: articleId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
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
        forumPost: true,
      },
    });

    return new Response(JSON.stringify(helpArticle), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching help article:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(req, { params }) {
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

    const { articleId } = await params;
    const body = await req.json();

    // Check authorization - user must be author
    const article = await db.helpArticle.findUnique({
      where: { id: articleId },
    });

    if (!article || article.authorId !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Update help article
    const updatedArticle = await db.helpArticle.update({
      where: { id: articleId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.question && { question: body.question }),
        ...(body.answer && { answer: body.answer }),
        ...(body.tags && {
          tags: body.tags,
          searchIndex: `${body.title || article.title} ${body.question || article.question} ${(body.tags || article.tags).join(" ")}`.toLowerCase(),
        }),
        ...(body.helpful !== undefined && { helpful: body.helpful }),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        course: {
          select: { id: true, code: true, title: true },
        },
      },
    });

    return new Response(JSON.stringify(updatedArticle), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating help article:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(req, { params }) {
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

    const { articleId } = await params;

    // Check authorization
    const article = await db.helpArticle.findUnique({
      where: { id: articleId },
    });

    if (!article || article.authorId !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete help article
    await db.helpArticle.delete({
      where: { id: articleId },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting help article:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
