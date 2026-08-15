import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const requestedBase = env.VITE_BASE_PATH?.trim();
  const defaultBase = `/${slug(env.VITE_TEAM_NAME || "scu-china")}/`;
  const normalizedBase = requestedBase
    ? `${requestedBase.startsWith("/") ? "" : "/"}${requestedBase}`
    : defaultBase;

  return {
    base: normalizedBase.endsWith("/") ? normalizedBase : `${normalizedBase}/`,
    plugins: [react()],
  };
});
