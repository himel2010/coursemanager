import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = await createClient();
    const authData = await supabase.auth.getUser();
    const userId = authData.data?.user?.id;

    console.log("GET /api/user/me - userId:", userId);

    if (!userId) {
      console.error("Unauthorized - no userId");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

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

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
