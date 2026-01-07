"use client"
import React, { useState } from "react"

export default function EvaluationForm({ courses = [], faculty = [] }) {
    const [targetType, setTargetType] = useState("course")
    const [targetId, setTargetId] = useState("")
    const [targetName, setTargetName] = useState("")
    const [rating, setRating] = useState(5)
    const [comments, setComments] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const payload = {
            targetType,
            targetId: targetId || null,
            targetName: targetName || (targetType === "course" ? "" : ""),
            rating: Number(rating),
            comments,
            user: "anonymous",
        }
        if (!payload.targetName && targetId) {
            // try to resolve name from provided lists
            if (targetType === "course") {
                const c = courses.find((x) => x.id === targetId)
                if (c) payload.targetName = `${c.course.code} — Section ${c.section}`
            } else {
                const f = faculty.find((x) => x.email === targetId || x.initial === targetId || x.name === targetId)
                if (f) payload.targetName = f.name || f.initial || f.email
            }
        }

        try {
            const res = await fetch("/api/evaluations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error("failed")
            setComments("")
            setRating(5)
            // client-only: no server callback
            alert("Evaluation submitted")
        } catch (err) {
            alert("Failed to submit evaluation")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded">
            <div className="flex gap-2">
                <label className="flex items-center gap-2">
                    <input type="radio" name="type" value="course" checked={targetType === "course"} onChange={() => { setTargetType('course'); setTargetId(''); setTargetName('') }} /> Course
                </label>
                <label className="flex items-center gap-2">
                    <input type="radio" name="type" value="faculty" checked={targetType === "faculty"} onChange={() => { setTargetType('faculty'); setTargetId(''); setTargetName('') }} /> Faculty
                </label>
            </div>

            {targetType === "course" ? (
                <div>
                    <label className="text-sm">Select course</label>
                    <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className="w-full border rounded px-2 py-1">
                        <option value="">-- choose course --</option>
                        {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.course.code} — Section {c.section}</option>
                        ))}
                    </select>
                </div>
            ) : (
                <div>
                    <label className="text-sm">Select faculty</label>
                    <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className="w-full border rounded px-2 py-1">
                        <option value="">-- choose faculty --</option>
                        {faculty.map((f, idx) => (
                            <option key={idx} value={f.name}>{f.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <label className="text-sm">Rating (1-5)</label>
                <input type="number" min="1" max="5" value={rating} onChange={e => setRating(e.target.value)} className="w-24 border rounded px-2 py-1" />
            </div>

            <div>
                <label className="text-sm">Comments</label>
                <textarea value={comments} onChange={e => setComments(e.target.value)} className="w-full border rounded px-2 py-1" rows={4} />
                {/* no server-provided callback; client components should refresh themselves */}
            </div>

            <div>
                <button type="submit" disabled={loading} className="px-3 py-1 border rounded">
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </div>
        </form>
    )
}
