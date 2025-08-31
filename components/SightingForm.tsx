"use client";
import { useState } from "react";

export default function SightingForm({ slug }:{ slug:string }) {
  const [note, setNote] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    let precise: any = null;
    try {
      precise = await new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
          () => resolve(null),
          { enableHighAccuracy: true, timeout: 8000 }
        );
      });
    } catch {}
    const res = await fetch(`/api/sighting/${slug}`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ note, reporter_email: email, reporter_phone: phone, photo_url: photoUrl, precise })
    });
    setStatus(res.ok ? "Segnalazione inviata. Grazie!" : "Errore: non inviata.");
    if (res.ok) { setNote(""); setPhotoUrl(""); }
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <h3 className="font-semibold">Segnala avvistamento</h3>
      <input className="w-full border rounded-xl p-2" placeholder="Tuo email (opzionale)" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="w-full border rounded-xl p-2" placeholder="Tuo telefono (opzionale)" value={phone} onChange={e=>setPhone(e.target.value)} />
      <input className="w-full border rounded-xl p-2" placeholder="URL foto (opzionale)" value={photoUrl} onChange={e=>setPhotoUrl(e.target.value)} />
      <textarea className="w-full border rounded-xl p-2" placeholder="Note (es. visto in Via Roma)"
        value={note} onChange={e=>setNote(e.target.value)} />
      <button className="btn btn-mint w-full" type="submit">Invia segnalazione</button>
      {status && <p className="text-sm">{status}</p>}
    </form>
  );
}
