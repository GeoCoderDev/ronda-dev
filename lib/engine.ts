import { CARDS } from "./cards";
import type {
  ActiveVirus,
  CardDef,
  GameConfig,
  Level,
  RenderedCard,
} from "./types";

const SOFT_PENALTIES = [
  "haz 10 sentadillas",
  "cuenta un secreto",
  "imita a un animal hasta tu próximo turno",
  "canta 10 segundos de una canción",
  "habla en tercera persona durante 2 rondas",
  "dile un halago sincero a cada jugador",
  "haz 5 flexiones (o su versión fácil)",
  "cuenta tu momento más vergonzoso",
  "baila 15 segundos sin música",
  "responde la próxima pregunta que te haga el grupo",
  "habla como robot hasta tu próximo turno",
  "deja que el grupo te ponga un apodo por esta noche",
];

const LETTERS = "ABCDEFGHIJLMNOPRST";

export const LEVEL_LABEL: Record<Level, string> = {
  1: "Suave",
  2: "Picante",
  3: "Extremo",
};

function rand(n: number) {
  return Math.floor(Math.random() * n);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Cantidad de jugadores distintos que necesita un texto ({p1}..{p3}). */
export function playersNeeded(text: string): number {
  let max = 0;
  for (const m of text.matchAll(/\{p(\d)\}/g)) max = Math.max(max, Number(m[1]));
  return max;
}

function hintFor(def: CardDef, mode: GameConfig["mode"]): string {
  const alcohol = mode === "alcohol";
  switch (def.kind) {
    case "quien":
      return alcohol
        ? "A la cuenta de tres, todos señalan. El más señalado toma 2 tragos."
        : "A la cuenta de tres, todos señalan. El más señalado cuenta una anécdota.";
    case "nunca":
      return alcohol
        ? "Quien lo haya hecho, toma un trago."
        : "Quien lo haya hecho, lo cuenta en una frase.";
    case "virus":
      return `Dura ${def.duration ?? 5} cartas`;
    default:
      return "";
  }
}

let uid = 0;

export class Game {
  viruses: ActiveVirus[] = [];
  played = 0;
  private queue: CardDef[] = [];
  private usage: Record<string, number> = {};
  private last: CardDef | null = null;

  constructor(
    public readonly cfg: GameConfig,
    private readonly pool: CardDef[] = CARDS,
  ) {
    for (const p of cfg.players) this.usage[p] = 0;
    this.refill();
  }

  /** ¿La carta es jugable con este grupo y esta intensidad? */
  private playable(def: CardDef) {
    return (
      def.level <= this.cfg.level &&
      playersNeeded(def.text) <= this.cfg.players.length
    );
  }

  private refill() {
    let next = shuffle(this.pool.filter((d) => this.playable(d)));
    // evita repetir tipo de carta consecutivo cuando se puede
    next = this.spreadKinds(next);
    this.queue.push(...next);
  }

  private spreadKinds(list: CardDef[]): CardDef[] {
    const out: CardDef[] = [];
    const rest = [...list];
    let prev: string | null = this.last?.kind ?? null;
    while (rest.length) {
      let idx = rest.findIndex((d) => d.kind !== prev);
      if (idx === -1) idx = 0;
      const [d] = rest.splice(idx, 1);
      out.push(d);
      prev = d.kind;
    }
    return out;
  }

  /** Cartas de IA: se juegan a continuación. */
  addExtra(defs: CardDef[]) {
    const ok = defs.filter((d) => this.playable(d));
    this.queue.unshift(...ok.map((d) => ({ ...d, source: "ia" as const })));
    return ok.length;
  }

  get remaining() {
    return this.queue.length;
  }

  private pickPlayers(n: number): string[] {
    const sorted = shuffle(this.cfg.players).sort(
      (a, b) => this.usage[a] - this.usage[b],
    );
    const chosen = sorted.slice(0, n);
    for (const p of chosen) this.usage[p]++;
    return shuffle(chosen);
  }

  private punishment(level: Level): string {
    if (this.cfg.mode === "alcohol") {
      const base = level === 1 ? 1 : level === 2 ? 2 : 3;
      const n = base + rand(2);
      return `toma ${n} ${n === 1 ? "trago" : "tragos"}`;
    }
    return `cumple una penitencia: ${SOFT_PENALTIES[rand(SOFT_PENALTIES.length)]}`;
  }

  private distribute(level: Level): string {
    if (this.cfg.mode === "alcohol") {
      const n = level + 1 + rand(2);
      return `reparte ${n} tragos`;
    }
    return "manda una penitencia a quien tú quieras";
  }

  private render(def: CardDef): RenderedCard {
    const need = playersNeeded(def.text);
    const ps = need ? this.pickPlayers(need) : [];
    const text = def.text
      .replace(/\{p(\d)\}/g, (_, d) => ps[Number(d) - 1] ?? "alguien")
      .replace(/\{castigo\}/g, () => this.punishment(def.level))
      .replace(/\{reparte\}/g, () => this.distribute(def.level))
      .replace(/\{letra\}/g, () => LETTERS[rand(LETTERS.length)]);
    return {
      id: `c${++uid}`,
      kind: def.kind,
      level: def.level,
      text,
      hint: hintFor(def, this.cfg.mode),
      duration: def.duration,
      source: def.source ?? "fijo",
    };
  }

  next(): { card: RenderedCard; expired: ActiveVirus[] } {
    // envejecer virus activos
    const expired: ActiveVirus[] = [];
    this.viruses = this.viruses
      .map((v) => ({ ...v, remaining: v.remaining - 1 }))
      .filter((v) => {
        if (v.remaining <= 0) {
          expired.push(v);
          return false;
        }
        return true;
      });

    if (this.queue.length === 0) this.refill();
    const def = this.queue.shift()!;
    this.last = def;
    const card = this.render(def);
    this.played++;

    if (card.kind === "virus") {
      this.viruses.push({
        id: card.id,
        text: card.text,
        remaining: card.duration ?? 5,
      });
    }
    return { card, expired };
  }
}
