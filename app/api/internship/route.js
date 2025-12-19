import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const supervisorId = searchParams.get("supervisorId");
    const company = searchParams.get("company");
    const department = searchParams.get("department");

    const whereClause = {
      isOpen: true,
    };

    if (supervisorId) {
      whereClause.supervisorId = supervisorId;
    }

    if (company) {
      whereClause.company = {
        contains: company,
        mode: "insensitive",
      };
    }

    if (department) {
      whereClause.supervisor = {
        department: {
          contains: department,
          mode: "insensitive",
        },
      };
    }

    const internshipSlots = await prisma.internshipSlot.findMany({
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
    const enrichedSlots = internshipSlots.map((slot) => ({
      ...slot,
      availableSlots:
        slot.supervisor.maxInternshipSlots - slot.applications.length,
      totalApplications: slot.applications.length,
    }));

    return NextResponse.json(enrichedSlots, { status: 200 });
  } catch (error) {
    console.error("Error fetching internship slots:", error);
    // Return empty array on error instead of error object
    return NextResponse.json([], { status: 200 });
  }
}
