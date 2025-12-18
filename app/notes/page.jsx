"use client";

import { DocumentList } from "@/components/DocumentList";

export default function NotesPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container py-8">
        <DocumentList userId="user" />
      </main>
    </div>
  );
}
