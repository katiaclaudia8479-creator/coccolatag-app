import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";

export async function POST(req: Request, { params }:{ params:{ slug:string }}) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("tags")
    .select("id, slug, status, pet:pets(name, owner:owners(name, email, phone_e164))")
    .eq("slug", params.slug).single();
  if (!data) return NextResponse.json({ ok:false }, { status:404 });

  const body = await req.json().catch(()=> ({}));
  const when = new Date().toLocaleString("it-IT");

  const email = data.pet?.owner?.email;
  if (email && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const gps = body?.precise ? `GPS: lat ${body.precise.lat}, lng ${body.precise.lng}` : "";
    const approx = body?.approx ? `Area: ${body.approx.city ?? ""} ${body.approx.country ?? ""}` : "";
    await resend.emails.send({
      from: "CoccolaTag <alerts@coccolatag.com>",
      to: email,
      subject: `Scansione CoccolaTag: ${data.pet?.name} (${data.status})`,
      html: `<p>Ciao ${data.pet?.owner?.name},</p>
             <p>Qualcuno ha scansionato la medaglietta di <b>${data.pet?.name}</b> alle ${when}.</p>
             <p>${gps || approx || "Nessuna posizione precisa condivisa."}</p>`
    });
    await supabase.from("notifications_log").insert({ tag_id: data.id, channel: 'email', payload: { when, ...body } });
  }

  const whatsapp = data.pet?.owner?.phone_e164
    ? `https://wa.me/${data.pet.owner.phone_e164.replace('+','')}?text=${encodeURIComponent("Ho trovato " + data.pet.name)}`
    : null;
  return NextResponse.json({ ok:true, whatsappDeepLink: whatsapp });
}
