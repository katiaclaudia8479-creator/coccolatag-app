export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      <h1 className="text-3xl font-bold">CoccolaTag – Premium Anti-Furto</h1>
      <p className="text-gray-700">
        Questo progetto contiene: profilo pubblico, alert proprietario, GPS opzionale, PIN vet,
        modalità Smarrito/Rubato, segnalazioni community, aggiornamento con Owner Code.
      </p>
      <div className="card">
        <p className="mb-2">Dopo aver creato i dati su Supabase, visita:</p>
        <code className="text-sm">/p/&lt;slug-del-tuo-tag&gt;</code>
      </div>
      <p className="text-sm text-gray-500">Configura Supabase e .env prima del deploy.</p>
    </main>
  )
}
