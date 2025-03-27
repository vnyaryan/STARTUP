import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token missing" }, { status: 400 });
  }

  const result = await sql`
    SELECT user_id, expires_at FROM email_verification_tokens WHERE token = ${token} LIMIT 1;
  `;
  const record = result[0];

  if (!record || new Date(record.expires_at) < new Date()) {
    return NextResponse.json({ error: "Token invalid or expired" }, { status: 400 });
  }

  // Mark user as verified
  await sql`
    UPDATE users SET is_verified = TRUE WHERE id = ${record.user_id};
  `;

  // Delete used token
  await sql`
    DELETE FROM email_verification_tokens WHERE token = ${token};
  `;

  return NextResponse.redirect("https://your-app.vercel.app/login?verified=1");
}
