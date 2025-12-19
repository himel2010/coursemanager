import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const supervisorId = searchParams.get("supervisorId");
    const department = searchParams.get("department");

    const whereClause = {
      isOpen: true,
    };

    if (supervisorId) {
      whereClause.supervisorId = supervisorId;
    }

    if (department) {
      whereClause.supervisor = {
        department: {
          contains: department,
          mode: "insensitive",
        },
      };
    }

    const thesisSlots = await prisma.thesisSlot.findMany({
      where: whereClause,
      include: {
        supervisor: true,
        applications: {
          where: {
            status: "ACCEPTED",
          },
        },
      },
      orderBy: {
        availableTo: "desc",
      },
    });

    // Enrich with slot availability
    const enrichedSlots = thesisSlots.map((slot) => ({
      ...slot,
      availableSlots: slot.supervisor.maxThesisSlots - slot.applications.length,
      totalApplications: slot.applications.length,
    }));

    return NextResponse.json(enrichedSlots, { status: 200 });
  } catch (error) {
    console.error("Error fetching thesis slots:", error);
    // Return empty array on error instead of error object
    return NextResponse.json([], { status: 200 });
  }
}
