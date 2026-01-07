"use client"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"

export default function CGPCalculator() {
    const [rows, setRows] = useState([
        { id: 1, course: "", credits: "", gradePoint: "" },
    ])
    const [currentCgpa, setCurrentCgpa] = useState("")
    const [currentCredits, setCurrentCredits] = useState("")
    const [repeatPolicy, setRepeatPolicy] = useState("include_all") // include_all | latest | highest

    const addRow = () => setRows((r) => [...r, { id: Date.now(), course: "", credits: "", gradePoint: "" }])
    const removeRow = (id) => setRows((r) => r.filter((x) => x.id !== id))
    const updateRow = (id, field, value) => setRows((r) => r.map((x) => (x.id === id ? { ...x, [field]: value } : x)))

    const compute = () => {
        // Handle repeat courses based on repeatPolicy:
        // - include_all: count every row
        // - latest: for rows with same non-empty course name, take the last attempt
        // - highest: for rows with same non-empty course name, take the attempt with highest gradePoint

        let totalCredits = 0
        let totalPoints = 0

        if (repeatPolicy === "include_all") {
            rows.forEach((row) => {
                const c = parseFloat(row.credits)
                const g = parseFloat(row.gradePoint)
                if (!isNaN(c) && !isNaN(g)) {
                    totalCredits += c
                    totalPoints += c * g
                }
            })
        } else {
            // group rows by course name (trimmed). Empty course names are treated as unique per row
            const groups = new Map()
            rows.forEach((row, idx) => {
                const key = row.course && row.course.trim() !== "" ? row.course.trim().toLowerCase() : `__ROW__${row.id}`
                if (!groups.has(key)) groups.set(key, [])
                groups.get(key).push({ row, idx })
            })

            // choose representative per group
            groups.forEach((entries) => {
                let chosen = null
                if (repeatPolicy === "latest") {
                    // last entry in original order
                    chosen = entries[entries.length - 1].row
                } else if (repeatPolicy === "highest") {
                    // pick entry with highest numeric gradePoint
                    chosen = entries.reduce((best, cur) => {
                        const gCur = parseFloat(cur.row.gradePoint)
                        const gBest = best ? parseFloat(best.gradePoint) : NaN
                        if (isNaN(gBest) && isNaN(gCur)) return best || cur.row
                        if (isNaN(gBest)) return cur.row
                        if (isNaN(gCur)) return best
                        return gCur > gBest ? cur.row : best
                    }, null)
                }

                if (chosen) {
                    const c = parseFloat(chosen.credits)
                    const g = parseFloat(chosen.gradePoint)
                    if (!isNaN(c) && !isNaN(g)) {
                        totalCredits += c
                        totalPoints += c * g
                    }
                }
            })
        }

        // include previously-earned credits/points if provided
        const prevCredits = parseFloat(currentCredits)
        const prevCgpa = parseFloat(currentCgpa)
        if (!isNaN(prevCredits) && !isNaN(prevCgpa) && prevCredits > 0) {
            totalCredits += prevCredits
            totalPoints += prevCredits * prevCgpa
        }

        const cgp = totalCredits > 0 ? totalPoints / totalCredits : 0
        return { totalCredits, totalPoints, cgp }
    }

    const { totalCredits, totalPoints, cgp } = compute()

    return (
        <div className="max-w-3xl mx-auto p-4 border rounded">
            <h2 className="text-lg font-medium mb-3">CGP Calculator</h2>
            <p className="text-sm text-muted-foreground mb-4">Enter course credits and grade points (e.g., A=4.0)</p>

            <div className="mb-3 flex items-center gap-4">
                <label className="text-sm">Repeat handling:</label>
                <select value={repeatPolicy} onChange={(e) => setRepeatPolicy(e.target.value)} className="p-2 border rounded">
                    <option value="include_all">Include all attempts</option>
                    <option value="latest">Use latest attempt</option>
                    <option value="highest">Use highest grade</option>
                </select>
                <div className="text-sm text-muted-foreground">(Groups by course name; empty names treated as unique)</div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-4 items-end">
                <div>
                    <label className="text-sm">Current CGPA (optional)</label>
                    <input value={currentCgpa} onChange={(e) => setCurrentCgpa(e.target.value)} placeholder="e.g. 3.25" className="w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="text-sm">Current total credits (optional)</label>
                    <input value={currentCredits} onChange={(e) => setCurrentCredits(e.target.value)} placeholder="e.g. 60" className="w-full p-2 border rounded" />
                </div>
            </div>

            <div className="space-y-3">
                {rows.map((row, idx) => (
                    <div key={row.id} className="grid grid-cols-12 gap-2 items-center">
                        <input
                            className="col-span-5 p-2 border rounded"
                            placeholder="Course name (optional)"
                            value={row.course}
                            onChange={(e) => updateRow(row.id, "course", e.target.value)}
                        />
                        <input
                            className="col-span-3 p-2 border rounded"
                            placeholder="Credits"
                            value={row.credits}
                            onChange={(e) => updateRow(row.id, "credits", e.target.value)}
                        />
                        <input
                            className="col-span-3 p-2 border rounded"
                            placeholder="Grade point"
                            value={row.gradePoint}
                            onChange={(e) => updateRow(row.id, "gradePoint", e.target.value)}
                        />
                        <div className="col-span-1">
                            <Button variant="ghost" onClick={() => removeRow(row.id)} size="sm">Remove</Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex gap-2">
                <Button onClick={addRow}>Add row</Button>
                <Button variant="outline" onClick={() => setRows([{ id: 1, course: "", credits: "", gradePoint: "" }])}>Reset</Button>
            </div>

            <div className="mt-4 p-3 border rounded bg-muted/5">
                <div className="flex justify-between text-sm">
                    <div>Total credits:</div>
                    <div>{totalCredits}</div>
                </div>
                <div className="flex justify-between text-sm">
                    <div>Total points:</div>
                    <div>{totalPoints.toFixed(2)}</div>
                </div>
                <div className="flex justify-between font-medium mt-2">
                    <div>CGP:</div>
                    <div>{isNaN(cgp) ? "-" : cgp.toFixed(2)}</div>
                </div>
            </div>
        </div>
    )
}
