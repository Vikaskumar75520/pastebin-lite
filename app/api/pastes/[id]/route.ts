import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

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
