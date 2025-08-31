# CoccolaTag Premium Anti-Furto (Next.js + Supabase)

Include: profilo pubblico, notifiche email (Resend), GPS volontario, modalità Smarrito/Rubato,
segnalazioni della community, aggiornamento dati con Owner Code.

## Setup
1) Supabase → SQL Editor → incolla **schema.sql** (Run).
2) Copia `.env.example` in `.env.local` e inserisci le chiavi Supabase/Resend.
3) `npm install` e `npm run dev` per sviluppo locale.
4) Inserisci in Supabase owners/pets/tags/owner_codes e apri `/p/<slug>`.
5) Deploy su Vercel importando il repo da GitHub e impostando le stesse env vars.

## Sicurezza
- Non esporre `SUPABASE_SERVICE_ROLE` al client (rimane lato server).
