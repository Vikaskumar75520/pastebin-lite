import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { content, ttl_seconds, max_views } = body;

  // 1️⃣ Validate content
  if (!content || typeof content !== "string" || content.trim() === "") {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  // 2️⃣ Validate ttl_seconds (optional)
  if (ttl_seconds !== undefined) {
    if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
      return NextResponse.json(
        { error: "ttl_seconds must be an integer >= 1" },
        { status: 400 }
      );
    }
  }

  // 3️⃣ Validate max_views (optional)
  if (max_views !== undefined) {
    if (!Number.isInteger(max_views) || max_views < 1) {
      return NextResponse.json(
        { error: "max_views must be an integer >= 1" },
        { status: 400 }
      );
    }
  }

  // 4️⃣ Calculate expiry time
  const expiresAt =
    ttl_seconds !== undefined
      ? new Date(Date.now() + ttl_seconds * 1000)
      : null;

  // 5️⃣ Save to database
  const paste = await prisma.paste.create({
    data: {
      content,
      expiresAt,
      maxViews: max_views ?? null,
    },
  });

  // 6️⃣ Generate shareable URL
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return NextResponse.json({
    id: paste.id,
    url: `${baseUrl}/p/${paste.id}`,
  });
}
