import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ronda",
    short_name: "Ronda",
    description: "Juego de cartas para fiestas: retos, preguntas y virus.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1a0b2e",
    theme_color: "#1a0b2e",
    lang: "es",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
