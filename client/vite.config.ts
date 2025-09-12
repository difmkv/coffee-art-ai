import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

console.log(
  "process.env.RAILWAY_PUBLIC_DOMAIN",
  process.env.RAILWAY_PUBLIC_DOMAIN
);

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Coffee Art AI",
        short_name: "Coffee Art AI PWA",
        description: "Coffee Art AI PWA",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://coffee-art-ai-production.up.railway.app/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
    allowedHosts: [
      "resplendent-fascination-production.up.railway.app",
      "coffee-art-ai-production.up.railway.app",
      "localhost",
    ],
  },
  build: {
    outDir: "dist",
  },
});
