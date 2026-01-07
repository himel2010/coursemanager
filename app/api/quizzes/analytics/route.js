import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const supabase = await createClient();
    const authData = await supabase.auth.getUser();
    const userId = authData.data?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const days = parseInt(searchParams.get("days")) || 30;

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build the where clause for notes filtering
    const noteFilter = courseId ? { courseId } : {};

    // Get all quiz attempts for the user within the date range
    const attempts = await db.quizAttempt.findMany({
      where: {
        userId,
        createdAt: { gte: startDate },
        note: noteFilter,
      },
      include: {
        note: {
          select: {
            id: true,
            title: true,
            topic: true,
            courseId: true,
            course: {
              select: {
                id: true,
                title: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Get user's courses that have notes with quiz attempts
    const courses = await db.course.findMany({
      where: {
        notes: {
          some: {
            userId,
            quizAttempts: { some: {} },
          },
        },
      },
      select: {
        id: true,
        title: true,
        code: true,
      },
    });

    // Calculate overall statistics
    const totalAttempts = attempts.length;
    const averageScore = totalAttempts > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
      : 0;
    const totalQuestions = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);
    const totalCorrect = attempts.reduce((sum, a) => sum + (a.correctAnswers || Math.round(a.totalQuestions * a.score / 100)), 0);

    // Group attempts by date for time series chart
    const scoresByDate = {};
    attempts.forEach((attempt) => {
      const dateKey = attempt.createdAt.toISOString().split("T")[0];
      if (!scoresByDate[dateKey]) {
        scoresByDate[dateKey] = { scores: [], count: 0 };
      }
      scoresByDate[dateKey].scores.push(attempt.score);
      scoresByDate[dateKey].count++;
    });

    const timeSeriesData = Object.entries(scoresByDate)
      .map(([date, data]) => ({
        date,
        averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        attempts: data.count,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Group by topic for performance by topic
    const topicStats = {};
    attempts.forEach((attempt) => {
      const topic = attempt.note?.topic || attempt.note?.title || "Uncategorized";
      if (!topicStats[topic]) {
        topicStats[topic] = { scores: [], attempts: 0, totalQuestions: 0, correctAnswers: 0 };
      }
      topicStats[topic].scores.push(attempt.score);
      topicStats[topic].attempts++;
      topicStats[topic].totalQuestions += attempt.totalQuestions;
      topicStats[topic].correctAnswers += attempt.correctAnswers || Math.round(attempt.totalQuestions * attempt.score / 100);
    });

    const topicPerformance = Object.entries(topicStats)
      .map(([topic, data]) => ({
        topic: topic.length > 25 ? topic.substring(0, 22) + "..." : topic,
        fullTopic: topic,
        averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        attempts: data.attempts,
        accuracy: data.totalQuestions > 0
          ? Math.round((data.correctAnswers / data.totalQuestions) * 100)
          : 0,
      }))
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 10);

    // Group by course for course comparison
    const courseStats = {};
    attempts.forEach((attempt) => {
      const courseKey = attempt.note?.course?.id || "uncategorized";
      const courseName = attempt.note?.course?.title || "Uncategorized";
      const courseCode = attempt.note?.course?.code || "";
      if (!courseStats[courseKey]) {
        courseStats[courseKey] = { 
          name: courseName, 
          code: courseCode,
          scores: [], 
          attempts: 0 
        };
      }
      courseStats[courseKey].scores.push(attempt.score);
      courseStats[courseKey].attempts++;
    });

    const coursePerformance = Object.entries(courseStats)
      .map(([id, data]) => ({
        courseId: id,
        courseName: data.code ? `${data.code} - ${data.name}` : data.name,
        shortName: data.code || data.name.substring(0, 15),
        averageScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        attempts: data.attempts,
      }))
      .sort((a, b) => b.attempts - a.attempts);

    // Score distribution for histogram
    const scoreDistribution = [
      { range: "0-20", count: 0 },
      { range: "21-40", count: 0 },
      { range: "41-60", count: 0 },
      { range: "61-80", count: 0 },
      { range: "81-100", count: 0 },
    ];
    attempts.forEach((attempt) => {
      if (attempt.score <= 20) scoreDistribution[0].count++;
      else if (attempt.score <= 40) scoreDistribution[1].count++;
      else if (attempt.score <= 60) scoreDistribution[2].count++;
      else if (attempt.score <= 80) scoreDistribution[3].count++;
      else scoreDistribution[4].count++;
    });

    // Recent attempts for table display
    const recentAttempts = attempts
      .slice(-10)
      .reverse()
      .map((a) => ({
        id: a.id,
        date: a.createdAt.toISOString(),
        topic: a.note?.topic || a.note?.title || "Unknown",
        course: a.note?.course?.code || "N/A",
        score: a.score,
        totalQuestions: a.totalQuestions,
        correctAnswers: a.correctAnswers || Math.round(a.totalQuestions * a.score / 100),
      }));

    return NextResponse.json({
      success: true,
      summary: {
        totalAttempts,
        averageScore,
        totalQuestions,
        totalCorrect,
        accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
      },
      courses,
      timeSeriesData,
      topicPerformance,
      coursePerformance,
      scoreDistribution,
      recentAttempts,
    });
  } catch (error) {
    console.error("Error fetching quiz analytics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
