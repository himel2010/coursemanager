"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, BookOpen, Award, BarChart3, PieChartIcon, LineChartIcon } from "lucide-react";

const COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6"];
const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export default function QuizAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    fetchAnalytics();
  }, [selectedCourse, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ days: timeRange });
      if (selectedCourse && selectedCourse !== "all") {
        params.append("courseId", selectedCourse);
      }
      
      const response = await fetch(`/api/quizzes/analytics?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-500">Loading analytics...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64 text-red-500">
          <span>Error: {error}</span>
        </CardContent>
      </Card>
    );
  }

  if (!analytics || analytics.summary?.totalAttempts === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Quiz Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64 text-gray-500">
          <BookOpen className="h-12 w-12 mb-4 text-gray-300" />
          <p className="text-lg font-medium">No quiz attempts yet</p>
          <p className="text-sm">Complete some quizzes to see your performance analytics</p>
        </CardContent>
      </Card>
    );
  }

  const { summary, courses, timeSeriesData, topicPerformance, coursePerformance, scoreDistribution, recentAttempts } = analytics;

  return (
    <div className="w-full space-y-6">
      {/* Header with Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Quiz Performance Analytics
              </CardTitle>
              <CardDescription>Track your quiz results and learning progress</CardDescription>
            </div>
            <div className="flex gap-3">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code || course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Quizzes</p>
                <p className="text-2xl font-bold">{summary.totalAttempts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-2xl font-bold">{summary.averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Accuracy</p>
                <p className="text-2xl font-bold">{summary.accuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Award className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Questions Answered</p>
                <p className="text-2xl font-bold">{summary.totalQuestions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            By Topic
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            By Course
          </TabsTrigger>
          <TabsTrigger value="distribution" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Distribution
          </TabsTrigger>
        </TabsList>

        {/* Progress Over Time */}
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Score Progress Over Time</CardTitle>
              <CardDescription>Your quiz performance trend over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {timeSeriesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value, name) => [
                        name === "averageScore" ? `${value}%` : value,
                        name === "averageScore" ? "Average Score" : "Attempts"
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="averageScore" 
                      name="Average Score"
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="attempts" 
                      name="Attempts"
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: "#10b981", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No data available for the selected time range
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance by Topic */}
        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Topic</CardTitle>
              <CardDescription>Compare your scores across different topics</CardDescription>
            </CardHeader>
            <CardContent>
              {topicPerformance.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart 
                    data={topicPerformance} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="topic" 
                      tick={{ fontSize: 11 }}
                      width={100}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value}%`,
                        name === "averageScore" ? "Average Score" : "Accuracy"
                      ]}
                      labelFormatter={(label) => topicPerformance.find(t => t.topic === label)?.fullTopic || label}
                    />
                    <Legend />
                    <Bar 
                      dataKey="averageScore" 
                      name="Average Score"
                      fill="#3b82f6" 
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar 
                      dataKey="accuracy" 
                      name="Accuracy"
                      fill="#10b981" 
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No topic data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance by Course */}
        <TabsContent value="courses">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Course</CardTitle>
              <CardDescription>Quiz performance distribution across courses</CardDescription>
            </CardHeader>
            <CardContent>
              {coursePerformance.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={coursePerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ shortName, percent }) => `${shortName} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="attempts"
                      >
                        {coursePerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} attempts`,
                          props.payload.courseName
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Course Breakdown</h4>
                    {coursePerformance.map((course, index) => (
                      <div key={course.courseId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                          />
                          <span className="text-sm font-medium">{course.shortName}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">{course.attempts} quizzes</span>
                          <span className="font-semibold text-blue-600">{course.averageScore}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  No course data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Score Distribution */}
        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
              <CardDescription>How your quiz scores are distributed</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={scoreDistribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${value} quizzes`, "Count"]} />
                  <Bar dataKey="count" name="Quizzes" radius={[4, 4, 0, 0]}>
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {scoreDistribution.map((entry, index) => (
                  <div key={entry.range} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index] }} />
                    <span className="text-xs text-gray-600">{entry.range}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Attempts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Quiz Attempts</CardTitle>
          <CardDescription>Your latest quiz results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Topic</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Course</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Questions</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Correct</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-600">Score</th>
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((attempt) => (
                  <tr key={attempt.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(attempt.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {attempt.topic.length > 30 ? attempt.topic.substring(0, 27) + "..." : attempt.topic}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{attempt.course}</td>
                    <td className="py-3 px-4 text-center">{attempt.totalQuestions}</td>
                    <td className="py-3 px-4 text-center">{attempt.correctAnswers}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        attempt.score >= 80 ? "bg-green-100 text-green-700" :
                        attempt.score >= 60 ? "bg-yellow-100 text-yellow-700" :
                        attempt.score >= 40 ? "bg-orange-100 text-orange-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {attempt.score}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentAttempts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No recent quiz attempts found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
