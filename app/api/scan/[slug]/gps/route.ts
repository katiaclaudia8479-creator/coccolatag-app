import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
export async function POST(req: Request, { params }:{ params: { slug: string }}) {
  const { lat, lng, accuracy } = await req.json();
  const supabase = getSupabaseAdmin();
  const { data: tag } = await supabase.from("tags").select("id").eq("slug", params.slug).single();
  if (!tag) return NextResponse.json({ ok:false }, { status:404 });
  await supabase.from("scan_events").insert({ tag_id: tag.id, precise_location: { lat, lng, accuracy } });
  return NextResponse.json({ ok:true });
}
