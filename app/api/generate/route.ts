import { NextResponse } from "next/server";
import { CARD_KINDS, type CardDef, type CardKind, type Level } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const ALLOWED_TOKENS = new Set(["p1", "p2", "p3", "castigo", "reparte", "letra"]);

// Límite sencillo en memoria: 10 peticiones por minuto por IP.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 10;
}

export async function GET() {
  return NextResponse.json({ enabled: Boolean(process.env.GEMINI_API_KEY) });
}

function cleanName(n: unknown) {
  return String(n ?? "")
    .replace(/[^\p{L}\p{N} .'-]/gu, "")
    .trim()
    .slice(0, 20);
}

function validate(raw: unknown, playerCount: number, level: Level): CardDef[] {
  if (!Array.isArray(raw)) return [];
  const out: CardDef[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const { kind, text, duration } = item as Record<string, unknown>;
    if (typeof text !== "string" || typeof kind !== "string") continue;
    if (!CARD_KINDS.includes(kind as CardKind)) continue;
    const t = text.trim();
    if (t.length < 8 || t.length > 280) continue;
    // solo tokens conocidos
    const tokens = [...t.matchAll(/\{([^}]*)\}/g)].map((m) => m[1]);
    if (tokens.some((tk) => !ALLOWED_TOKENS.has(tk))) continue;
    if (/[<>]/.test(t)) continue;
    const need = Math.max(0, ...[...t.matchAll(/\{p(\d)\}/g)].map((m) => Number(m[1])));
    if (need > playerCount) continue;
    out.push({
      kind: kind as CardKind,
      level,
      text: t,
      ...(kind === "virus"
        ? { duration: Math.min(7, Math.max(3, Number(duration) || 5)) }
        : {}),
      source: "ia",
    });
  }
  return out;
}

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "La IA no está configurada." }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) {
    return NextResponse.json({ error: "Muy rápido, espera un momento." }, { status: 429 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida." }, { status: 400 });
  }

  const players: string[] = (Array.isArray(body?.players) ? body.players : [])
    .map(cleanName)
    .filter(Boolean)
    .slice(0, 12);
  if (players.length < 2) {
    return NextResponse.json({ error: "Faltan jugadores." }, { status: 400 });
  }
  const level = ([1, 2, 3].includes(body?.level) ? body.level : 1) as Level;
  const mode = body?.mode === "sin-alcohol" ? "sin-alcohol" : "alcohol";
  const count = Math.min(12, Math.max(4, Number(body?.count) || 8));

  const levelDesc =
    level === 1
      ? "suave: divertido, apto para cualquier grupo"
      : level === 2
        ? "picante: atrevido y pícaro, con vergüenza moderada"
        : "extremo: muy atrevido, picante y osado, pero nunca explícito";

  const prompt = `Eres el creador de cartas de un juego de fiesta en español para un grupo de amigos (similar a "Picolo").
Genera ${count} cartas NUEVAS y originales, de intensidad ${levelDesc}.
Jugadores (solo para darte contexto, NO uses sus nombres): ${players.length}.

Tipos permitidos (campo "kind"):
- "reto": una acción para {p1}. Termina con una consecuencia usando {castigo}.
- "quien": pregunta "¿Quién es más probable que ...?" (sin tokens).
- "nunca": frase "Yo nunca he ..." (sin tokens).
- "duelo": reto entre {p1} y {p2}; el perdedor recibe {castigo}.
- "todos": acción para todo el grupo; puede usar {castigo} o {reparte}.
- "minijuego": juego verbal rápido (categorías, rimas, la letra {letra}) con {castigo} al que falle.
- "virus": regla que dura varias cartas; incluye "duration" entre 3 y 7 y {castigo} para quien la rompa.

Reglas estrictas:
- Usa SOLO estos marcadores: {p1}, {p2}, {p3}, {castigo}, {reparte}, {letra}. Nunca otros.
- NO menciones alcohol, bebidas, tragos, beber ni penitencias directamente: de eso se encarga {castigo}/{reparte}.
- Cada texto máximo 200 caracteres, en español neutro y coloquial.
- Nada sexualmente explícito, ni humillante por cuerpo, raza, religión, orientación, discapacidad o salud. Nada ilegal ni peligroso.
- Mezcla tipos. No repitas ideas clásicas demasiado obvias.
Responde SOLO con el JSON.`;

  const schema = {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: {
        kind: { type: "STRING", enum: CARD_KINDS },
        text: { type: "STRING" },
        duration: { type: "INTEGER" },
      },
      required: ["kind", "text"],
    },
  };

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.1,
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        }),
        signal: AbortSignal.timeout(25_000),
      },
    );

    if (!res.ok) {
      console.error("Gemini error", res.status);
      return NextResponse.json({ error: "La IA no respondió bien. Intenta otra vez." }, { status: 502 });
    }

    const data = await res.json();
    const txt: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!txt) {
      return NextResponse.json({ error: "La IA no devolvió cartas." }, { status: 502 });
    }
    const cards = validate(JSON.parse(txt), players.length, level);
    if (!cards.length) {
      return NextResponse.json({ error: "No salieron cartas válidas, prueba otra vez." }, { status: 502 });
    }
    return NextResponse.json({ cards, mode });
  } catch (e) {
    console.error("Gemini request failed", (e as Error).name);
    return NextResponse.json({ error: "No se pudo contactar a la IA." }, { status: 502 });
  }
}
