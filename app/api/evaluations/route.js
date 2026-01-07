import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

const DB_FILE = path.resolve(process.cwd(), "data", "evaluations.json");

function readDB() {
    try {
        const txt = fs.readFileSync(DB_FILE, "utf8");
        return JSON.parse(txt || "[]");
    } catch (e) {
        return [];
    }
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
    const items = readDB();
    return NextResponse.json(items);
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { targetType, targetId, targetName, rating, comments, user } = body;
        if (!targetType || !targetName || typeof rating !== "number") {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const items = readDB();
        const newItem = {
            id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
            targetType,
            targetId: targetId || null,
            targetName,
            rating,
            comments: comments || "",
            user: user || "anonymous",
            createdAt: Date.now(),
        };
        items.push(newItem);
        writeDB(items);
        return NextResponse.json(newItem, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
}
