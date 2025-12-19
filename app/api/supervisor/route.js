import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");

    const whereClause = {
      OR: [
        { maxThesisSlots: { gt: 0 } },
        { maxInternshipSlots: { gt: 0 } },
      ],
    };

    if (department) {
      whereClause.department = {
        contains: department,
        mode: "insensitive",
      };
    }

    const supervisors = await prisma.supervisor.findMany({
      where: whereClause,
      include: {
        thesisSlots: {
          where: { isOpen: true },
          include: {
            applications: {
              where: { status: "ACCEPTED" },
            },
          },
        },
        internshipSlots: {
          where: { isOpen: true },
          include: {
            applications: {
              where: { status: "ACCEPTED" },
            },
          },
        },
      },
    });

    // Enrich with available slots
    const enrichedSupervisors = supervisors.map((supervisor) => ({
      ...supervisor,
      availableThesisSlots:
        supervisor.maxThesisSlots -
        supervisor.thesisSlots.reduce((sum, slot) => sum + slot.applications.length, 0),
      availableInternshipSlots:
        supervisor.maxInternshipSlots -
        supervisor.internshipSlots.reduce(
          (sum, slot) => sum + slot.applications.length,
          0
        ),
      openThesisCount: supervisor.thesisSlots.length,
      openInternshipCount: supervisor.internshipSlots.length,
    }));

    return NextResponse.json(enrichedSupervisors, { status: 200 });
  } catch (error) {
    console.error("Error fetching supervisors:", error);
    // Return empty array on error instead of error object
    return NextResponse.json([], { status: 200 });
  }
}
