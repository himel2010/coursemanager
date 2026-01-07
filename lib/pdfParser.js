// Server-side PDF text extraction utility
// pdf-parse v2.x exports PDFParse as a class

export async function parsePDF(buffer) {
  try {
    // Ensure we have a proper Buffer
    const pdfBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    
    console.log("parsePDF: Buffer size:", pdfBuffer.length);
    console.log("parsePDF: First 20 bytes:", pdfBuffer.slice(0, 20).toString('utf8'));
    
    // Use createRequire to import CommonJS module in ESM context
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    
    let pdfModule;
    try {
      pdfModule = require('pdf-parse');
    } catch (importErr) {
      console.error("Failed to import pdf-parse:", importErr.message);
      throw new Error("PDF parser module not available");
    }
    
    const PDFParse = pdfModule.PDFParse;
    
    if (!PDFParse) {
      console.error("PDFParse class not found. Module keys:", Object.keys(pdfModule));
      throw new Error("PDFParse class not found in pdf-parse module");
    }
    
    console.log("Creating PDFParse instance...");
    
    // PDFParse v2.x takes options with data property
    const parser = new PDFParse({ data: pdfBuffer });
    
    console.log("Loading PDF document...");
    await parser.load();
    console.log("PDF loaded successfully");
    
    // Get text from all pages
    console.log("Extracting text...");
    const textResult = await parser.getText();
    console.log("getText result type:", typeof textResult);
    console.log("getText result:", JSON.stringify(textResult).substring(0, 500));
    
    // textResult is an object with pages array
    let fullText = "";
    if (textResult && textResult.pages && Array.isArray(textResult.pages)) {
      console.log("Found", textResult.pages.length, "pages");
      fullText = textResult.pages.map(page => page.text || "").join("\n\n");
    } else if (typeof textResult === "string") {
      fullText = textResult;
    } else if (textResult && typeof textResult.text === "string") {
      fullText = textResult.text;
    }
    
    // Get document info
    let info = {};
    try {
      info = await parser.getInfo();
    } catch (e) {
      console.log("Could not get PDF info:", e.message);
    }
    
    // Clean up
    try {
      await parser.destroy();
    } catch (e) {
      console.log("Destroy warning:", e.message);
    }
    
    console.log("PDF parsed successfully, text length:", fullText.length);
    
    return {
      text: fullText,
      numpages: textResult?.pages?.length || 0,
      info: info || {},
    };
  } catch (error) {
    console.error("PDF parse error:", error.message);
    console.error("PDF parse stack:", error.stack);
    throw error;
  }
}

// Helper to check if text is readable (not garbled binary)
export function isReadableText(text) {
  if (!text || typeof text !== 'string') return false;
  if (text.length < 10) return false;
  
  // Count readable ASCII characters vs non-readable
  let readable = 0;
  let total = 0;
  
  for (let i = 0; i < Math.min(text.length, 1000); i++) {
    const code = text.charCodeAt(i);
    total++;
    // Readable: letters, numbers, common punctuation, spaces, newlines
    if ((code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9) {
      readable++;
    }
  }
  
  // Text should be at least 50% readable ASCII
  return total > 0 && (readable / total) > 0.5;
}

// Clean extracted text - remove garbled sequences
export function cleanExtractedText(text) {
  if (!text) return '';
  
  // Split into lines and filter out garbled ones
  const lines = text.split(/\r?\n/);
  const cleanLines = lines.filter(line => {
    // Keep some empty lines for paragraph breaks
    if (!line.trim()) return true;
    
    // Skip lines that are mostly non-ASCII or special characters
    const readableChars = (line.match(/[a-zA-Z0-9\s.,!?;:'"()\-\/&@#$%]/g) || []).length;
    const totalChars = line.length;
    
    // Line should be at least 40% readable characters
    return totalChars > 0 && (readableChars / totalChars) > 0.4;
  });
  
  // Join and clean up excessive whitespace while preserving paragraph structure
  return cleanLines
    .join('\n')
    .replace(/[ \t]+/g, ' ')  // Collapse horizontal whitespace
    .replace(/\n{3,}/g, '\n\n')  // Max 2 newlines
    .trim();
}
