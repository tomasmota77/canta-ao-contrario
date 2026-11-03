// Copia o jogo (pasta de cima) para app/www, que é o que vai dentro da app.
import { cpSync, rmSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const app = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = join(app, "..");
const www = join(app, "www");
rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });
for (const item of ["index.html", "privacy.html", "manifest.webmanifest", "js", "fonts", "icons"]) {
  cpSync(join(site, item), join(www, item), { recursive: true });
}
console.log("Jogo copiado para", www);
