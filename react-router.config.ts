import type { Config } from "@react-router/dev/config";

export default {
  // SPA mode — no server needed, works great on Vercel/Netlify static hosting
  ssr: false,
} satisfies Config;
