import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(req, { params }) {
  try {
    const { uploadId } = params;
    console.log("Fetching PDF:", uploadId);

    const supabase = await createClient();
    const authData = await supabase.auth.getUser();
    const userId = authData.data?.user?.id;

    if (!userId) {
      console.log("Unauthorized - no userId");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get upload record
    const upload = await db.upload.findUnique({
      where: { id: uploadId },
    });

    console.log("Upload found:", {
      id: upload?.id,
      fileName: upload?.fileName,
      fileSize: upload?.fileSize,
      hasPdfData: !!upload?.pdfData,
      pdfDataLength: upload?.pdfData?.length,
    });

    if (!upload || upload.userId !== userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If pdfData exists in database, return it
    if (upload.pdfData) {
      console.log("Returning PDF data:", upload.pdfData.length, "bytes");
      
      // Ensure we have a Buffer
      const pdfBuffer = Buffer.isBuffer(upload.pdfData) 
        ? upload.pdfData 
        : Buffer.from(upload.pdfData);

      // Return as proper Response - NO Content-Disposition to prevent downloads
      return new Response(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Length": pdfBuffer.length.toString(),
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    return new Response(JSON.stringify({ error: "PDF data not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching PDF:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
