"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Game, LEVEL_LABEL } from "@/lib/engine";
import type { ActiveVirus, CardDef, CardKind, GameConfig, RenderedCard } from "@/lib/types";

const KIND_LABEL: Record<CardKind, string> = {
  reto: "RETO",
  quien: "¿QUIÉN?",
  nunca: "YO NUNCA",
  duelo: "DUELO",
  todos: "TODOS",
  minijuego: "MINIJUEGO",
  virus: "VIRUS",
};

const KIND_EMOJI: Record<CardKind, string> = {
  reto: "🎯",
  quien: "👉",
  nunca: "🙈",
  duelo: "⚔️",
  todos: "🎉",
  minijuego: "🧠",
  virus: "🦠",
};

export default function Play({ cfg, onExit }: { cfg: GameConfig; onExit: () => void }) {
  const game = useRef<Game | null>(null);
  const [card, setCard] = useState<RenderedCard | null>(null);
  const [viruses, setViruses] = useState<ActiveVirus[]>([]);
  const [toast, setToast] = useState("");
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const say = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3200);
  }, []);

  const advance = useCallback(() => {
    const g = game.current;
    if (!g) return;
    const { card: c, expired } = g.next();
    setCard(c);
    setViruses([...g.viruses]);
    if (expired.length) say("🦠 Terminó un virus. ¡Ya se puede respirar!");
    try {
      navigator.vibrate?.(12);
    } catch {}
  }, [say]);

  // iniciar partida
  useEffect(() => {
    game.current = new Game(cfg);
    advance();
    fetch("/api/generate")
      .then((r) => r.json())
      .then((d) => setAiEnabled(Boolean(d?.enabled)))
      .catch(() => {});
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // mantener la pantalla encendida
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const request = async () => {
      try {
        lock = (await navigator.wakeLock?.request("screen")) ?? null;
      } catch {}
    };
    request();
    const onVis = () => document.visibilityState === "visible" && request();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      lock?.release().catch(() => {});
    };
  }, []);

  async function generateAI() {
    if (aiLoading || !game.current) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          players: cfg.players,
          mode: cfg.mode,
          level: cfg.level,
          count: 8,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");
      const n = game.current.addExtra(data.cards as CardDef[]);
      say(`✨ ${n} cartas nuevas de IA entran en las próximas rondas`);
    } catch (e) {
      say((e as Error).message || "No se pudo generar con IA.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <main className="screen play">
      <div className="topbar">
        <button className="ghost" onClick={onExit} aria-label="Salir de la partida">
          ✕
        </button>
        <span className="muted">
          {cfg.mode === "alcohol" ? "🍻" : "🧃"} {LEVEL_LABEL[cfg.level]} · carta {game.current?.played ?? 0}
        </span>
        {aiEnabled ? (
          <button className="ghost ai" onClick={generateAI} disabled={aiLoading}>
            {aiLoading ? "…" : "✨ IA"}
          </button>
        ) : (
          <span className="spacer" />
        )}
      </div>

      {viruses.some((v) => v.id !== card?.id) && (
        <ul className="viruses" aria-label="Virus activos">
          {viruses.filter((v) => v.id !== card?.id).map((v) => (
            <li key={v.id}>
              <span>🦠 {v.text}</span>
              <b>{v.remaining}</b>
            </li>
          ))}
        </ul>
      )}

      <button className="stage" onClick={advance} aria-label="Siguiente carta">
        {card && (
          <article key={card.id} className={`card k-${card.kind}`}>
            <div className="kind">
              <span>{KIND_EMOJI[card.kind]}</span> {KIND_LABEL[card.kind]}
              {card.source === "ia" && <em className="badge">IA</em>}
            </div>
            <p className="text">{card.text}</p>
            {card.hint && <p className="hint">{card.hint}</p>}
          </article>
        )}
        <span className="tap">Toca para la siguiente</span>
      </button>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </main>
  );
}
