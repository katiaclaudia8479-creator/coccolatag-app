import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/** Body: { status: 'normal'|'lost'|'stolen', reward_eur?: number, ownerCode?: string } */
export async function POST(req: Request, { params }:{ params:{ slug:string }}) {
  const { status, reward_eur, ownerCode } = await req.json();
  if (!['normal','lost','stolen'].includes(status)) {
    return NextResponse.json({ ok:false, error:'bad_status' }, { status:400 });
  }
  const supabase = getSupabaseAdmin();

  const { data: tag } = await supabase.from("tags").select("id, pet_id").eq("slug", params.slug).single();
  if (!tag) return NextResponse.json({ ok:false }, { status:404 });

  const { data: oc } = await supabase.from("owner_codes").select("owner_id").eq("code", ownerCode).single();
  if (!oc) return NextResponse.json({ ok:false, error:"bad_owner_code" }, { status:401 });

  const { data: pet } = await supabase.from("pets").select("owner_id").eq("id", tag.pet_id).single();
  if (!pet || pet.owner_id !== oc.owner_id) return NextResponse.json({ ok:false, error:"unauthorized" }, { status:401 });

  const { error } = await supabase.from("tags").update({
    status, status_since: new Date().toISOString(), reward_eur
  }).eq("id", tag.id);
  if (error) return NextResponse.json({ ok:false, error: error.message }, { status:500 });
  return NextResponse.json({ ok:true });
}
