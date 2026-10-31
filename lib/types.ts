export type Mode = "alcohol" | "sin-alcohol";
export type Level = 1 | 2 | 3;
export type CardKind =
  | "reto"
  | "quien"
  | "nunca"
  | "duelo"
  | "todos"
  | "minijuego"
  | "virus";

export const CARD_KINDS: CardKind[] = [
  "reto",
  "quien",
  "nunca",
  "duelo",
  "todos",
  "minijuego",
  "virus",
];

/** Definición de una carta con tokens ({p1}, {castigo}...) sin resolver. */
export interface CardDef {
  kind: CardKind;
  level: Level;
  text: string;
  /** Solo para virus: cuántas cartas dura. */
  duration?: number;
  source?: "fijo" | "ia";
}

/** Carta ya lista para mostrar. */
export interface RenderedCard {
  id: string;
  kind: CardKind;
  level: Level;
  text: string;
  hint: string;
  duration?: number;
  source: "fijo" | "ia";
}

export interface ActiveVirus {
  id: string;
  text: string;
  remaining: number;
}

export interface GameConfig {
  players: string[];
  mode: Mode;
  level: Level;
}
