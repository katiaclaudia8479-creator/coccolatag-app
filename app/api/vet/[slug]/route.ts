import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request, { params }:{params:{slug:string}}) {
  const { pin } = await req.json();
  const supabase = getSupabaseAdmin();
  const { data: tag } = await supabase.from("tags").select("vet_pin, pet_id").eq("slug", params.slug).single();
  if (!tag) return NextResponse.json({ ok:false, error:"not_found" }, { status:404 });
  if (pin !== tag.vet_pin) return NextResponse.json({ ok:false, error:"bad_pin" }, { status:401 });
  const { data: med } = await supabase.from("medical_records").select("*").eq("pet_id", tag.pet_id).single();
  return NextResponse.json({ ok:true, medical: med ?? {} });
}
