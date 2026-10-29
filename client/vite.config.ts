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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "");
  const authUrl =
    process.env.VITE_NEON_AUTH_URL ||
    env.VITE_NEON_AUTH_URL ||
    env.NEON_AUTH_BASE_URL;

  if (mode === "production" && !authUrl) {
    throw new Error(
      "Set VITE_NEON_AUTH_URL or NEON_AUTH_BASE_URL before building the client",
    );
  }

  return {
    define: {
      "import.meta.env.VITE_NEON_AUTH_URL": JSON.stringify(authUrl || ""),
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
