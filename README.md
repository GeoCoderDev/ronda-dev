# Ronda 🎉

Juego de cartas para fiestas hecho con Next.js (App Router + TypeScript). Inspirado en el género de "juegos para beber", con modo **con alcohol** y **sin alcohol**.

## Cómo usarlo

```bash
npm install
cp .env.example .env.local   # opcional: solo si quieres IA
npm run dev                  # http://localhost:3000
```

Producción: `npm run build && npm start`.

## Tipos de carta

Reto · ¿Quién? · Yo nunca · Duelo · Todos · Minijuego · **Virus** (regla que dura varias cartas y aparece arriba hasta que termina).

- 3 intensidades: Suave, Picante, Extremo (cada una incluye las anteriores).
- Los castigos cambian según el modo: tragos o penitencias.
- El mazo se baraja y no repite cartas hasta agotarlas; reparte a los jugadores de forma equilibrada.

## IA con Gemini (opcional)

Define `GEMINI_API_KEY` en `.env.local`. Si existe, aparece el botón **✨ IA** en la partida y genera 8 cartas nuevas para la intensidad elegida. Si no existe, la app funciona igual con el banco fijo y el botón no aparece.

- La llamada se hace solo en el servidor (`app/api/generate/route.ts`); la clave nunca llega al navegador.
- El servidor valida las cartas que devuelve Gemini (tipos, marcadores permitidos y longitud) y limita a 10 peticiones por minuto por IP.
- `GEMINI_MODEL` es opcional (por defecto `gemini-2.5-flash`).

## Añadir tus propias cartas

Edita `lib/cards.ts`. Marcadores disponibles: `{p1} {p2} {p3}` (jugadores), `{castigo}`, `{reparte}`, `{letra}`.

## PWA

Instalable desde el navegador del celular (manifest + service worker en producción). Con el banco fijo funciona sin conexión.
