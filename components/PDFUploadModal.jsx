"use client";

import { useState, useRef } from "react";
import { Upload, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export function PDFUploadModal({
  open,
  onOpenChange,
  courses,
  onUploadSuccess,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    setError(null);

    // Validate file type
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      setSelectedFile(null);
      return;
    }

    // Validate file size (10MB max for database storage)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    // Auto-fill title with filename if not already set
    if (!customTitle) {
      setCustomTitle(file.name.replace(".pdf", ""));
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files?.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    if (!selectedCourse) {
      setError("Please select a course");
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("courseId", selectedCourse);
      formData.append("title", customTitle || selectedFile.name);

      // Update progress naturally without excessive updates
      const progressUpdates = [20, 40, 60, 80];
      let progressIndex = 0;
      const progressInterval = setInterval(() => {
        if (progressIndex < progressUpdates.length) {
          setUploadProgress(progressUpdates[progressIndex]);
          progressIndex++;
        }
      }, 300);

      const response = await fetch("/api/notes/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Upload failed");
      }

      setUploadProgress(100);
      setSuccess(true);

      // Reset form after 1.5 seconds
      setTimeout(() => {
        onUploadSuccess(data.note);
        resetForm();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to upload file");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setSelectedCourse("");
    setCustomTitle("");
    setUploadProgress(0);
    setError(null);
    setSuccess(false);
    setIsUploading(false);
    onOpenChange(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload PDF to Notes</DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 py-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <h3 className="font-semibold text-green-600">Upload Successful!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your PDF has been uploaded and linked to the course.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Drag and Drop Zone */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-border hover:border-blue-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Drag and drop your PDF here</p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Max file size: 10MB
              </p>
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="bg-muted p-3 rounded-lg flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" title={selectedFile.name}>
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Title Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Document Title (Optional)
              </label>
              <Input
                placeholder="Enter custom title for this PDF"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
            </div>

            {/* Course Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Assign to Course *
              </label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses && courses.length > 0 ? (
                    courses.map((courseOffered) => (
                      <SelectItem
                        key={courseOffered.id}
                        value={courseOffered.courseId}
                      >
                        {courseOffered.course.code} - {courseOffered.section}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No courses available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={resetForm}
                disabled={isUploading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !selectedCourse || isUploading}
                className="flex-1"
              >
                {isUploading ? "Uploading..." : "Upload PDF"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
