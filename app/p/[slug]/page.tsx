import { headers } from "next/headers";
import Link from "next/link";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import SightingForm from "../../../components/SightingForm";
import SharePreciseLocation from "../../../components/SharePreciseLocation";

export const revalidate = 0;

export default async function PetPublicPage({ params }:{ params:{ slug:string }}) {
  const supabase = getSupabaseAdmin();
  const { data: tag } = await supabase
    .from("tags")
    .select("id, slug, property_certified, status, reward_eur, pet:pets(name, photo_url, public_note, owner:owners(name, phone_e164,email))")
    .eq("slug", params.slug).single();

  if (!tag) return <main className="mx-auto max-w-md p-6">Tag non trovato.</main>;

  // Log base scan
  const h = headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0] ?? "0.0.0.0";
  const ua = h.get("user-agent") ?? "";
  await supabase.from("scan_events").insert({ tag_id: tag.id, ip, user_agent: ua, approx_location: null });

  const phone = tag.pet?.owner?.phone_e164?.replace(/\s+/g,"");

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <div className="flex flex-col items-center">
        <img src={tag.pet?.photo_url ?? "https://placehold.co/300x300?text=Pet"} alt={tag.pet?.name ?? "Pet"} className="rounded-2xl w-40 h-40 object-cover" />
        <h1 className="mt-3 text-2xl font-bold">{tag.pet?.name}</h1>

        {tag.property_certified && (
          <div className="badge bg-emerald-50 text-emerald-700 mt-2">✓ Pet registrato – proprietà certificata</div>
        )}
      </div>

      {tag.status !== 'normal' && (
        <div className={`rounded-xl p-4 ${tag.status==='stolen'?'bg-red-50 text-red-700':'bg-amber-50 text-amber-800'}`}>
          <p className="font-semibold">
            {tag.status==='stolen' ? 'PET RUBATO' : 'PET SMARRITO'}
            {typeof tag.reward_eur === 'number' ? ` – Ricompensa: €${tag.reward_eur}` : ''}
          </p>
          <p>Se lo trovi contatta subito il proprietario.</p>
        </div>
      )}

      {tag.pet?.public_note && (
        <div className="rounded-xl p-4" style={{ backgroundColor: "#eaf7f8" }}>
          <p className="font-semibold">Info urgenti</p>
          <p>{tag.pet?.public_note}</p>
        </div>
      )}

      <div className="space-y-3">
        {phone && (
          <>
            <a className="btn btn-mint" href={`tel:${phone}`}>Chiama il proprietario</a>
            <a className="btn btn-outline" href={`https://wa.me/${phone.replace('+','')}?text=${encodeURIComponent(`Ciao! Ho trovato ${tag.pet?.name}.`)}`}>
              Scrivi su WhatsApp
            </a>
          </>
        )}
        <form action={`/api/alert/${params.slug}`} method="post">
          <button className="btn btn-outline w-full">Ho trovato {tag.pet?.name}</button>
        </form>
        <Link className="block text-center underline" href={`/p/${params.slug}?vet=1`}>Sei un veterinario?</Link>
      </div>

      {tag.status !== 'normal' && <SightingForm slug={params.slug} />}

      <SharePreciseLocation slug={params.slug} />
    </main>
  )
}
