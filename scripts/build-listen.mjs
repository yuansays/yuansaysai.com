import { spawnSync } from "node:child_process";
import { copyFileSync, cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const application = path.join(root, "apps", "yuansays-listen");
const generated = path.join(application, "dist");
const destination = path.join(root, "public", "listen");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: application,
    env: { ...process.env, CI: "true" },
    stdio: "inherit",
    windowsHide: true,
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (!existsSync(path.join(application, "node_modules", "vite", "package.json"))) {
  console.log("Installing locked listening-app dependencies…");
  if (process.platform === "win32") {
    run(process.env.ComSpec || "cmd.exe", [
      "/d", "/s", "/c",
      "npx.cmd --yes pnpm@11.9.0 install --frozen-lockfile --ignore-scripts",
    ]);
  } else {
    run("npx", ["--yes", "pnpm@11.9.0", "install", "--frozen-lockfile", "--ignore-scripts"]);
  }
}

console.log("Building yuansays listen for /listen/…");
if (process.platform === "win32") {
  run(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", "npm.cmd run build"]);
} else {
  run("npm", ["run", "build"]);
}

if (!existsSync(path.join(generated, "index.html"))) {
  throw new Error("Listening-app build finished without dist/index.html.");
}
copyFileSync(path.join(application, "LICENSE"), path.join(generated, "LICENSE.txt"));
if (path.resolve(destination) !== path.resolve(root, "public", "listen")) {
  throw new Error(`Refusing to replace unexpected destination: ${destination}`);
}
mkdirSync(path.dirname(destination), { recursive: true });
rmSync(destination, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
cpSync(generated, destination, { recursive: true, force: false, errorOnExist: true });
if (!existsSync(path.join(destination, "index.html"))) {
  throw new Error("Listening-app staging finished without public/listen/index.html.");
}
console.log("Staged yuansays listen in public/listen.");
