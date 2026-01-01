"use client";

import React, { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { FontFamily } from "@tiptap/extension-font-family";
import Image from "@tiptap/extension-image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Paintbrush,
  Highlighter,
  Moon,
  Sun,
  PenTool,
  RotateCcw,
  Download,
  FileDown,
} from "lucide-react";
import "@/app/styles/editor.css";

// Individual page editor component
function PageEditor({ 
  pageId, 
  initialContent, 
  isDarkMode, 
  selectedTextColor,
  onContentUpdate,
  editorCallbacks,
}) {
  const editorRef = useRef(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: true,
      }),
      TextStyle,
      FontFamily.configure({
        types: ["textStyle"],
      }),
      Color.configure({
        types: ["textStyle"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded",
        },
      }),
    ],
    content: initialContent || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      onContentUpdate(content);
    },
  });

  // Store editor ref for external access
  React.useEffect(() => {
    if (editor && editorCallbacks) {
      editorCallbacks[pageId] = editor;
    }
  }, [editor, pageId, editorCallbacks]);

  if (!editor) {
    return null;
  }

  return (
    <EditorContent 
      ref={editorRef}
      editor={editor} 
      className={`prose prose-lg max-w-none focus:outline-none ${isDarkMode ? "prose-invert text-slate-100" : "text-slate-900"}`}
    />
  );
}

