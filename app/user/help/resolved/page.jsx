"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth/AuthContext"
import SaveToHelpButton from "@/components/SaveToHelpButton"

export default function ResolvedQNAPage() {
    const [selectedCourseId, setSelectedCourseId] = useState("")
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const { userProfile, courses, loading: authLoading } = useAuth()

    // Fetch resolved posts when course is selected
    useEffect(() => {
        if (selectedCourseId) {
            fetchResolvedPosts(selectedCourseId)
        } else {
            setPosts([])
        }
    }, [selectedCourseId])

    async function fetchResolvedPosts(courseOfferedId) {
        try {
            setLoading(true)
            setError(null)
            const res = await fetch(`/api/help-posts?scope=course&courseOfferedId=${encodeURIComponent(courseOfferedId)}&isResolved=true`)
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                setError(err.error || "Failed to load resolved posts")
                setPosts([])
                return
            }
            const data = await res.json()
            // Transform server posts to client shape
            const mapped = (data || []).map((p) => ({
                id: p.id,
                title: p.title,
                body: p.content,
                createdAt: p.createdAt,
                isResolved: p.isResolved,
                author: p.author,
                comments: (p.comments || []).map((c) => ({ id: c.id, text: c.content ?? c.text ?? "", createdAt: c.createdAt, author: c.author }))
            }))
            setPosts(mapped)
        } catch (err) {
            console.error(err)
            setError("Failed to load resolved posts")
            setPosts([])
        } finally {
            setLoading(false)
        }
    }

    if (authLoading) {
        return <div className="max-w-4xl mx-auto py-12 px-4">Loading...</div>
    }

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-bold">Resolved QNA</h1>
                    <p className="text-gray-600 mt-1">
                        Browse resolved questions and answers for future reference.
                    </p>
                </div>
                <Link
                    href="/community/help"
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                    Back to Help
                </Link>
            </div>

            {/* Course Selector */}
            <div className="mb-8">
                <label className="block mb-2 font-medium">Select Course</label>
                <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full max-w-md p-2 border border-gray-300 rounded"
                >
                    <option value="">Choose a course...</option>
                    {(courses || []).map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.course?.code} - {course.course?.name}
                        </option>
                    ))}
                </select>
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            {loading ? (
                <p>Loading resolved posts...</p>
            ) : posts.length === 0 ? (
                <p className="text-gray-600">
                    {selectedCourseId ? "No resolved posts yet for this course." : "Select a course to view resolved QNA."}
                </p>
            ) : (
                <div className="space-y-6">
                    {posts.map((p) => (
                        <div key={p.id} className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-semibold">{p.title}</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-green-600 font-semibold bg-green-100 px-2 py-1 rounded text-sm">Resolved</span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(p.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap mb-4">{p.body}</p>

                            {/* Comments Section */}
                            {p.comments.length > 0 && (
                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-2">Answers & Discussion:</h4>
                                    <div className="space-y-3">
                                        {p.comments.map((c) => (
                                            <div key={c.id} className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                                                <p className="text-gray-800 whitespace-pre-wrap">{c.text}</p>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {c.author?.name || "Anonymous"} • {new Date(c.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Save to Help Button */}
                            <div className="mt-4 pt-4 border-t">
                                <SaveToHelpButton 
                                    forumPost={{ id: p.id, title: p.title, content: p.body }} 
                                    courseId={selectedCourseId}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}