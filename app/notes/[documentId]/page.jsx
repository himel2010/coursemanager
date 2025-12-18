"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DocumentEditor } from "@/components/DocumentEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";

function DocumentEditorPageContent() {
  const router = useRouter();
  const params = useParams();
  const documentId = params?.documentId;

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [document, setDocument] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState(null);

  // Load document from localStorage
  useEffect(() => {
    if (!documentId) return;
    
    try {
      setIsMounted(true);
      const stored = localStorage.getItem("documents");
      if (stored) {
        const docs = JSON.parse(stored);
        const doc = docs.find((d) => d.id === String(documentId));
        if (doc) {
          setDocument(doc);
          setTitle(doc.title);
          setError(null);
        } else {
          // Document not found, create a placeholder
          const newDoc = {
            id: String(documentId),
            title: "Untitled Document",
            content: "",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setDocument(newDoc);
          setTitle("Untitled Document");
        }
      } else {
        // No documents stored yet, create placeholder
        const newDoc = {
          id: String(documentId),
          title: "Untitled Document",
          content: "",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setDocument(newDoc);
        setTitle("Untitled Document");
      }
    } catch (e) {
      console.error("Failed to load document:", e);
      setError("Failed to load document");
    }
  }, [documentId]);

  const handleTitleChange = async (newTitle) => {
    if (!newTitle.trim()) return;

    setIsSaving(true);
    try {
      const stored = localStorage.getItem("documents");
      const docs = JSON.parse(stored) || [];
      const updated = docs.map((doc) =>
        String(doc.id) === String(documentId)
          ? { ...doc, title: newTitle, updatedAt: Date.now() }
          : doc
      );
      localStorage.setItem("documents", JSON.stringify(updated));
      setTitle(newTitle);
      setIsEditing(false);
      setDocument(updated.find((d) => String(d.id) === String(documentId)));
    } catch (error) {
      console.error("Failed to update title:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentUpdate = async (content) => {
    try {
      const stored = localStorage.getItem("documents");
      const docs = JSON.parse(stored) || [];
      const updated = docs.map((doc) =>
        String(doc.id) === String(documentId)
          ? { ...doc, content: JSON.stringify(content), updatedAt: Date.now() }
          : doc
      );
      localStorage.setItem("documents", JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to update content:", error);
    }
  };

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4">
        <p className="text-red-600">{error}</p>
        <Link href="/notes">
          <Button variant="outline">Back to Notes</Button>
        </Link>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col gap-4">
        <p>Document not found</p>
        <Link href="/notes">
          <Button variant="outline">Back to Notes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b bg-background">
        <div className="container flex items-center justify-between h-16 gap-4">
          <Link href="/notes">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          {isEditing ? (
            <div className="flex-1 flex gap-2">
              <Input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleTitleChange(title)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleTitleChange(title);
                  }
                }}
                placeholder="Enter document title..."
                className="flex-1 text-lg font-semibold"
              />
            </div>
          ) : (
            <h1
              className="flex-1 text-xl font-semibold cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {title || "Untitled Document"}
            </h1>
          )}

          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Editor */}
      <main className="container py-8">
        <DocumentEditor documentId={documentId} onUpdate={handleContentUpdate} />
      </main>
    </div>
  );
}

export default function DocumentEditorPage() {
  return <DocumentEditorPageContent />;
}
