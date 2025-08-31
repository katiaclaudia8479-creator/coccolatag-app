import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/** Body: { note?: string, reporter_email?: string, reporter_phone?: string,
            photo_url?: string, precise?: {lat:number,lng:number,accuracy?:number} } */
export async function POST(req: Request, { params }:{ params:{ slug:string }}) {
  const body = await req.json();
  const supabase = getSupabaseAdmin();

  const { data: tag } = await supabase.from("tags").select("id, status").eq("slug", params.slug).single();
  if (!tag) return NextResponse.json({ ok:false }, { status:404 });
  if (tag.status === 'normal') return NextResponse.json({ ok:false, error:"not_in_alert_state" }, { status:400 });

  const { data: se } = await supabase.from("sightings").insert({
    tag_id: tag.id,
    note: body.note ?? null,
    reporter_email: body.reporter_email ?? null,
    reporter_phone: body.reporter_phone ?? null,
    photo_url: body.photo_url ?? null,
    precise_location: body.precise ?? null
  }).select().single();

  return NextResponse.json({ ok:true, sighting: se });
}
