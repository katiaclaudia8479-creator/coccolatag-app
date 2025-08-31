"use client";
import { useState, useEffect } from "react";

type Owner = { id: string; name: string; phone_e164: string | null; email: string | null };
type Pet = { id: string; name: string; species: string | null; sex: string | null; photo_url: string | null; public_note: string | null };

export default function UpdatePage() {
  const [code, setCode] = useState("");
  const [owner, setOwner] = useState<Owner | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadData(c: string) {
    setLoading(true); setMsg(null);
    const res = await fetch("/api/owner/get", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: c }) });
    const j = await res.json();
    if (!res.ok || !j.ok) { setMsg("Codice non valido."); setOwner(null); setPets([]); }
    else { setOwner(j.owner); setPets(j.pets || []); }
    setLoading(false);
  }

  async function saveOwner() {
    if (!owner) return;
    const res = await fetch("/api/owner/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, owner: { phone_e164: owner.phone_e164 ?? "", email: owner.email ?? "" } })
    });
    setMsg(res.ok ? "Dati proprietario salvati." : "Errore salvataggio proprietario.");
  }

  async function savePet(p: Pet) {
    const res = await fetch("/api/owner/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, pet: { id: p.id, public_note: p.public_note ?? "", photo_url: p.photo_url ?? "" } })
    });
    setMsg(res.ok ? `Dati di ${p.name} salvati.` : `Errore salvataggio di ${p.name}.`);
  }

  // se arrivi con ?code=... precompila
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = q.get("code");
    if (c) { setCode(c); loadData(c); }
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Aggiorna profilo</h1>

      {/* Owner code */}
      <div className="card space-y-3">
        <label className="block text-sm font-medium">Owner Code</label>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-xl p-2"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="OC-XXXXXX"
          />
          <button
            className="btn btn-mint"
            onClick={() => loadData(code)}
            disabled={!code || loading}
          >
            {loading ? "Carico..." : "Apri"}
          </button>
        </div>
        <p className="text-xs text-gray-500">Trovi l’Owner Code nel retro medaglietta o nella mail di attivazione.</p>
      </div>

      {owner && (
        <div className="card space-y-3">
          <h2 className="font-semibold">Contatti proprietario</h2>
          <input
            className="w-full border rounded-xl p-2"
            value={owner.phone_e164 ?? ""}
            onChange={(e) => setOwner({ ...owner, phone_e164: e.target.value })}
            placeholder="+39..."
          />
          <input
            className="w-full border rounded-xl p-2"
            value={owner.email ?? ""}
            onChange={(e) => setOwner({ ...owner, email: e.target.value })}
            placeholder="email@esempio.it"
          />
          <button className="btn btn-mint w-full" onClick={saveOwner}>Salva contatti</button>
        </div>
      )}

      {pets.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold">I tuoi pet</h2>
          {pets.map((p, i) => (
            <div key={p.id} className="card space-y-2">
              <div className="flex items-center gap-3">
                <img src={p.photo_url || "https://placehold.co/80x80?text=PET"} className="w-16 h-16 rounded-xl object-cover" />
                <div className="font-semibold">{p.name}</div>
              </div>
              <input
                className="w-full border rounded-xl p-2"
                placeholder="URL foto (opzionale)"
                value={p.photo_url ?? ""}
                onChange={(e) => {
                  const arr = [...pets]; arr[i] = { ...p, photo_url: e.target.value }; setPets(arr);
                }}
              />
              <textarea
                className="w-full border rounded-xl p-2"
                placeholder="Info urgenti (allergie, terapie, ecc.)"
                value={p.public_note ?? ""}
                onChange={(e) => {
                  const arr = [...pets]; arr[i] = { ...p, public_note: e.target.value }; setPets(arr);
                }}
              />
              <button className="btn btn-outline w-full" onClick={() => savePet(p)}>
                Salva {p.name}
              </button>
            </div>
          ))}
        </div>
      )}

      {msg && <p className="text-sm text-gray-700">{msg}</p>}
    </main>
  );
}
