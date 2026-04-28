import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vanetex.vercel.app";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vanetex",
    short_name: "Vanetex",
    description: "Daily investing challenges. Build your edge.",
    start_url: "/challenge",
    display: "standalone",
    orientation: "portrait",
    background_color: "#090b11",
    theme_color: "#090b11",
    icons: [
      {
        src: `${SITE_URL}/pwa-icon?size=192`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${SITE_URL}/pwa-icon?size=512`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
