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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreVertical, Trash2, Share2, X, Download, FileText, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { PDFUploadModal } from "./PDFUploadModal";

export function DocumentList({ userId, organizationId }) {
  const router = useRouter();
  const { courses } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCourseId, setNewDocCourseId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load documents from database
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/notes");
        const data = await response.json();
        
        if (!response.ok) {
          console.warn("API returned error:", data);
          throw new Error(data.error || "Failed to fetch documents");
        }
        
        setDocuments(data);
        setError(null);
      } catch (err) {
        console.error("Error loading documents:", err);
        setError(err.message);
        // Fallback to localStorage if API fails
        const stored = localStorage.getItem("documents");
        if (stored) {
          try {
            setDocuments(JSON.parse(stored));
          } catch (e) {
            console.error("Failed to parse stored documents:", e);
          }
        }
      } finally {
        setIsLoading(false);
        setIsMounted(true);
      }
    };

    loadDocuments();
  }, []);

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newDocTitle,
          content: {},
          noteType: "DIGITAL",
          courseId: newDocCourseId || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || "Failed to create document";
        console.error("Create document error:", errorMsg);
        throw new Error(errorMsg);
      }

      const newDoc = data;
      setDocuments([newDoc, ...documents]);
      setNewDocTitle("");
      setNewDocCourseId("");
      setIsCreating(false);
      setError(null);
      router.push(`/notes/${newDoc.id}`);
    } catch (err) {
      console.error("Error creating document:", err);
      setError(err.message || "Failed to create document");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const response = await fetch(`/api/notes/${docId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => "");
        console.error("Delete error response:", {
          status: response.status,
          statusText: response.statusText,
          body: errorData,
        });
        throw new Error(`Failed to delete document: ${response.status} ${response.statusText}`);
      }

      setDocuments(documents.filter((doc) => doc.id !== docId));
    } catch (err) {
      console.error("Error deleting document:", err);
      setError(err.message);
    }
  };

  if (!isMounted || isLoading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  if (error && documents.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Documents</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const filteredDocuments = documents
    .filter((doc) => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = selectedCourse === "all" || doc.courseId === selectedCourse;
      return matchesSearch && matchesCourse;
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .reduce((grouped, doc) => {
      const courseId = doc.courseId || "uncategorized";
      if (!grouped[courseId]) {
        grouped[courseId] = [];
      }
      grouped[courseId].push(doc);
      return grouped;
    }, {});

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

        <div className="flex gap-2">
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
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Course (Optional)
                  </label>
                  <Select value={newDocCourseId} onValueChange={setNewDocCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses && courses.map((courseOffered) => (
                        <SelectItem key={courseOffered.id} value={courseOffered.courseId}>
                          {courseOffered.course.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

          <PDFUploadModal
            open={isUploadingPDF}
            onOpenChange={setIsUploadingPDF}
            courses={courses || []}
            onUploadSuccess={(note) => {
              setDocuments([note, ...documents]);
            }}
          />
          <Button
            variant="outline"
            onClick={() => setIsUploadingPDF(true)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Upload PDF
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Filter by Course</label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="All courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="uncategorized">No Course</SelectItem>
              {courses && courses.map((courseOffered) => (
                <SelectItem key={courseOffered.id} value={courseOffered.courseId}>
                  {courseOffered.course.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Documents Grid - Grouped by Course */}
      {Object.keys(filteredDocuments).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(filteredDocuments).map(([courseId, docs]) => {
            const courseOffered = courseId === "uncategorized" 
              ? null 
              : courses?.find(c => c.courseId === courseId);
            const courseCode = courseOffered ? courseOffered.course.code : "No Course";
            
            return (
              <div key={courseId}>
                <div className="mb-4 pb-2 border-b">
                  <h2 className="text-xl font-semibold text-foreground">
                    {courseCode}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {docs.length} {docs.length === 1 ? 'document' : 'documents'}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((doc) => {
                    const isPDF = doc.noteType === "SCANNED" && doc.content?.type === "pdf";
                    
                    if (isPDF) {
                      return (
                        <div
                          key={doc.id}
                          className="group p-4 border rounded-lg hover:bg-accent transition-colors flex flex-col cursor-pointer"
                          onClick={() => router.push(`/notes/${doc.id}`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="w-5 h-5 text-red-600 flex-shrink-0" />
                              <h3 className="text-lg font-semibold truncate group-hover:text-blue-600 transition-colors" title={doc.title || "Untitled PDF"}>
                                {doc.title || "Untitled PDF"}
                              </h3>
                            </div>
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
                                    router.push(`/notes/${doc.id}`);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View & Annotate
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.preventDefault();
                                    if (doc.uploads && doc.uploads.length > 0) {
                                      const uploadId = doc.uploads[0].id;
                                      window.location.href = `/api/uploads/${uploadId}`;
                                    }
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleDeleteDocument(doc.id);
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
                            {doc.content?.fileName || "PDF Document"}
                          </p>

                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                            <Badge variant="secondary">PDF</Badge>
                            <span>
                              Uploaded {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={doc.id}
                        href={`/notes/${doc.id}`}
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
                                  handleDeleteDocument(doc.id);
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
                          {typeof doc.content === 'string' ? doc.content : "No content yet"}
                        </p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            Edited {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
