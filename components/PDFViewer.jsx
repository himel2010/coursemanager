"use client";

import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PDFViewer({ uploadId, fileName, onClose }) {
  const pdfUrl = `/api/uploads/${uploadId}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = fileName || "document.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg w-full h-[90vh] max-w-6xl flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4 flex items-center justify-between bg-gray-50">
          <h3 className="text-lg font-semibold truncate max-w-md">{fileName}</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer - Direct embed */}
        <div className="flex-1 bg-gray-100 overflow-hidden">
          <embed
            src={pdfUrl + "#toolbar=1&navpanes=0&scrollbar=1"}
            type="application/pdf"
            width="100%"
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
