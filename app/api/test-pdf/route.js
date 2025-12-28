import { db } from "@/lib/prisma";

export async function GET() {
  try {
    // Get first upload to test
    const upload = await db.upload.findFirst({
      take: 1,
    });

    if (!upload) {
      return new Response(JSON.stringify({ error: "No uploads found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        uploadId: upload.id,
        fileName: upload.fileName,
        fileSize: upload.fileSize,
        hasPdfData: !!upload.pdfData,
        pdfDataLength: upload.pdfData ? upload.pdfData.length : 0,
        fileType: upload.fileType,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
