import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { parsePDF, isReadableText, cleanExtractedText } from "@/lib/pdfParser";

// Extract text from PDF
async function extractTextFromPDF(pdfBuffer) {
  console.log("Starting PDF extraction, buffer size:", pdfBuffer.length);
  
  try {
    const data = await parsePDF(pdfBuffer);
    console.log("PDF parsed, text length:", data.text?.length || 0);
    console.log("PDF info:", { numpages: data.numpages, title: data.info?.Title });
    
    let text = data.text || "";
    
    if (!text.trim()) {
      console.warn("PDF extraction returned empty text");
      return "";
    }
    
    // Log a sample of the extracted text for debugging
    console.log("Sample of extracted text:", text.substring(0, 300));
    
    // Check if the extracted text is readable
    if (!isReadableText(text)) {
      console.warn("Extracted text appears to be garbled/binary, sample:", text.substring(0, 100));
      // Try to clean it anyway
      text = cleanExtractedText(text);
      if (text.length < 50) {
        console.warn("Cleaned text too short:", text.length);
        return "";
      }
    } else {
      // Clean the text to remove any remaining garbled parts
      text = cleanExtractedText(text);
    }
    
    console.log("Final cleaned text length:", text.length);
    return text;
  } catch (error) {
    console.error("PDF extraction error:", error.message);
    return "";
  }
}

export async function GET(req, { params }) {
  try {
    const supabase = await createClient();
    const authData = await supabase.auth.getUser();
    const userId = authData.data?.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { noteId } = await params;

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the note with uploads
    const note = await db.note.findUnique({
      where: { id: noteId },
      include: {
        uploads: true,
      },
    });

    if (!note) {
      return new Response(JSON.stringify({ error: "Note not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (note.userId !== user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check if there's a PDF upload
    const pdfUpload = note.uploads?.find(
      (u) => u.fileType === "application/pdf" && u.pdfData
    );

    if (!pdfUpload) {
      return new Response(
        JSON.stringify({ error: "No PDF found for this note", text: "" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Extract text from PDF
    const pdfBuffer = Buffer.isBuffer(pdfUpload.pdfData)
      ? pdfUpload.pdfData
      : Buffer.from(pdfUpload.pdfData);

    console.log("Extracting text from PDF:", {
      noteId,
      uploadId: pdfUpload.id,
      bufferSize: pdfBuffer.length,
    });

    const extractedText = await extractTextFromPDF(pdfBuffer);

    console.log("Extracted text length:", extractedText.length);

    return new Response(
      JSON.stringify({
        success: true,
        text: extractedText,
        noteId,
        uploadId: pdfUpload.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to extract text" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
