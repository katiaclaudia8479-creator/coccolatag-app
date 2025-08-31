import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/** Body: { code: string } */
export async function POST(req: Request) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ ok: false, error: "missing_code" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: oc } = await supabase
    .from("owner_codes")
    .select("owner_id")
    .eq("code", code)
    .single();

  if (!oc) return NextResponse.json({ ok: false, error: "bad_code" }, { status: 401 });

  const { data: owner } = await supabase
    .from("owners")
    .select("id, name, phone_e164, email")
    .eq("id", oc.owner_id)
    .single();

  const { data: pets } = await supabase
    .from("pets")
    .select("id, name, species, sex, photo_url, public_note")
    .eq("owner_id", oc.owner_id);

  return NextResponse.json({ ok: true, owner, pets });
}

}
