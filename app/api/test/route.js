import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return Response.json({
      success: true,
      userCount,
      message: "Database connected!",
    });
  } catch (error) {
    return Response.json(
      {
        error: "Database connection failed",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
