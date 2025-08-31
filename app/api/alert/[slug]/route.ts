import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Body: { code:string, owner?:{phone_e164?:string,email?:string}, pet?:{id:string, public_note?:string, photo_url?:string} }
 */
export async function POST(req: Request) {
  const body = await req.json();
  const { code, owner, pet } = body;

  if (!code) {
    return NextResponse.json({ ok: false, error: "missing_code" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // verifica codice
  const { data: oc, error: e1 } = await supabase
    .from("owner_codes")
    .select("owner_id")
    .eq("code", code)
    .single();

  if (e1 || !oc) {
    return NextResponse.json({ ok: false, error: "bad_code" }, { status: 401 });
  }

  const ownerId = oc.owner_id;

  // update proprietario
  if (owner) {
    const { error } = await supabase
      .from("owners")
      .update({
        phone_e164: owner.phone_e164 ?? null,
        email: owner.email ?? null,
      })
      .eq("id", ownerId);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
  }

  // update pet
  if (pet) {
    const { error } = await supabase
      .from("pets")
      .update({
        public_note: pet.public_note ?? null,
        photo_url: pet.photo_url ?? null,
      })
      .eq("id", pet.id)
      .eq("owner_id", ownerId);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}

  const whatsapp = data.pet?.owner?.phone_e164
    ? `https://wa.me/${data.pet.owner.phone_e164.replace('+','')}?text=${encodeURIComponent("Ho trovato " + data.pet.name)}`
    : null;
  return NextResponse.json({ ok:true, whatsappDeepLink: whatsapp });
}
