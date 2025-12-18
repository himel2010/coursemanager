"use client";

import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { FontFamily } from "@tiptap/extension-font-family";

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
} from "lucide-react";
import "@/app/styles/editor.css";

export function DocumentEditor({ documentId, onUpdate }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedTextColor, setSelectedTextColor] = useState("#000000");
  const [selectedHighlightColor, setSelectedHighlightColor] = useState("#ffd54f");

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
    ],
    content: "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const content = editor.getJSON();
      onUpdate?.(content);
    },
  });

  if (!editor) {
    return <div className="flex items-center justify-center h-96">Loading editor...</div>;
  }

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

  const handleFontChange = (fontFamily) => {
    editor.chain().focus().setFontFamily(fontFamily).run();
  };

  const handleFontSizeChange = (fontSize) => {
    editor.chain().focus().setFontSize(fontSize).run();
  };

  const handleTextColorChange = (color) => {
    setSelectedTextColor(color);
    editor.chain().focus().setColor(color).run();
  };

  const handleHighlightColorChange = (color) => {
    setSelectedHighlightColor(color);
    editor.chain().focus().toggleHighlight({ color }).run();
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
              variant={editor.isActive("bold") ? "default" : "outline"}
              onClick={() => editor.chain().focus().toggleBold().run()}
              title="Bold (Ctrl+B)"
              className={`h-8 ${isDarkMode && !editor.isActive("bold") ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}`}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("italic") ? "default" : "outline"}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              title="Italic (Ctrl+I)"
              className={`h-8 ${isDarkMode && !editor.isActive("italic") ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}`}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("underline") ? "default" : "outline"}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              title="Underline"
              className={`h-8 ${isDarkMode && !editor.isActive("underline") ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}`}
            >
              <UnderlineIcon className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("strike") ? "default" : "outline"}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              title="Strikethrough"
              className={`h-8 ${isDarkMode && !editor.isActive("strike") ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}`}
            >
              <Strikethrough className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className={`h-6 ${isDarkMode ? "bg-slate-600" : "bg-slate-300"}`} />

            {/* Headings */}
            <Button
              size="sm"
              variant={editor.isActive("heading", { level: 1 }) ? "default" : "outline"}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`h-8 ${isDarkMode && !editor.isActive("heading", { level: 1 }) ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}`}
            >
              <Heading1 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("heading", { level: 2 }) ? "default" : "outline"}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`h-8 ${isDarkMode && !editor.isActive("heading", { level: 2 }) ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}`}
            >
              <Heading2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("heading", { level: 3 }) ? "default" : "outline"}
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`h-8 ${isDarkMode && !editor.isActive("heading", { level: 3 }) ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}`}
            >
              <Heading3 className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className={`h-6 ${isDarkMode ? "bg-slate-600" : "bg-slate-300"}`} />

            {/* Lists */}
            <Button
              size="sm"
              variant={editor.isActive("bulletList") ? "default" : "outline"}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`h-8 ${isDarkMode && !editor.isActive("bulletList") ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}`}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("orderedList") ? "default" : "outline"}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`h-8 ${isDarkMode && !editor.isActive("orderedList") ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}`}
            >
              <ListOrdered className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("blockquote") ? "default" : "outline"}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`h-8 ${isDarkMode && !editor.isActive("blockquote") ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}`}
            >
              <Quote className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive("codeBlock") ? "default" : "outline"}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`h-8 ${isDarkMode && !editor.isActive("codeBlock") ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}`}
            >
              <Code className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className={`h-6 ${isDarkMode ? "bg-slate-600" : "bg-slate-300"}`} />

            {/* Text Color */}
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" className={`h-8 px-2 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}`} title="Text Color">
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
              <Button size="sm" variant="outline" className={`h-8 px-2 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}`} title="Highlight">
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
                    title={color}
                  />
                ))}
              </div>
            </div>

            <Separator orientation="vertical" className={`h-6 ${isDarkMode ? "bg-slate-600" : "bg-slate-300"}`} />

            {/* Undo/Redo */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className={`h-8 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}`}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className={`h-8 ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}`}
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          {/* Theme Toggle */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`h-8 ml-auto ${isDarkMode ? "bg-slate-700 border-slate-600 text-white hover:bg-slate-600" : ""}`}
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className={`min-h-[calc(100vh-100px)] p-8 transition-colors duration-300`}>
        <div className={`editor-container max-w-5xl mx-auto rounded-lg shadow-lg transition-colors duration-300 ${isDarkMode ? "bg-slate-800 border-slate-700 dark" : "bg-white border-slate-200"}`}>
          <EditorContent 
            editor={editor} 
            className={`prose prose-lg max-w-none focus:outline-none ${isDarkMode ? "prose-invert text-slate-100" : "text-slate-900"}`}
          />
        </div>
      </div>
    </div>
  );
}
