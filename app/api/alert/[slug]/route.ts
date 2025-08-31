import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const { note, lat, lon } = body || {};

    const supabase = getSupabaseAdmin();

    // Leggo pet + contatti proprietario dalla view
    const { data, error } = await supabase
      .from("v_pet_contact")
      .select("pet_id, pet_name, owner_email, owner_phone")
      .eq("slug", params.slug)
      .single();

    if (error || !data) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    // Loggo la scansione (con eventuale posizione)
    await supabase.from("scan_events").insert({
      pet_id: data.pet_id,
      note,
      lat,
      lon,
    });

    // Deep link WhatsApp
    const whatsappDeepLink = data.owner_phone
      ? `https://wa.me/${data.owner_phone.replace("+", "")}?text=Ho%20trovato%20${encodeURIComponent(
          data.pet_name
        )}`
      : null;

    // (Email via Resend: riattivabile quando vuoi)
    // if (data.owner_email && process.env.RESEND_API_KEY) {
    //   const { Resend } = await import("resend");
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   await resend.emails.send({
    //     from: "alerts@coccolatag.com",
    //     to: data.owner_email,
    //     subject: `Avvistamento di ${data.pet_name}`,
    //     html: `
    //       <p>Ciao,</p>
    //       <p>Qualcuno ha segnalato <b>${data.pet_name}</b>.</p>
    //       ${lat && lon ? `<p>Posizione: ${lat}, ${lon}</p>` : ""}
    //       ${note ? `<p>Nota: ${note}</p>` : ""}
    //     `,
    //   });
    // }

    return NextResponse.json({ ok: true, whatsappDeepLink });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
