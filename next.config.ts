import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tillad ekstern billed-hosting (tilføj domæner ved behov)
  images: {
    remotePatterns: [],
  },

  // Logge fejl til konsollen i produktion — deaktivér for bedre fejlbeskeder
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

export default nextConfig;
