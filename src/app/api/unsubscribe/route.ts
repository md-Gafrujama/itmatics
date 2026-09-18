import { NextResponse } from "next/server";
import {
  unsubscribeByEmail,
  unsubscribeByToken,
} from "@/lib/subscribers";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const email = typeof data.email === "string" ? data.email : "";
  const token = typeof data.token === "string" ? data.token : "";
  const reason = typeof data.reason === "string" ? data.reason : "";

  if (!reason.trim()) {
    return NextResponse.json(
      { error: "Please tell us why you are leaving" },
      { status: 400 },
    );
  }

  if (token.trim()) {
    const ok = await unsubscribeByToken(token, reason);
    if (!ok) {
      return NextResponse.json(
        { error: "This unsubscribe link is invalid or expired." },
        { status: 400 },
      );
    }
    return NextResponse.json({
      ok: true,
      message: "You have been unsubscribed from The Download.",
    });
  }

  const result = await unsubscribeByEmail(email, reason);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true, message: result.message });
}
