import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#f7f5ef",
    categories: ["finance", "productivity"],
    description: "Anonymous sadaqah giving for Trustee-reviewed foundations.",
    display: "standalone",
    name: "Al-Infaaq",
    short_name: "Al-Infaaq",
    start_url: "/",
    theme_color: "#17130d",
  };
}
