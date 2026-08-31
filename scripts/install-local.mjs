import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const vaultPaths = process.argv.slice(2);
if (vaultPaths.length === 0) {
  throw new Error("Usage: node scripts/install-local.mjs <vault-path> [vault-path ...]");
}

const manifest = JSON.parse(await readFile("manifest.json", "utf8"));
for (const vaultPath of vaultPaths) {
  const pluginDir = path.join(vaultPath, ".obsidian", "plugins", manifest.id);
  const enabledPluginsPath = path.join(vaultPath, ".obsidian", "community-plugins.json");

  await mkdir(pluginDir, { recursive: true });
  for (const file of ["manifest.json", "main.js", "styles.css"]) {
    await cp(file, path.join(pluginDir, file));
  }

  const enabled = JSON.parse(await readFile(enabledPluginsPath, "utf8"));
  if (!enabled.includes(manifest.id)) {
    enabled.push(manifest.id);
    await writeFile(enabledPluginsPath, `${JSON.stringify(enabled, null, 2)}\n`, "utf8");
  }

  console.log(`Installed ${manifest.name} ${manifest.version} to ${pluginDir}`);
}
