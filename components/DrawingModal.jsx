"use client";

import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RotateCcw, Download } from "lucide-react";

export function DrawingModal({ isOpen, onClose, onSave }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      setContext(ctx);
    }
  }, [isOpen]);

  const startDrawing = (e) => {
    if (!context) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing || !context) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (context) {
      context.closePath();
    }
  };

  const handleClear = () => {
    if (context && canvasRef.current) {
      context.fillStyle = "white";
      context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleSave = () => {
    if (canvasRef.current) {
      const imageData = canvasRef.current.toDataURL("image/png");
      onSave(imageData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Draw Something</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="border-2 border-gray-300 rounded cursor-crosshair bg-white"
            style={{ height: "400px", width: "100%" }}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClear}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Insert Drawing
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
