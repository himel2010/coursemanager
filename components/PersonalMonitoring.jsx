"use client";

import React, { useEffect, useMemo, useState } from "react";

function formatDateTime(dateISO, time) {
    const d = new Date(`${dateISO}T${time}:00`);
    return d.toLocaleString();
}

function downloadCSV(rows, filename = "bookings.csv") {
    const header = Object.keys(rows[0] || {}).join(",") + "\n";
    const body = rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export default function PersonalMonitoring({ facultyList = [] }) {
    const [bookings, setBookings] = useState([]);
    const [showPast, setShowPast] = useState(false);
    const [demoFacultyId, setDemoFacultyId] = useState(facultyList[0]?.id || 'demo');
    const tomorrowISO = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })();
    const [demoDate, setDemoDate] = useState(tomorrowISO);
    const [demoTime, setDemoTime] = useState('10:00');
    const [demoNote, setDemoNote] = useState('');

    function dedupeBookings(bs) {
        const seen = new Set();
        const out = [];
        for (const b of bs) {
            if (!b || !b.id) continue;
            if (seen.has(b.id)) continue;
            seen.add(b.id);
            out.push(b);
        }
        return out;
    }

    useEffect(() => {
        // load session bookings from localStorage (simulate persistence)
        try {
            const raw = localStorage.getItem("pm_bookings");
            if (raw) setBookings(JSON.parse(raw));
        } catch (err) {
            // ignore
        }
    }, []);

    // dedupe whenever bookings change (keep state stable if already unique)
    useEffect(() => {
        const deduped = dedupeBookings(bookings);
        if (deduped.length !== bookings.length) setBookings(deduped);
    }, [bookings]);

    useEffect(() => {
        try {
            localStorage.setItem("pm_bookings", JSON.stringify(bookings));
        } catch (err) { }
    }, [bookings]);

    const upcoming = useMemo(() => {
        const now = new Date();
        return bookings.filter(b => {
            const dt = new Date(`${b.date}T${b.time}:00`);
            return showPast ? true : dt >= now;
        }).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    }, [bookings, showPast]);

    // ensure rendering uses unique entries by id (safety against duplicates)
    const uniqueUpcoming = useMemo(() => {
        const seen = new Set();
        const out = [];
        for (const b of upcoming) {
            if (!b || !b.id) continue;
            if (seen.has(b.id)) continue;
            seen.add(b.id);
            out.push(b);
        }
        return out;
    }, [upcoming]);

    function cancelBooking(id) {
        setBookings(bs => bs.filter(b => b.id !== id));
    }

    function exportBookings() {
        if (!bookings.length) return;
        downloadCSV(bookings.map(b => ({ id: b.id, faculty: b.facultyName, date: b.date, time: b.time })));
    }

    return (
        <div className="prose mx-auto py-8">
            <h1>Personal Monitoring</h1>

            <div className="mb-4">
                <div className="flex items-center gap-4">
                    <button onClick={exportBookings} className="px-3 py-1 bg-blue-600 text-white rounded">Export bookings</button>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showPast} onChange={(e) => setShowPast(e.target.checked)} /> Show past</label>
                </div>
            </div>

            <section className="mt-4">
                <h2 className="text-lg font-medium">Upcoming consultations</h2>
                {upcoming.length === 0 ? (
                    <div className="text-sm text-gray-600 mt-2">No upcoming consultations. Use the Consultation Hour page to book one.</div>
                ) : (
                    <ul className="mt-3 space-y-2">
                        {upcoming.map(b => (
                            <li key={b.id} className="p-3 border rounded flex items-start justify-between">
                                <div>
                                    <div className="font-medium">{b.facultyName}</div>
                                    <div className="text-sm text-gray-600">{formatDateTime(b.date, b.time)}</div>
                                    {b.note && <div className="text-sm mt-1">{b.note}</div>}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <a href="/support/consultation-hour" className="text-sm text-blue-600">Reschedule</a>
                                    <button onClick={() => cancelBooking(b.id)} className="px-2 py-1 border rounded text-sm">Cancel</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="mt-6">
                <h2 className="text-lg font-medium">Quick actions</h2>
                <div className="mt-2 flex gap-2">
                    <div className="flex items-center gap-2">
                        <select value={demoFacultyId} onChange={(e) => setDemoFacultyId(e.target.value)} className="rounded border-gray-300 p-1">
                            {(facultyList.length ? facultyList : [{ id: 'demo', name: 'Demo Faculty' }]).map(f => (
                                <option key={f.id} value={f.id}>{f.name || f.id}</option>
                            ))}
                        </select>
                        <input type="date" value={demoDate} onChange={(e) => setDemoDate(e.target.value)} className="rounded border-gray-300 p-1" />
                        <input type="time" value={demoTime} onChange={(e) => setDemoTime(e.target.value)} className="rounded border-gray-300 p-1" />
                        <input placeholder="note (optional)" value={demoNote} onChange={(e) => setDemoNote(e.target.value)} className="rounded border-gray-300 p-1" />
                        <button onClick={() => {
                            const fac = (facultyList.find(f => f.id === demoFacultyId) || { id: demoFacultyId, name: demoFacultyId });
                            const dateISO = demoDate;
                            const time = demoTime || '10:00';
                            const baseId = `${fac.id}-${dateISO}-${time}`;
                            setBookings(bs => {
                                let id = baseId;
                                let suffix = 1;
                                while (bs.find(b => b.id === id)) {
                                    id = `${baseId}-${suffix++}-${Date.now()}`;
                                }
                                return [...bs, { id, facultyId: fac.id, facultyName: fac.name, date: dateISO, time, note: demoNote }];
                            });
                        }} className="px-3 py-1 bg-green-600 text-white rounded">Add demo booking</button>
                    </div>
                    <a href="/support/consultation-hour" className="px-3 py-1 border rounded">Go to Consultation Hour</a>
                </div>
            </section>

            <section className="mt-6">
                <h2 className="text-lg font-medium">Notes / Reminders</h2>
                <div className="mt-2 text-sm text-gray-600">Simple session-only reminders are stored with bookings. For persistent reminders, connect to calendar integration.</div>
            </section>
        </div>
    );
}
