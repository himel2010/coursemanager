"use client"
import React, { useEffect, useState } from "react"

export default function EvaluationList() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)

    const load = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/evaluations")
            const json = await res.json()
            setItems(Array.isArray(json) ? json.sort((a, b) => b.createdAt - a.createdAt) : [])
        } catch (e) {
            setItems([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    return (
        <div className="p-4 border rounded space-y-3">
            <div className="flex justify-between items-center">
                <div className="text-sm">Evaluations ({items.length})</div>
                <button onClick={load} className="px-2 py-1 border rounded text-sm">Refresh</button>
            </div>
            {loading ? <div>Loading...</div> : (
                items.length === 0 ? <div className="text-sm text-muted-foreground">No evaluations yet.</div> : (
                    <ul className="space-y-2">
                        {items.map(it => (
                            <li key={it.id} className="border rounded p-2">
                                <div className="text-sm font-medium">{it.targetName} <span className="text-xs text-muted-foreground">({it.targetType})</span></div>
                                <div className="text-sm">Rating: {it.rating}</div>
                                {it.comments && <div className="text-sm mt-1">{it.comments}</div>}
                                <div className="text-xs text-muted-foreground mt-1">By {it.user} • {new Date(it.createdAt).toLocaleString()}</div>
                            </li>
                        ))}
                    </ul>
                )
            )}
        </div>
    )
}
