import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const body = await req.json();
  const { precise, lat, lon, note } = body;

  const supabase = getSupabaseAdmin();

  // recupera dati pet + proprietario
  const { data, error } = await supabase
    .from("v_pet_public")
    .select("id, name, owner:owners(email, phone_e164)")
    .eq("slug", params.slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const ownerEmail = data.owner?.email;
  const ownerPhone = data.owner?.phone_e164;

  // link WhatsApp precompilato
  const whatsappDeepLink = ownerPhone
    ? `https://wa.me/${ownerPhone.replace("+", "")}?text=Ho%20trovato%20${encodeURIComponent(data.name)}`
    : null;

  // log in scansioni
  await supabase.from("scan_events").insert({
    pet_id: data.id,
    note,
    lat,
    lon,
  });

  // invio email via Resend (se configurato)
  if (ownerEmail && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "alerts@coccolatag.com",
      to: ownerEmail,
      subject: `Avvistamento di ${data.name}`,
      html: `
        <p>Ciao,</p>
        <p>Qualcuno ha segnalato <b>${data.name}</b>.</p>
        ${precise && lat && lon ? `<p>Posizione: ${lat}, ${lon}</p>` : ""}
        ${note ? `<p>Nota: ${note}</p>` : ""}
      `,
    });
  }

  return NextResponse.json({
    ok: true,
    whatsappDeepLink,
  });
}

  const whatsapp = data.pet?.owner?.phone_e164
    ? `https://wa.me/${data.pet.owner.phone_e164.replace('+','')}?text=${encodeURIComponent("Ho trovato " + data.pet.name)}`
    : null;
  return NextResponse.json({ ok:true, whatsappDeepLink: whatsapp });
}
