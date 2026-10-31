"use client";
import { useEffect, useState } from "react";
import type { GameConfig, Level, Mode } from "@/lib/types";

const KEY = "ronda:setup";
const MAX_PLAYERS = 12;

export default function Setup({ onStart }: { onStart: (cfg: GameConfig) => void }) {
  const [players, setPlayers] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [mode, setMode] = useState<Mode>("sin-alcohol");
  const [level, setLevel] = useState<Level>(1);
  const [adult, setAdult] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "null");
      if (s) {
        if (Array.isArray(s.players)) setPlayers(s.players.slice(0, MAX_PLAYERS));
        if (s.level) setLevel(s.level);
      }
    } catch {}
  }, []);

  function add() {
    const n = name.trim().slice(0, 20);
    if (!n) return;
    if (players.some((p) => p.toLowerCase() === n.toLowerCase())) {
      setError("Ese nombre ya está en la lista.");
      return;
    }
    if (players.length >= MAX_PLAYERS) {
      setError(`Máximo ${MAX_PLAYERS} jugadores.`);
      return;
    }
    setPlayers([...players, n]);
    setName("");
    setError("");
  }

  const needsAdult = mode === "alcohol" && !adult;
  const ready = players.length >= 2 && !needsAdult;

  function start() {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ players, level }));
    } catch {}
    onStart({ players, mode, level });
  }

  return (
    <main className="screen setup">
      <header className="brand">
        <h1>Ronda</h1>
        <p>Retos, preguntas y virus para animar la reunión.</p>
      </header>

      <section className="panel">
        <h2>Jugadores <span className="muted">({players.length}/{MAX_PLAYERS})</span></h2>
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del jugador"
            maxLength={20}
            enterKeyHint="done"
            aria-label="Nombre del jugador"
          />
          <button type="submit" className="btn small" disabled={!name.trim()}>
            Añadir
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <ul className="chips">
          {players.map((p) => (
            <li key={p}>
              {p}
              <button
                aria-label={`Quitar a ${p}`}
                onClick={() => setPlayers(players.filter((x) => x !== p))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        {players.length < 2 && <p className="muted">Añade al menos 2 jugadores.</p>}
      </section>

      <section className="panel">
        <h2>Modo</h2>
        <div className="seg">
          <button className={mode === "sin-alcohol" ? "on" : ""} onClick={() => setMode("sin-alcohol")}>
            🧃 Sin alcohol
          </button>
          <button className={mode === "alcohol" ? "on" : ""} onClick={() => setMode("alcohol")}>
            🍻 Con alcohol
          </button>
        </div>
        {mode === "alcohol" && (
          <label className="check">
            <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
            <span>Todos somos mayores de edad y bebemos con responsabilidad. Nadie está obligado a tomar.</span>
          </label>
        )}
      </section>

      <section className="panel">
        <h2>Intensidad</h2>
        <div className="seg three">
          <button className={level === 1 ? "on" : ""} onClick={() => setLevel(1)}>😇 Suave</button>
          <button className={level === 2 ? "on" : ""} onClick={() => setLevel(2)}>🌶️ Picante</button>
          <button className={level === 3 ? "on" : ""} onClick={() => setLevel(3)}>🔥 Extremo</button>
        </div>
        <p className="muted">Cada nivel incluye las cartas de los anteriores.</p>
      </section>

      <button className="btn big" disabled={!ready} onClick={start}>
        ¡Empezar!
      </button>
    </main>
  );
}