export function DocumentEditor({ documentId, initialContent, onUpdate, savedProgress }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTextColor, setSelectedTextColor] = useState("#000000");
  const [selectedHighlightColor, setSelectedHighlightColor] = useState("#ffd54f");
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPageId, setCurrentPageId] = useState(savedProgress?.currentPage || 1);
  const [pages, setPages] = useState(() => {
    // Initialize with content from database if available, otherwise empty
    if (initialContent && Array.isArray(initialContent)) {
      return initialContent;
    }
    return [{ id: 1, content: "" }];
  });
  const [scrollPosition, setScrollPosition] = useState(savedProgress?.scrollPosition || 0);
  const [pagesRead, setPagesRead] = useState(savedProgress?.pagesRead || []);
  
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const editorsRef = useRef({});
  const drawingEditorRef = useRef(null);
  const pageUpdateRef = useRef(null);
  const containerRef = useRef(null);

  const fonts = [
    { name: "Serif", value: "serif" },
    { name: "Arial", value: "Arial, sans-serif" },
    { name: "Courier", value: "'Courier New', monospace" },
    { name: "Georgia", value: "Georgia, serif" },
    { name: "Times", value: "'Times New Roman', serif" },
    { name: "Verdana", value: "Verdana, sans-serif" },
  ];

  const textSizes = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px"];

  const textColors = [
    { name: "Black", value: "#000000" },
    { name: "Red", value: "#d32f2f" },
    { name: "Orange", value: "#f57c00" },
    { name: "Green", value: "#388e3c" },
    { name: "Blue", value: "#1976d2" },
    { name: "Purple", value: "#7b1fa2" },
    { name: "Gray", value: "#616161" },
  ];

  const highlightColors = [
    "#ffd54f", "#ffab91", "#ce93d8", "#b3e5fc", 
    "#c8e6c9", "#f8bbd0", "#fff9c4", "#ffccbc"
  ];

  // Track scroll position and visible pages
  React.useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollPosition(containerRef.current.scrollTop);
      }
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      
      // Set up intersection observer to track visible pages
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const pageId = parseInt(entry.target.id.replace('page-', ''));
              setCurrentPageId(pageId);
              
              // Add to pagesRead if not already there
              setPagesRead((prev) => {
                if (!prev.includes(pageId)) {
                  return [...prev, pageId];
                }
                return prev;
              });
            }
          });
        },
        { threshold: 0.3 }
      );
      
      // Observe all page elements
      document.querySelectorAll('[id^="page-"]').forEach((el) => {
        observer.observe(el);
      });
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        observer.disconnect();
      };
    }
  }, []);

  // Restore scroll position when component mounts
  React.useEffect(() => {
    if (containerRef.current && savedProgress?.scrollPosition > 0) {
      setTimeout(() => {
        containerRef.current.scrollTop = savedProgress.scrollPosition;
      }, 100);
    }
  }, [savedProgress]);

  // Autosave effect - saves document every 10 seconds
  const lastSavedRef = useRef(null);
  React.useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (onUpdate && pages.length > 0) {
        const pagesJSON = JSON.stringify(pages);
        const progressData = {
          currentPage: currentPageId,
          scrollPosition: scrollPosition,
          pagesRead: pagesRead,
          timestamp: new Date().toISOString()
        };
        const progressJSON = JSON.stringify(progressData);
        
        // Only save if content or progress has changed since last save
        const currentSaveState = JSON.stringify({ pages: pagesJSON, progress: progressJSON });
        if (lastSavedRef.current !== currentSaveState) {
          console.log('Autosaving document with progress...', { 
            pageCount: pages.length, 
            currentPage: currentPageId,
            scrollPosition: scrollPosition,
            timestamp: new Date().toISOString() 
          });
          onUpdate(pages, progressData);
          lastSavedRef.current = currentSaveState;
        }
      }
    }, 10000); // 10 seconds

    // Cleanup interval on unmount
    return () => clearInterval(autoSaveInterval);
  }, [onUpdate, pages, currentPageId, scrollPosition, pagesRead]);

  // Handler functions that update all active editors
  const handleFontChange = (fontFamily) => {
    Object.values(editorsRef.current).forEach(editor => {
      if (editor) {
        editor.chain().focus().setFontFamily(fontFamily).run();
      }
    });
  };

  const handleFontSizeChange = (fontSize) => {
    if (!fontSize) return;
    Object.values(editorsRef.current).forEach(editor => {
      if (editor) {
        editor.chain().focus().setMark('textStyle', { fontSize }).run();
      }
    });
  };

  const handleTextColorChange = (color) => {
    setSelectedTextColor(color);
    if (isDrawingMode && contextRef.current) {
      contextRef.current.strokeStyle = color;
    } else {
      Object.values(editorsRef.current).forEach(editor => {
        if (editor) {
          editor.chain().setColor(color).run();
        }
      });
    }
  };

  const handleHighlightColorChange = (color) => {
    setSelectedHighlightColor(color);
    Object.values(editorsRef.current).forEach(editor => {
      if (editor) {
        editor.chain().toggleHighlight({ color }).run();
      }
    });
  };

  const handleBoldToggle = () => {
    Object.values(editorsRef.current).forEach(editor => {
      if (editor) {
        editor.chain().focus().toggleBold().run();
      }
    });
  };

  const handleItalicToggle = () => {
    Object.values(editorsRef.current).forEach(editor => {
      if (editor) {
        editor.chain().focus().toggleItalic().run();
      }
    });
  };

  const handleUnderlineToggle = () => {
    Object.values(editorsRef.current).forEach(editor => {
      if (editor) {
        editor.chain().focus().toggleUnderline().run();
      }
    });
  };

  const handleStrikeToggle = () => {
    Object.values(editorsRef.current).forEach(editor => {
      if (editor) {
        editor.chain().focus().toggleStrike().run();
      }
    });
  };

  const handleHeadingToggle = (level) => {
    Object.values(editorsRef.current).forEach(editor => {
      if (editor) {
        editor.chain().focus().toggleHeading({ level }).run();
      }
    });
  };

  const handleBulletListToggle = () => {
    Object.values(editorsRef.current).forEach(editor => {
      if (editor) {
        editor.chain().focus().toggleBulletList().run();
      }
    });
  };

  const handleOrderedListToggle = () => {
    Object.values(editorsRef.current).forEach(editor => {
      if (editor) {
        editor.chain().focus().toggleOrderedList().run();
      }
    });
  };

  const handleBlockquoteToggle = () => {
    Object.values(editorsRef.current).forEach(editor => {
      if (editor) {
        editor.chain().focus().toggleBlockquote().run();
      }
    });
  };

  const handleCodeBlockToggle = () => {
    Object.values(editorsRef.current).forEach(editor => {
      if (editor) {
        editor.chain().focus().toggleCodeBlock().run();
      }
    });
  };

  const handleUndoRedo = (isUndo) => {
    Object.values(editorsRef.current).forEach(editor => {
      if (editor) {
        if (isUndo) {
          editor.chain().focus().undo().run();
        } else {
          editor.chain().focus().redo().run();
        }
      }
    });
  };

  const extractContentFromNode = (node, elements = []) => {
    if (node.nodeType === 3) {
      // Text node
      const text = node.textContent.trim();
      if (text) {
        elements.push({ type: 'text', content: text });
      }
    } else if (node.nodeType === 1) {
      // Element node
      const tagName = node.tagName.toLowerCase();
      
      if (tagName === 'img') {
        // Capture images (including drawings)
        const src = node.src || node.getAttribute('src');
        let width = node.naturalWidth;
        let height = node.naturalHeight;
        
        // Fallback to dataset dimensions if natural dimensions not available
        if (!width || !height) {
          width = parseInt(node.getAttribute('data-width')) || node.width || 600;
          height = parseInt(node.getAttribute('data-height')) || node.height || 400;
        }
        
        if (src) {
          console.log('Found image element:', { 
            src: src?.substring(0, 50), 
            naturalWidth: node.naturalWidth, 
            naturalHeight: node.naturalHeight,
            width,
            height
          });
          elements.push({ type: 'image', content: src, width, height });
        }
      } else if (tagName === 'br') {
        elements.push({ type: 'break' });
      } else if (tagName === 'p') {
        for (let child of node.childNodes) {
          extractContentFromNode(child, elements);
        }
        elements.push({ type: 'break' });
      } else if (tagName === 'h1' || tagName === 'h2' || tagName === 'h3') {
        const level = parseInt(tagName[1]);
        let textContent = '';
        for (let child of node.childNodes) {
          if (child.nodeType === 3) {
            textContent += child.textContent;
          } else {
            textContent += child.textContent || '';
          }
        }
        elements.push({ type: 'heading', content: textContent, level });
        elements.push({ type: 'break' });
      } else if (tagName === 'li') {
        let textContent = '';
        for (let child of node.childNodes) {
          if (child.nodeType === 3) {
            textContent += child.textContent;
          } else {
            textContent += child.textContent || '';
          }
        }
        elements.push({ type: 'list-item', content: textContent });
      } else {
        // For other elements, recurse into children
        if (tagName === 'div' || tagName === 'section' || tagName === 'article') {
          // These are container elements, recurse into them
          for (let child of node.childNodes) {
            extractContentFromNode(child, elements);
          }
        } else {
          // For other tags, still recurse but also capture text
          for (let child of node.childNodes) {
            extractContentFromNode(child, elements);
          }
        }
      }
    }
    return elements;
  };

  // Extract content from TipTap JSON format
  const extractFromJSON = (jsonContent, elements = []) => {
    if (!jsonContent) return elements;
    
    if (jsonContent.type === 'doc' && jsonContent.content) {
      // Process all nodes in the document
      for (let node of jsonContent.content) {
        extractFromJSON(node, elements);
      }
    } else if (jsonContent.type === 'heading' && jsonContent.content) {
      let text = '';
      for (let child of jsonContent.content) {
        if (child.type === 'text') {
          text += child.text || '';
        }
      }
      if (text) {
        const level = parseInt(jsonContent.attrs?.level) || 1;
        elements.push({ type: 'heading', content: text, level });
        elements.push({ type: 'break' });
      }
    } else if (jsonContent.type === 'paragraph' && jsonContent.content) {
      for (let child of jsonContent.content) {
        if (child.type === 'text') {
          if (child.text?.trim()) {
            elements.push({ type: 'text', content: child.text });
          }
        } else if (child.type === 'image') {
          const src = child.attrs?.src;
          const width = 600; // Default width
          const height = 400; // Default height
          if (src) {
            console.log('Found image in JSON:', { src: src.substring(0, 50) });
            elements.push({ type: 'image', content: src, width, height });
          }
        }
      }
      elements.push({ type: 'break' });
    } else if (jsonContent.type === 'bulletList' && jsonContent.content) {
      for (let child of jsonContent.content) {
        if (child.type === 'listItem' && child.content) {
          let text = '';
          for (let para of child.content) {
            if (para.type === 'paragraph' && para.content) {
              for (let c of para.content) {
                if (c.type === 'text') {
                  text += c.text || '';
                }
              }
            }
          }
          if (text) {
            elements.push({ type: 'list-item', content: text });
          }
        }
      }
    } else if (jsonContent.type === 'image') {
      const src = jsonContent.attrs?.src;
      if (src) {
        console.log('Found image element in JSON:', { src: src.substring(0, 50) });
        elements.push({ type: 'image', content: src, width: 600, height: 400 });
        elements.push({ type: 'break' });
      }
    }
    
    return elements;
  };

  const exportToPDF = async () => {
    try {
      console.log('Starting PDF export with', pages.length, 'pages');
      console.log('Pages data:', JSON.stringify(pages).substring(0, 200));
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageCount = pages.length;
      console.log('Exporting', pageCount, 'pages');
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const lineHeight = 5;
      let yPosition = margin;
      let pdfPageNumber = 1;

      for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
        // Add new page for subsequent pages
        if (pageIndex > 0) {
          pdf.addPage();
          yPosition = margin;
          pdfPageNumber += 1;
        }

        try {
          const pageData = pages[pageIndex];
          console.log(`Processing page ${pageIndex + 1}:`, pageData);
          
          // Extract content from JSON format
          const content = extractFromJSON(pageData.content);
          console.log(`Page ${pageIndex + 1} content extracted:`, content.length, 'items');
          console.log('Content preview:', content.map(c => ({ type: c.type, hasContent: !!c.content })));
          
          const maxWidth = pageWidth - (2 * margin);

          // Process each content element
          for (let element of content) {
            if (element.type === 'text') {
              pdf.setFont('Helvetica', 'normal');
              pdf.setFontSize(11);
              pdf.setTextColor(isDarkMode ? 255 : 0);

              const lines = pdf.splitTextToSize(element.content, maxWidth);
              for (let line of lines) {
                if (yPosition + lineHeight > pageHeight - margin) {
                  pdf.addPage();
                  yPosition = margin;
                }
                pdf.text(line, margin, yPosition);
                yPosition += lineHeight;
              }
            } else if (element.type === 'heading') {
              pdf.setFont('Helvetica', 'bold');
              pdf.setFontSize(13 - (element.level * 0.5));
              pdf.setTextColor(isDarkMode ? 255 : 0);

              const lines = pdf.splitTextToSize(element.content, maxWidth);
              for (let line of lines) {
                if (yPosition + lineHeight > pageHeight - margin) {
                  pdf.addPage();
                  yPosition = margin;
                }
                pdf.text(line, margin, yPosition);
                yPosition += lineHeight;
              }
              yPosition += 2;
            } else if (element.type === 'list-item') {
              pdf.setFont('Helvetica', 'normal');
              pdf.setFontSize(11);
              pdf.setTextColor(isDarkMode ? 255 : 0);

              const lines = pdf.splitTextToSize(element.content, maxWidth - 5);
              for (let line of lines) {
                if (yPosition + lineHeight > pageHeight - margin) {
                  pdf.addPage();
                  yPosition = margin;
                }
                pdf.text('• ' + line, margin, yPosition);
                yPosition += lineHeight;
              }
            } else if (element.type === 'image') {
              // Add image to PDF
              try {
                const imgSrc = element.content;
                console.log('Processing image, src type:', typeof imgSrc, 'src preview:', imgSrc?.substring(0, 50));
                
                if (yPosition + 40 > pageHeight - margin) {
                  pdf.addPage();
                  yPosition = margin;
                }

                // Calculate image dimensions to fit page width
                const imgMaxWidth = maxWidth;
                let imgWidth = imgMaxWidth;
                let imgHeight = 50; // Default height for images

                // Preserve aspect ratio if dimensions available
                if (element.width && element.height && element.width > 0) {
                  imgHeight = (element.height * imgMaxWidth) / element.width;
                  // Limit height to reasonable range
                  imgHeight = Math.min(imgHeight, 100);
                  imgHeight = Math.max(imgHeight, 30);
                }

                console.log('Adding image:', { width: imgWidth, height: imgHeight, srcLength: imgSrc?.length });
                
                // Handle both base64 data URLs and regular URLs
                if (imgSrc && imgSrc.startsWith('data:')) {
                  // Base64 data URL
                  const format = imgSrc.includes('png') ? 'PNG' : imgSrc.includes('jpg') ? 'JPEG' : 'PNG';
                  pdf.addImage(imgSrc, format, margin, yPosition, imgWidth, imgHeight);
                } else if (imgSrc) {
                  // Regular URL
                  pdf.addImage(imgSrc, 'PNG', margin, yPosition, imgWidth, imgHeight);
                }
                
                yPosition += imgHeight + 8;
              } catch (imgErr) {
                console.error('Error adding image:', imgErr, 'image src:', element.content?.substring(0, 50));
              }
            } else if (element.type === 'break') {
              yPosition += 2;
            }
          }

          // Add spacing between pages
          yPosition += 5;

        } catch (error) {
          console.error(`Error on page ${pageIndex + 1}:`, error);
        }
      }

      pdf.save(`document_${new Date().toISOString().split('T')[0]}.pdf`);
      console.log('PDF exported successfully with text and images');
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Failed to export PDF. Error: ' + error.message);
    }
  };

  // Drawing mode handlers
  const startDrawingMode = () => {
    // Store reference to current page's editor before entering drawing mode
    drawingEditorRef.current = editorsRef.current[currentPageId];
    setIsDrawingMode(true);
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = Math.max(canvas.offsetHeight, 600);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = isDarkMode ? "#1e293b" : "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = selectedTextColor;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        contextRef.current = ctx;
        canvas.focus();
      }
    }, 0);
  };

  const handleDrawingMouseDown = (e) => {
    if (!contextRef.current || !canvasRef.current) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
  };

  const handleDrawingMouseMove = (e) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const handleDrawingMouseUp = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
    }
    setIsDrawing(false);
  };

  const handleDrawingMouseLeave = () => {
    if (isDrawing && contextRef.current) {
      contextRef.current.closePath();
    }
    setIsDrawing(false);
  };

  const insertDrawing = () => {
    if (!canvasRef.current || !drawingEditorRef.current || !currentPageId) return;
    
    try {
      const canvas = canvasRef.current;
      const editor = drawingEditorRef.current;
      
      if (!editor) {
        console.error("Editor reference lost");
        return;
      }
      
      // Get the drawing data from the canvas
      const imageData = canvas.toDataURL("image/png");
      console.log("Canvas data URL length:", imageData.length);
      console.log("Drawing data captured:", imageData.substring(0, 100));
      
      // Insert the image as a proper TipTap node using insertContent
      // This creates an image node that TipTap properly serializes
      console.log("Inserting image into editor...");
      const result = editor.chain()
        .insertContent({
          type: 'image',
          attrs: {
            src: imageData,
            alt: 'Drawing'
          }
        })
        .run();
      
      console.log("Insert command result:", result);
      
      // Wait for TipTap to process the image node insertion
      setTimeout(() => {
        try {
          // Get the updated content from the editor
          const currentContent = editor.getJSON();
          const contentStr = JSON.stringify(currentContent);
          console.log("Editor state after insert:", contentStr.substring(0, 300));
          console.log("Content includes image data:", contentStr.includes("image") ? "YES" : "NO");
          
          // Check if content actually contains the image
          if (!contentStr.includes("data:image/png")) {
            console.warn("WARNING: Image data not found in editor content after insertion!");
          }
          
          // Update the page state with the new content
          const updatedPages = pages.map((p) =>
            p.id === currentPageId ? { ...p, content: currentContent } : p
          );
          
          // Save to component state
          setPages(updatedPages);
          
          // Save to database immediately
          if (onUpdate) {
            onUpdate(updatedPages);
          }
          console.log("Drawing inserted and saved to database");
          
          // Exit drawing mode
          setIsDrawingMode(false);
          setIsDrawing(false);
          drawingEditorRef.current = null;
          pageUpdateRef.current = null;
        } catch (saveError) {
          console.error("Error saving after drawing:", saveError);
          setIsDrawingMode(false);
          setIsDrawing(false);
          drawingEditorRef.current = null;
          pageUpdateRef.current = null;
        }
      }, 500);
    } catch (error) {
      console.error("Error inserting drawing:", error);
      setIsDrawingMode(false);
      setIsDrawing(false);
      drawingEditorRef.current = null;
      pageUpdateRef.current = null;
    }
  };

  const clearDrawing = () => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.fillStyle = isDarkMode ? "#1e293b" : "#ffffff";
      contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const exitDrawingMode = () => {
    setIsDrawingMode(false);
    setIsDrawing(false);
    // Delay clearing the ref to ensure any pending operations complete
    setTimeout(() => {
      drawingEditorRef.current = null;
    }, 50);
  };

  const addNewPage = () => {
    const newPageId = Math.max(...pages.map((p) => p.id), 0) + 1;
    const newPage = { id: newPageId, content: "" };
    const newPages = [...pages, newPage];
    setPages(newPages);
    setCurrentPageId(newPageId);
    onUpdate?.(newPages);
    setTimeout(() => {
      const element = document.getElementById(`page-${newPageId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const deletePage = (pageId) => {
    if (pages.length > 1) {
      const updatedPages = pages.filter((page) => page.id !== pageId);
      setPages(updatedPages);
      if (currentPageId === pageId) {
        setCurrentPageId(updatedPages[0]?.id || 1);
      }
      delete editorsRef.current[pageId];
      if (onUpdate) {
        onUpdate(updatedPages);
      }
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 to-slate-100"}`}>
      {/* Toolbar */}
      <div className={`sticky top-0 z-20 transition-colors duration-300 ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} border-b shadow-sm`}>
        <div className="flex items-center justify-between p-3 gap-2 flex-wrap max-w-full">
          <div className="flex items-center gap-1 flex-wrap">
            {/* Font Selection */}
            <select
              onChange={(e) => handleFontChange(e.target.value)}
              className={`text-xs px-2 py-1.5 rounded border transition-colors ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:border-slate-500" : "bg-white border-slate-300 hover:border-slate-400"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Font</option>
              {fonts.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.name}
                </option>
              ))}
            </select>

            {/* Text Size */}
            <select
              onChange={(e) => handleFontSizeChange(e.target.value)}
              className={`text-xs px-2 py-1.5 rounded border transition-colors ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:border-slate-500" : "bg-white border-slate-300 hover:border-slate-400"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Size</option>
              {textSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            <Separator orientation="vertical" className={`h-6 ${isDarkMode ? "bg-slate-600" : "bg-slate-300"}`} />

            {/* Text Formatting */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleBoldToggle}
              title="Bold (Ctrl+B)"
              className={`h-8 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleItalicToggle}
              title="Italic (Ctrl+I)"
              className={`h-8 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleUnderlineToggle}
              title="Underline"
              className={`h-8 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`}
            >
              <UnderlineIcon className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleStrikeToggle}
              title="Strikethrough"
              className={`h-8 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`}
            >
              <Strikethrough className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className={`h-6 ${isDarkMode ? "bg-slate-600" : "bg-slate-300"}`} />

            {/* Headings */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleHeadingToggle(1)}
              className={`h-8 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`}
            >
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleHeadingToggle(2)}
              className={`h-8 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`}
            >
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleHeadingToggle(3)}
              className={`h-8 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`}
            >
              <Heading3 className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className={`h-6 ${isDarkMode ? "bg-slate-600" : "bg-slate-300"}`} />

            {/* Lists */}
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulletListToggle}
              className={`h-8 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleOrderedListToggle}
              className={`h-8 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`}
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBlockquoteToggle}
              className={`h-8 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`}
            >
              <Quote className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCodeBlockToggle}
              className={`h-8 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`}
            >
              <Code className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className={`h-6 ${isDarkMode ? "bg-slate-600" : "bg-slate-300"}`} />

            {/* Drawing */}
            <Button
              size="sm"
              variant={isDrawingMode ? "default" : "outline"}
              onClick={isDrawingMode ? exitDrawingMode : startDrawingMode}
              className={`h-8 ${isDarkMode && !isDrawingMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : !isDrawingMode ? "text-slate-700" : ""}`}
              title={isDrawingMode ? "Exit Drawing Mode" : "Draw"}
            >
              <PenTool className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className={`h-6 ${isDarkMode ? "bg-slate-600" : "bg-slate-300"}`} />

            {/* Text Color */}
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" className={`h-8 px-2 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`} title="Text Color">
                <Paintbrush className="w-4 h-4" />
              </Button>
              <div className="flex gap-1">
                {textColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleTextColorChange(color.value)}
                    className="w-5 h-5 rounded border transition-all hover:scale-110"
                    style={{
                      backgroundColor: color.value,
                      borderColor: selectedTextColor === color.value ? "#000" : "#ccc",
                      borderWidth: selectedTextColor === color.value ? "2px" : "1px",
                    }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Highlight Color */}
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" className={`h-8 px-2 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`} title="Highlight Color">
                <Highlighter className="w-4 h-4" />
              </Button>
              <div className="flex gap-1">
                {highlightColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleHighlightColorChange(color)}
                    className="w-5 h-5 rounded border transition-all hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor: selectedHighlightColor === color ? "#000" : "#ccc",
                      borderWidth: selectedHighlightColor === color ? "2px" : "1px",
                    }}
                    title="Highlight"
                  />
                ))}
              </div>
            </div>

            <Separator orientation="vertical" className={`h-6 ${isDarkMode ? "bg-slate-600" : "bg-slate-300"}`} />

            {/* Undo/Redo */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUndoRedo(true)}
              className={`h-8 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`}
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUndoRedo(false)}
              className={`h-8 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`}
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Pages Indicator */}
            <Button
              size="sm"
              variant="outline"
              onClick={addNewPage}
              className={`h-8 text-xs ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`}
            >
              + Page ({pages.length})
            </Button>

            {/* Export PDF */}
            <Button
              size="sm"
              variant="outline"
              onClick={exportToPDF}
              className={`h-8 gap-1 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`}
              title="Export as PDF"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">PDF</span>
            </Button>

            {/* Theme Toggle */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`h-8 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : "text-slate-700"}`}
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 to-slate-100"}`}>
        {isDrawingMode ? (
          <div className={`p-8 ${isDarkMode ? "bg-slate-900" : "bg-gradient-to-br from-slate-50 to-slate-100"}`}>
            <div className={`max-w-5xl mx-auto rounded-lg shadow-lg overflow-hidden ${isDarkMode ? "bg-slate-800" : "bg-white"}`}>
              <canvas
                ref={canvasRef}
                onMouseDown={handleDrawingMouseDown}
                onMouseMove={handleDrawingMouseMove}
                onMouseUp={handleDrawingMouseUp}
                onMouseLeave={handleDrawingMouseLeave}
                className={`w-full cursor-crosshair`}
                style={{ height: "600px", display: "block" }}
              />
              <div className={`flex gap-2 justify-end p-4 ${isDarkMode ? "bg-slate-800" : "bg-gray-100"}`}>
                <Button
                  variant="outline"
                  onClick={clearDrawing}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear
                </Button>
                <Button
                  variant="outline"
                  onClick={exitDrawingMode}
                >
                  Cancel
                </Button>
                <Button
                  onClick={insertDrawing}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Insert Drawing
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="p-8 space-y-8 overflow-y-auto max-h-screen">
            {pages.map((page, index) => (
              <div key={page.id} id={`page-${page.id}`}>
                <div 
                  className={`editor-page max-w-5xl mx-auto rounded-lg shadow-lg transition-colors duration-300 ${isDarkMode ? "bg-slate-800 border-slate-700 dark" : "bg-white border-slate-200"} border`} 
                  style={{ minHeight: "600px", padding: "48px" }}
                  onDoubleClick={() => {
                    const editor = editorsRef.current[page.id];
                    if (editor) {
                      editor.chain().focus().run();
                    }
                  }}
                >
                  <PageEditor
                    pageId={page.id}
                    initialContent={page.content}
                    isDarkMode={isDarkMode}
                    selectedTextColor={selectedTextColor}
                    onContentUpdate={(content) => {
                      // Store the update function for drawing insertion
                      if (page.id === currentPageId) {
                        pageUpdateRef.current = (updatedContent) => {
                          const updatedPages = pages.map((p) =>
                            p.id === page.id ? { ...p, content: updatedContent } : p
                          );
                          setPages(updatedPages);
                          if (onUpdate) {
                            onUpdate(updatedPages);
                          }
                        };
                      }
                      
                      const updatedPages = pages.map((p) =>
                        p.id === page.id ? { ...p, content } : p
                      );
                      setPages(updatedPages);
                      if (onUpdate) {
                        onUpdate(updatedPages);
                      }
                    }}
                    editorCallbacks={editorsRef.current}
                  />
                </div>
                <div className="flex justify-end mt-2 px-8 gap-2">
                  <div className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    Page {index + 1} of {pages.length}
                  </div>
                  {pages.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deletePage(page.id)}
                      className="h-6 text-xs"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
