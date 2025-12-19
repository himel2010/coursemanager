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
  const [progress, setProgress] = useState(null);

  // Load document from database
  useEffect(() => {
    if (!documentId) return;
    
    const loadDocument = async () => {
      try {
        const response = await fetch(`/api/notes/${documentId}`);
        if (!response.ok) {
          throw new Error("Failed to load document");
        }
        const doc = await response.json();
        setDocument(doc);
        setTitle(doc.title);
        setProgress(doc.progress);
        setError(null);
      } catch (e) {
        console.error("Failed to load document:", e);
        setError(e.message);
      } finally {
        setIsMounted(true);
      }
    };

    loadDocument();
  }, [documentId]);

  const handleTitleChange = async (newTitle) => {
    if (!newTitle.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/notes/${documentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        throw new Error("Failed to update title");
      }

      const updatedDoc = await response.json();
      setDocument(updatedDoc);
      setTitle(updatedDoc.title);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update title:", error);
      setError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentUpdate = async (content, progressData) => {
    try {
      const payload = { content };
      if (progressData) {
        payload.progress = progressData;
      }
      
      console.log('Saving content with payload:', { 
        hasContent: !!content, 
        hasProgress: !!progressData,
        contentSize: JSON.stringify(content).length,
        progressData: progressData
      });
      
      const response = await fetch(`/api/notes/${documentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: Failed to save content`;
        console.error("API Error Response:", { 
          status: response.status, 
          error: errorData,
          message: errorMessage 
        });
        throw new Error(errorMessage);
      }

      const updatedDoc = await response.json();
      setDocument(updatedDoc);
      if (updatedDoc.progress) {
        setProgress(updatedDoc.progress);
      }
    } catch (error) {
      console.error("Failed to update content:", error);
      setError(error.message);
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
        {document && (
          <DocumentEditor 
            documentId={documentId} 
            initialContent={document.content}
            onUpdate={handleContentUpdate}
            savedProgress={progress}
          />
        )}
      </main>
    </div>
  );
}

export default function DocumentEditorPage() {
  return <DocumentEditorPageContent />;
}
