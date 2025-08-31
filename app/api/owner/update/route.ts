import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/** Body: { code:string, owner?:{phone_e164?:string,email?:string}, pet?:{id?:string, public_note?:string, photo_url?:string} } */
export async function POST(req: Request) {
  const body = await req.json();
  const supabase = getSupabaseAdmin();
  const code = body.code;
  if (!code) return NextResponse.json({ ok:false, error:"missing_code" }, { status:400 });

  const { data: oc } = await supabase.from("owner_codes").select("owner_id").eq("code", code).single();
  if (!oc) return NextResponse.json({ ok:false, error:"bad_code" }, { status:401 });

  if (body.owner) {
    await supabase.from("owners").update({
      phone_e164: body.owner.phone_e164 ?? undefined,
      email: body.owner.email ?? undefined
    }).eq("id", oc.owner_id);
  }

  if (body.pet && body.pet.id) {
    await supabase.from("pets").update({
      public_note: body.pet.public_note ?? undefined,
      photo_url: body.pet.photo_url ?? undefined
    }).eq("id", body.pet.id);
  }

  return NextResponse.json({ ok:true });
}
