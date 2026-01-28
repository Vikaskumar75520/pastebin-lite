import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PastePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 🔑 IMPORTANT FIX: await params
  const { id } = await params;

  const paste = await prisma.paste.findUnique({
    where: { id },
  });

  if (!paste) notFound();

  if (paste.expiresAt && new Date() > paste.expiresAt) notFound();

  if (paste.maxViews && paste.viewCount >= paste.maxViews) notFound();

  await prisma.paste.update({
    where: { id: paste.id },
    data: { viewCount: { increment: 1 } },
  });

  return (
    <main style={{ padding: "20px" }}>
      <h1>Paste</h1>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "#f5f5f5",
          padding: "16px",
          borderRadius: "8px",
        }}
      >
        {paste.content}
      </pre>
    </main>
  );
}
