"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth/AuthContext"

// Key generator
function storageKey(scope, course) {
    if (scope === "course") {
        return `help_posts_course_${course?.trim() || "unspecified"}`
    }
    return "help_posts_career"
}

export default function HelpPage() {
    const [scope, setScope] = useState("course")
    const [course, setCourse] = useState("") // used for career localStorage key only
    const [selectedCourseId, setSelectedCourseId] = useState("") // courseOfferedId for server calls
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [posts, setPosts] = useState([])
    const [commentTexts, setCommentTexts] = useState({}) // Store temporary comment inputs
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const { user, userProfile, courses, loading: authLoading } = useAuth()

    // Fetch posts from server (course scope) or localStorage (career scope)
    useEffect(() => {
        // If course scope, load from API when a course is selected
        if (scope === "course") {
            if (!selectedCourseId) {
                setPosts([])
                return
            }
            fetchPostsFromApi(selectedCourseId)
            return
        }

        // career scope -> localStorage
        const key = storageKey(scope, course)
        const saved = localStorage.getItem(key)
        const parsed = saved ? JSON.parse(saved) : []
        const normalized = parsed.map((p) => ({
            ...p,
            isResolved: p.isResolved || false,
            comments: Array.isArray(p.comments)
                ? p.comments.map((c) => ({
                    id: c.id ?? Date.now(),
                    text: c.text ?? c.content ?? String(c ?? ""),
                    createdAt: c.createdAt ?? new Date().toISOString(),
                }))
                : [],
        }))
        setPosts(normalized)
    }, [scope, course, user])

    async function fetchPostsFromApi(courseOfferedId) {
        try {
            setLoading(true)
            setError(null)
            const res = await fetch(`/api/help-posts?scope=course&courseOfferedId=${encodeURIComponent(courseOfferedId)}`)
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                setError(err.error || "Failed to load posts from server")
                setPosts([])
                return
            }
            const data = await res.json()
            // Transform server posts to client shape (comments: {id, text, createdAt})
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
            setError("Failed to load posts from server")
            setPosts([])
        } finally {
            setLoading(false)
        }
    }

    // Save posts to localStorage
    function savePosts(updatedPosts) {
        const key = storageKey(scope, course)
        localStorage.setItem(key, JSON.stringify(updatedPosts))
    }

    // Handle new post submission
    async function handleSubmit(e) {
        e.preventDefault()
        if (!title.trim() || !body.trim()) return

        if (scope === "course") {
            if (!selectedCourseId) {
                setError("Please select a course")
                return
            }
            if (!user) {
                setError("Please sign in to post")
                return
            }

            try {
                setLoading(true)
                setError(null)
                const res = await fetch("/api/help-posts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        courseOfferedId: selectedCourseId,
                        authorId: user.id,
                        title: title.trim(),
                        content: body.trim()
                    })
                })

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}))
                    setError(err.error || "Failed to create post")
                    return
                }

                // Refresh posts from server
                setTitle("")
                setBody("")
                await fetchPostsFromApi(selectedCourseId)
            } catch (err) {
                console.error(err)
                setError("Failed to create post")
            } finally {
                setLoading(false)
            }

            return
        }

        // career scope: localStorage behaviour
        const newPost = {
            id: Date.now(),
            scope,
            course: null,
            title: title.trim(),
            body: body.trim(),
            isResolved: false,
            createdAt: new Date().toISOString(),
            comments: []
        }
        const updated = [newPost, ...posts]
        setPosts(updated)
        savePosts(updated)
        setTitle("")
        setBody("")
    }

    // Handle clearing all posts
    function handleClear() {
        const key = storageKey(scope, course)
        const label = scope === "course" ? (course || "(unspecified)") : "Research/Career"
        if (!confirm(`Clear all posts for ${label}?`)) return
        localStorage.removeItem(key)
        setPosts([])
    }

    // Handle adding a comment to a post
    async function handleAddComment(postId) {
        const text = commentTexts[postId]?.trim()
        if (!text) return

        // If course-scoped post, post to server
        if (scope === "course") {
            if (!user) {
                setError("Please sign in to comment")
                return
            }

            try {
                setLoading(true)
                setError(null)
                const res = await fetch(`/api/help-posts/${encodeURIComponent(postId)}/comments`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ authorId: user.id, content: text })
                })

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}))
                    setError(err.error || "Failed to add comment")
                    return
                }

                // refresh posts from server
                await fetchPostsFromApi(selectedCourseId)
                setCommentTexts({ ...commentTexts, [postId]: "" })
            } catch (err) {
                console.error(err)
                setError("Failed to add comment")
            } finally {
                setLoading(false)
            }

            return
        }

        // career scope -> localStorage
        const addedComment = { id: Date.now(), text, createdAt: new Date().toISOString() }
        const updated = posts.map((p) => {
            if (p.id === postId) {
                const existingComments = Array.isArray(p.comments) ? p.comments : []
                return {
                    ...p,
                    comments: [...existingComments, addedComment],
                }
            }
            return p
        })

        setPosts(updated)
        savePosts(updated)
        setCommentTexts({ ...commentTexts, [postId]: "" }) // Clear input
    }

    const handleResolve = async (postId) => {
        if (!user) {
            setError("Please sign in")
            return
        }

        if (scope === "course") {
            try {
                setLoading(true)
                setError(null)
                const res = await fetch(`/api/help-posts/${postId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isResolved: true, userId: user.id })
                })

                if (!res.ok) {
                    const err = await res.json().catch(() => ({}))
                    setError(err.error || "Failed to resolve post")
                    return
                }

                // Update local state
                setPosts(posts.map(p => p.id === postId ? { ...p, isResolved: true } : p))
            } catch (err) {
                console.error(err)
                setError("Failed to resolve post")
            } finally {
                setLoading(false)
            }
        } else {
            // career scope: localStorage
            const updated = posts.map(p => p.id === postId ? { ...p, isResolved: true } : p)
            setPosts(updated)
            savePosts(updated)
        }
    }

    // When switching scope to career, clear course input to avoid confusion
    useEffect(() => {
        if (scope === "career") setCourse("")
    }, [scope])

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-4">Course Help</h1>
            <p className="text-gray-600 mb-6">
                Select a scope and post problems so classmates and mentors can help.
            </p>

            <div className="mb-8 grid md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">

                        <label className="block mb-4">
                            <span className="text-sm font-medium">Scope</span>
                            <select
                                value={scope}
                                onChange={(e) => setScope(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-200"
                            >
                                <option value="course">Course</option>
                                <option value="career">Research / Career</option>
                            </select>
                        </label>

                        {scope === "course" && (
                            <label className="block mb-2">
                                <span className="text-sm font-medium">Select Course (enrolled)</span>
                                {authLoading ? (
                                    <div className="mt-1 text-sm text-gray-500">Loading courses...</div>
                                ) : (courses && courses.length > 0) ? (
                                    <select
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-200"
                                    >
                                        <option value="">-- Select a course --</option>
                                        {courses.map((co) => (
                                            <option key={co.id} value={co.id}>
                                                {co.course?.code || co.courseCode || co.code} {co.section ? `- ${co.section}` : ""}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="mt-1 text-sm text-red-500">No enrolled courses found. You can switch to Research/Career scope.</div>
                                )}
                            </label>
                        )}

                        <label className="block mb-2">
                            <span className="text-sm font-medium">Problem Title</span>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Short summary"
                                className="mt-1 block w-full rounded-md border-gray-200"
                            />
                        </label>

                        <label className="block mb-4">
                            <span className="text-sm font-medium">Details</span>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={5}
                                placeholder="Describe the problem"
                                className="mt-1 block w-full rounded-md border-gray-200"
                            />
                        </label>

                        <div className="flex gap-2">
                            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                                Post
                            </button>

                            <button
                                type="button"
                                onClick={() => { setTitle(""); setBody("") }}
                                className="px-4 py-2 rounded border"
                            >
                                Clear
                            </button>

                            <button
                                type="button"
                                onClick={handleClear}
                                className="ml-auto text-sm text-red-600"
                            >
                                Clear All
                            </button>
                        </div>

                    </form>
                </div>

                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="font-semibold mb-2">Quick Tips</h3>
                        <ul className="text-sm text-gray-600 list-disc ml-5">
                            <li>Include screenshots/code.</li>
                            <li>Mention course and section.</li>
                            <li>Be respectful and clear.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4">
                    {scope === "course"
                        ? (selectedCourseId ? `Help Posts - ${(courses || []).find(c => c.id === selectedCourseId)?.course?.code || "Course"}` : "Select a course to view posts")
                        : "Career / Research Posts"}
                </h2>

                {posts.length === 0 ? (
                    <p className="text-gray-600">No posts yet.</p>
                ) : (
                    <div className="space-y-4">
                        {posts.map((p) => (
                            <div key={p.id} className="bg-white p-4 rounded shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <strong>{p.title}</strong>
                                    <div className="flex items-center gap-2">
                                        {p.isResolved && <span className="text-green-600 font-semibold">Resolved</span>}
                                        <span className="text-xs text-gray-500">
                                            {new Date(p.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap mb-2">{p.body}</p>

                                {/* Resolve Button */}
                                {!p.isResolved && (!p.author || user?.id === p.author.id || userProfile?.role === "ADMIN") && (
                                    <button
                                        onClick={() => handleResolve(p.id)}
                                        className="mb-2 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                    >
                                        Mark as Resolved
                                    </button>
                                )}

                                {/* Comments Section */}
                                <div className="mt-2 border-t pt-2">
                                    {p.comments.length > 0 && (
                                        <div className="space-y-1 mb-2">
                                            {p.comments.map((c) => (
                                                <div key={c.id} className="text-sm text-gray-700 pl-2 border-l-2 border-gray-300">
                                                    {c.text}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Add a comment..."
                                            className="flex-1 rounded border-gray-200 border px-2 py-1"
                                            value={commentTexts[p.id] || ""}
                                            onChange={(e) =>
                                                setCommentTexts({ ...commentTexts, [p.id]: e.target.value })
                                            }
                                        />
                                        <button
                                            type="button"
                                            className="bg-green-600 text-white px-3 rounded"
                                            onClick={() => handleAddComment(p.id)}
                                        >
                                            Comment
                                        </button>
                                    </div>
                                </div>
                                {/* End Comments */}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
