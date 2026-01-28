import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // ✅ Next.js 16 requires awaiting params in route handlers
  const { id } = await context.params;

  const paste = await prisma.paste.findUnique({
    where: { id },
  });

  if (!paste) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (paste.expiresAt && new Date() > paste.expiresAt) {
    return NextResponse.json({ error: "Expired" }, { status: 404 });
  }

  if (paste.maxViews && paste.viewCount >= paste.maxViews) {
    return NextResponse.json(
      { error: "View limit exceeded" },
      { status: 404 }
    );
  }

  const updated = await prisma.paste.update({
    where: { id },
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
