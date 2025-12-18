"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Trash2, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DocumentList({ userId, organizationId }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [documents, setDocuments] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load documents from localStorage
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem("documents");
    if (stored) {
      try {
        setDocuments(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored documents:", e);
      }
    }
  }, []);

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) return;

    const newDoc = {
      id: Date.now().toString(),
      title: newDocTitle,
      content: "",
      userId: userId || "local",
      organizationId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedDocs = [...documents, newDoc];
    setDocuments(updatedDocs);
    localStorage.setItem("documents", JSON.stringify(updatedDocs));

    setNewDocTitle("");
    setIsCreating(false);
    router.push(`/notes/${newDoc.id}`);
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    const updatedDocs = documents.filter((doc) => doc.id !== docId);
    setDocuments(updatedDocs);
    localStorage.setItem("documents", JSON.stringify(updatedDocs));
  };

  if (!isMounted) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  const filteredDocuments = documents
    .filter((doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground">
            Create and manage your documents with real-time collaboration
          </p>
        </div>

        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter document title..."
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleCreateDocument();
                  }
                }}
                autoFocus
              />
              <Button
                onClick={handleCreateDocument}
                disabled={!newDocTitle.trim()}
                className="w-full"
              >
                Create Document
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <Link
              key={doc._id}
              href={`/notes/${doc._id}`}
              className="group p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold truncate group-hover:text-blue-600 transition-colors">
                  {doc.title || "Untitled Document"}
                </h3>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.preventDefault()}
                  >
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Implement share
                      }}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteDocument(doc._id);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {doc.content || "No content yet"}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Edited {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No documents found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "Try a different search term"
              : "Create your first document to get started"}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Document
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
