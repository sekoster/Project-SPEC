import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vinyl Vault",
    short_name: "VinylVault",
    description: "Your personal vinyl collection",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#141315",
    theme_color: "#FF5F00",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
