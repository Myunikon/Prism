import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["vite.svg"],
      manifest: {
        name: "PRISM - Tactical Security Suite",
        short_name: "PRISM",
        description: "Offline-capable forensic security tool",
        theme_color: "#050505",
        background_color: "#050505",
        display: "standalone",
        icons: [
          {
            src: "assets/icon.png", // Vite PWA handles asset pathing
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "assets/icon.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        // Cache all assets in the build
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ],
  base: "/Qrops/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
