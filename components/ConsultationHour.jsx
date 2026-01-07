"use client";

import React, { useMemo, useState } from "react";

const FACULTY = [
    { id: "f1", name: "Dr. Aisha Khan", dept: "CSE" },
    { id: "f2", name: "Prof. Miguel Santos", dept: "Math" },
    { id: "f3", name: "Dr. Lin Wei", dept: "ECE" },
];

function formatDate(d) {
    return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatISO(d) {
    return d.toISOString().slice(0, 10);
}

function generateDummySlots(facultyId, days = 7) {
    const times = ["09:00", "10:00", "11:00", "14:00", "15:00"];
    const slots = [];
    const now = new Date();
    for (let i = 0; i < days; i++) {
        const day = new Date(now);
        day.setDate(now.getDate() + i);
        const dateISO = formatISO(day);
        times.forEach((t, idx) => {
            // Create deterministic-ish variability per faculty and day
            const seed = facultyId.charCodeAt(0) + i + idx;
            const taken = (seed % 3) === 0; // some slots taken
            slots.push({
                id: `${facultyId}-${dateISO}-${t}`,
                facultyId,
                date: dateISO,
                time: t,
                available: !taken,
            });
        });
    }
    return slots;
}

export default function ConsultationHour({ facultyList = [] }) {
    const availableFaculty = facultyList.length > 0 ? facultyList : FACULTY;
    const [selectedFaculty, setSelectedFaculty] = useState(availableFaculty[0]?.id || (FACULTY[0] && FACULTY[0].id));
    const [booked, setBooked] = useState({});
    const [selectedSlot, setSelectedSlot] = useState(null);

    const slots = useMemo(() => generateDummySlots(selectedFaculty, 7), [selectedFaculty]);

    const slotsByDate = useMemo(() => {
        const map = {};
        slots.forEach((s) => {
            // override availability if booked in session
            const isBooked = booked[s.id];
            const available = isBooked ? false : s.available;
            if (!map[s.date]) map[s.date] = [];
            map[s.date].push({ ...s, available });
        });
        return map;
    }, [slots, booked]);

    function handleConfirm() {
        if (!selectedSlot) return;
        setBooked((b) => ({ ...b, [selectedSlot.id]: true }));
        setSelectedSlot(null);
    }

    return (
        <div className="prose mx-auto py-8">
            <h1>Consultation Hour</h1>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Choose faculty</label>
                <select
                    value={selectedFaculty}
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                    className="mt-1 block w-full max-w-xs rounded-md border-gray-300 shadow-sm"
                >
                    {availableFaculty.map((f) => (
                        <option key={f.id} value={f.id}>{`${f.name} — ${f.designation || f.dept || ''}`}</option>
                    ))}
                </select>
            </div>

            <div>
                <h2 className="text-lg font-semibold">Available slots (dummy)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    {Object.keys(slotsByDate).map((date) => (
                        <div key={date} className="p-3 border rounded">
                            <div className="font-medium">{formatDate(new Date(date))}</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {slotsByDate[date].map((s) => (
                                    <button
                                        key={s.id}
                                        disabled={!s.available}
                                        onClick={() => setSelectedSlot(s)}
                                        className={`px-3 py-1 rounded-md text-sm border ${s.available ? (selectedSlot && selectedSlot.id === s.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-800 hover:bg-gray-100') : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                    >
                                        {s.time}{!s.available ? ' — Taken' : ''}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                <h3 className="font-medium">Selection</h3>
                {selectedSlot ? (
                    <div className="mt-2 p-3 border rounded">
                        <div>{`Faculty: ${availableFaculty.find(f => f.id === selectedSlot.facultyId)?.name || selectedSlot.facultyId}`}</div>
                        <div>{`Date: ${selectedSlot.date}`}</div>
                        <div>{`Time: ${selectedSlot.time}`}</div>
                        <div className="mt-3 flex gap-2">
                            <button onClick={handleConfirm} className="px-3 py-1 bg-green-600 text-white rounded">Confirm booking</button>
                            <button onClick={() => setSelectedSlot(null)} className="px-3 py-1 border rounded">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <div className="mt-2 text-sm text-gray-600">No slot selected.</div>
                )}
            </div>

            <div className="mt-6">
                <h3 className="font-medium">Booked in this session</h3>
                <ul className="mt-2 list-disc list-inside text-sm">
                    {Object.keys(booked).length === 0 && <li className="text-gray-600">No bookings yet.</li>}
                    {Object.keys(booked).map((id) => (
                        <li key={id} className="text-sm">{id}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
