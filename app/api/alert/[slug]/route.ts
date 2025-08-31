import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json();
    const { note, lat, lon } = body;

    const supabase = getSupabaseAdmin();

    // recupero pet e proprietario
    const { data, error } = await supabase
      .from("pets")
      .select("id, name, owners(email, phone_e164)")
      .eq("slug", params.slug)
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const email = data.owners?.email;
    const phone = data.owners?.phone_e164;

    // salvo evento scansione
    await supabase.from("scan_events").insert({
      pet_id: data.id,
      note,
      lat,
      lon,
    });

    // ritorno link WhatsApp
    const whatsappDeepLink = phone
      ? `https://wa.me/${phone.replace("+", "")}?text=Ho%20trovato%20${encodeURIComponent(data.name)}`
      : null;

    return NextResponse.json({ ok: true, whatsappDeepLink });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
