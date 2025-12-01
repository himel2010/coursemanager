"use client"

import Header from "@/components/shadcn-studio/blocks/hero-section-01/header"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

function storageKey(scope, course) {
    if (scope === "course") {
        return `help_posts_course_${course?.trim() || "unspecified"}`
    }
    // scope === "career" (research/career)
    return `help_posts_career`
}

const navigationData = [
    {
        title: "Home",
        href: "/",
    },
    {
        title: "Dashboard",
        href: "/user-dashboard",
    },
    {
        title: "Community",
        href: "/community",
    },
]

export default function HelpPage() {
    const [scope, setScope] = useState("course")
    const [course, setCourse] = useState("")
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [posts, setPosts] = useState([])

    useEffect(() => {
        const key = storageKey(scope, course)
        const raw = localStorage.getItem(key)
        setPosts(raw ? JSON.parse(raw) : [])
    }, [scope, course])

    function savePosts(next) {
        const key = storageKey(scope, course)
        localStorage.setItem(key, JSON.stringify(next))
    }

    function handleSubmit(e) {
        e.preventDefault()
        // For course scope, course is required. For career scope, course is not used.
        if ((scope === "course" && !course.trim()) || !title.trim() || !body.trim()) return
        const next = [
            { id: Date.now(), scope, course: course.trim() || null, title: title.trim(), body: body.trim(), createdAt: new Date().toISOString() },
            ...posts,
        ]
        setPosts(next)
        savePosts(next)
        setTitle("")
        setBody("")
    }

    function handleClear() {
        const key = storageKey(scope, course)
        if (!confirm(`Clear all posts for ${scope === "course" ? course || "unspecified" : "Research/Career"}?`)) return
        setPosts([])
        localStorage.removeItem(key)
    }

    return (
        <div>
            <Header navigationData={navigationData} />
            <div className="p-8 max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Help</h1>
                <p className="text-gray-600 mb-6">Select a scope and post problems or career/research questions so classmates and mentors can help.</p>

                <div className="mb-8 grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
                            <label className="block mb-4">
                                <span className="text-sm font-medium">Scope</span>
                                <select value={scope} onChange={(e) => setScope(e.target.value)} className="mt-1 block w-full rounded-md border-gray-200">
                                    <option value="course">Course</option>
                                    <option value="career">Research / Career</option>
                                </select>
                            </label>

                            {scope === "course" && (
                                <label className="block mb-2">
                                    <span className="text-sm font-medium">Course Code</span>
                                    <Input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g., CSE101" className="mt-1" />
                                </label>
                            )}

                            <label className="block mb-2">
                                <span className="text-sm font-medium">Problem Title</span>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short summary" className="mt-1" />
                            </label>

                            <label className="block mb-4">
                                <span className="text-sm font-medium">Details</span>
                                <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="Describe the problem and what you've tried" className="mt-1" />
                            </label>

                            <div className="flex gap-2">
                                <Button type="submit">Post</Button>
                                <Button variant="outline" type="button" onClick={() => { setTitle(""); setBody("") }}>Clear</Button>
                                <Button variant="ghost" type="button" onClick={handleClear} className="ml-auto" >Clear All for {scope === "course" ? "Course" : "Research/Career"}</Button>
                            </div>
                        </form>
                    </div>

                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-semibold mb-2">Quick Tips</h3>
                            <ul className="text-sm text-gray-600 list-disc ml-5">
                                <li>Include code snippets or screenshots where helpful.</li>
                                <li>Mention course and section for context (if course scope).</li>
                                <li>Be respectful and constructive.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-semibold mb-4">Posts for {scope === "course" ? (course || "(unspecified)") : "Research / Career"}</h2>
                    {posts.length === 0 ? (
                        <p className="text-gray-600">No posts yet. Be the first to ask for help.</p>
                    ) : (
                        <div className="space-y-4">
                            {posts.map((p) => (
                                <div key={p.id} className="bg-white p-4 rounded shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <strong>{p.title}</strong>
                                        <span className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{p.body}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
