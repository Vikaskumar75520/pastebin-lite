import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getNow(req: Request) {
  if (process.env.TEST_MODE === "1") {
    const header = req.headers.get("x-test-now-ms");
    if (header) {
      return new Date(Number(header));
    }
  }
  return new Date();
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const now = getNow(req);

  const paste = await prisma.paste.findUnique({
    where: { id: params.id },
  });

  // Not found
  if (!paste) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Expired by time
  if (paste.expiresAt && now > paste.expiresAt) {
    return NextResponse.json({ error: "Expired" }, { status: 404 });
  }

  // View limit exceeded
  if (paste.maxViews && paste.viewCount >= paste.maxViews) {
    return NextResponse.json(
      { error: "View limit exceeded" },
      { status: 404 }
    );
  }

  // Increment view count
  const updated = await prisma.paste.update({
    where: { id: paste.id },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json({
    content: updated.content,
    remaining_views: updated.maxViews
      ? updated.maxViews - updated.viewCount
      : null,
    expires_at: updated.expiresAt,
  });
}
