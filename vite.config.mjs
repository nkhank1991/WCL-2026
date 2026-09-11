import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createContactHandler } from "./lib/contact-handler.mjs";
import { publicSeoConfig } from "./src/seo/config.js";

function contactApi() {
  let handler;
  const configure = server => {
    server.middlewares.use((req, res, next) => {
      if (req.url?.split('?')[0] !== '/api/contact') return next();
      return handler(req, res);
    });
  };
  return {
    name: 'wcl-contact-api',
    configResolved(config) { handler = createContactHandler({env: {...loadEnv(config.mode, config.envDir, ''), ...process.env}}); },
    configureServer: configure,
    configurePreviewServer: configure,
  };
}

export default defineConfig(({mode}) => ({
  define: {__WCL_SEO__: JSON.stringify(publicSeoConfig({...loadEnv(mode, process.cwd(), ''), ...process.env}))},
  build: {
    outDir: "dist/client",
    rollupOptions: {output: {manualChunks: {
      'react-vendor': ['react','react-dom','react-router-dom'],
      'motion-vendor': ['motion/react'],
    }}},
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    proxy: {"/api": "http://127.0.0.1:4174"},
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react(), contactApi()],
}));
