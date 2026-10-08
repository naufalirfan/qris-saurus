import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { loadConfig } from "./lib/config";
import { createApp } from "./app";

const config = loadConfig();
const app = createApp(config);

// Serve the built Vite client (dist/client) so the API and the UI share one
// origin. Unknown paths fall back to index.html for client-side routing.
const CLIENT_DIR = join(process.cwd(), "dist/client");
const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

app.get("*", async ({ request, set }) => {
  const pathname = decodeURIComponent(new URL(request.url).pathname);
  const candidate = join(CLIENT_DIR, pathname);
  const file = existsSync(candidate) && statSync(candidate).isFile()
    ? candidate
    : join(CLIENT_DIR, "index.html");

  if (!existsSync(file)) {
    set.status = 404;
    return { error: { message: "Client build not found. Run `bun run build:client`." } };
  }

  set.headers["content-type"] = MIME[extname(file)] ?? "application/octet-stream";
  return new Response(await readFile(file));
});

export default app;

if (!process.env.VERCEL) {
  app.listen(config.port);
  console.log(`ElysiaJS e-catalog example running at http://localhost:${config.port}`);
  console.log(`Payment mode: ${config.paymentMode}`);
}
