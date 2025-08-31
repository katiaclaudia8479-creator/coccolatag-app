"use client";
import { useState } from "react";

export default function SharePreciseLocation({ slug }:{ slug:string }) {
  const [status, setStatus] = useState<string | null>(null);
  async function handleShare() {
    if (!navigator.geolocation) { setStatus("Geolocalizzazione non supportata."); return; }
    setStatus("Richiesta in corso...");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const body = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
      const res = await fetch(`/api/scan/${slug}/gps`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(body) });
      setStatus(res.ok ? "Posizione inviata. Grazie!" : "Errore durante l'invio.");
    }, () => setStatus("Permesso negato."), { enableHighAccuracy: true, timeout: 10000 });
  }
  return (
    <div className="space-y-2">
      <button onClick={handleShare} className="btn btn-outline w-full">Condividi posizione precisa</button>
      {status && <p className="text-sm text-gray-600">{status}</p>}
    </div>
  );
}
