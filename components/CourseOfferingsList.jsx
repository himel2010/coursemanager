"use client"
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast, Toaster } from "sonner"
import { useAuth } from "@/lib/auth/AuthContext"

export default function CourseOfferingsList({ initial }) {
    const [items, setItems] = useState(initial || [])
    const { courses, refreshUserProfile } = useAuth()
    const [showBooked, setShowBooked] = useState(false)
    const [loadingIds, setLoadingIds] = useState(new Set())

    const Spinner = ({ className = "h-4 w-4" }) => (
        <svg
            className={"animate-spin text-current " + className}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
    )

    const book = async (id) => {
        if (loadingIds.has(id)) return
        // client-side enforcement of 5-course limit
        const enrolledCount = courses ? courses.length : items.filter((it) => it.enrolled).length
        if (enrolledCount >= 5) {
            toast.error("Cannot enroll: maximum of 5 courses reached")
            return
        }
        setLoadingIds((s) => new Set(s).add(id))
        try {
            const res = await fetch("/api/enroll", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseOfferedId: id }),
            })
            const json = await res.json()
            if (!res.ok) {
                toast.error(json.error || "Failed to book")
            } else {
                toast.success("Enrolled successfully")
                setItems((prev) => prev.map((it) => (it.id === id ? { ...it, enrolled: true } : it)))
            }
        } catch (err) {
            toast.error("Network error")
        } finally {
            setLoadingIds((s) => {
                const ns = new Set(s)
                ns.delete(id)
                return ns
            })
        }
    }

    const unenroll = async (id) => {
        if (loadingIds.has(id)) return
        setLoadingIds((s) => new Set(s).add(id))
        try {
            const res = await fetch("/api/enroll", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseOfferedId: id }),
            })
            const json = await res.json()
            if (!res.ok) {
                toast.error(json.error || "Failed to remove enrollment")
            } else {
                toast.success("Enrollment removed")
                setItems((prev) => prev.map((it) => (it.id === id ? { ...it, enrolled: false } : it)))
                // Refresh auth profile so other UI updates reflect change
                try { refreshUserProfile && refreshUserProfile() } catch (e) { }
            }
        } catch (err) {
            toast.error("Network error")
        } finally {
            setLoadingIds((s) => {
                const ns = new Set(s)
                ns.delete(id)
                return ns
            })
        }
    }

    // When auth context provides enrolled courses, mark items as enrolled
    useEffect(() => {
        if (!courses || courses.length === 0) return
        setItems((prev) => prev.map((it) => ({ ...it, enrolled: !!courses.find((c) => c.id === it.id) })))
    }, [courses])

    return (
        <div>
            <Toaster position="bottom-right" />
            <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{items.length} offerings</div>
                <div>
                    <Button variant={showBooked ? "default" : "outline"} onClick={() => setShowBooked((s) => !s)}>
                        {showBooked ? "Showing booked" : "Show booked"}
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                    const displayed = items.filter((it) => (showBooked ? it.enrolled : true))
                    if (displayed.length === 0) {
                        return (
                            <div className="p-6 border rounded col-span-1 md:col-span-2 text-center text-sm text-muted-foreground">
                                {showBooked ? "No booked courses found." : "No course offerings found."}
                            </div>
                        )
                    }

                    return displayed.map((off) => (
                        <div key={off.id} className="p-4 border rounded">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-medium">
                                        <Link href={`/course-offerings/${off.id}`} className="hover:underline">
                                            {off.course.code} — Section {off.section}
                                        </Link>
                                    </div>
                                    <div className="text-sm text-muted-foreground">{off.course.title}</div>
                                    <div className="text-sm">Semester: {off.semester?.season} {off.semester?.year}</div>
                                </div>
                                <div className="flex gap-2">
                                    {off.enrolled ? (
                                        <>
                                            <Button disabled={loadingIds.has(off.id)} onClick={() => unenroll(off.id)}>
                                                {loadingIds.has(off.id) ? (
                                                    <span className="flex items-center">
                                                        <Spinner className="h-4 w-4 mr-2" />
                                                        Processing
                                                    </span>
                                                ) : (
                                                    "Remove"
                                                )}
                                            </Button>
                                            <span className="text-sm text-muted-foreground ml-2">Enrolled</span>
                                        </>
                                    ) : (
                                        <Button disabled={loadingIds.has(off.id)} onClick={() => book(off.id)}>
                                            {loadingIds.has(off.id) ? (
                                                <span className="flex items-center">
                                                    <Spinner className="h-4 w-4 mr-2" />
                                                    Processing
                                                </span>
                                            ) : (
                                                "Book"
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                })()}
            </div>
        </div>
    )
}
