"use client";
import { useState } from "react";
import Setup from "@/components/Setup";
import Play from "@/components/Play";
import type { GameConfig } from "@/lib/types";

export default function Home() {
  const [cfg, setCfg] = useState<GameConfig | null>(null);
  return cfg ? (
    <Play cfg={cfg} onExit={() => setCfg(null)} />
  ) : (
    <Setup onStart={setCfg} />
  );
}
