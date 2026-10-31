import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const clientRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "");
  const authUrl =
    process.env.VITE_NEON_AUTH_URL ||
    env.VITE_NEON_AUTH_URL ||
    env.NEON_AUTH_BASE_URL;
  const authMode =
    process.env.VITE_AUTH_MODE ||
    env.VITE_AUTH_MODE ||
    (mode !== "production" && env.LOCAL_DATABASE_URL ? "local" : "neon");

  if (authMode !== "local" && authMode !== "neon") {
    throw new Error("VITE_AUTH_MODE must be 'local' or 'neon'");
  }
  if (authMode === "local" && !env.LOCAL_DATABASE_URL) {
    throw new Error(
      "Local auth requires LOCAL_DATABASE_URL in the root .env.local file",
    );
  }
  if (mode === "production" && (authMode !== "neon" || !authUrl)) {
    throw new Error(
      "Production builds must use Neon Auth; set VITE_NEON_AUTH_URL or NEON_AUTH_BASE_URL",
    );
  }

  return {
    cacheDir: path.resolve(clientRoot, ".vite"),
    define: {
      "import.meta.env.VITE_NEON_AUTH_URL": JSON.stringify(authUrl || ""),
      "import.meta.env.VITE_AUTH_MODE": JSON.stringify(authMode),
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
        process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL || "",
      ),
    },
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
    ],
    server: {
      proxy: {
        "/api": "http://localhost:3000",
      },
    },
  };
});
