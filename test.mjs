// TDD-lite test for the One Line, Big Laugh entry (run: node test.mjs).
// Each test mirrors a kit requirement; watch it fail before main.ts exists.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = dirname(fileURLToPath(import.meta.url));
let failures = 0;
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures++;
}

// 1. main.ts exists and runs, producing /output/entry.txt
const outDir = mkdtempSync(join(tmpdir(), "one-line-big-laugh-"));
execFileSync("node", ["main.ts"], {
  cwd: repoDir,
  env: { ...process.env, MAKEFUN_OUTPUT_DIR: outDir },
  stdio: "pipe",
});
const entryPath = join(outDir, "entry.txt");
check("main.ts runs and writes entry.txt", existsSync(entryPath));

// 2. Gate: entry is UTF-8 text of 1 to 200 characters, not only whitespace
const text = readFileSync(entryPath, "utf8");
check("entry is 1-200 characters", text.length >= 1 && text.length <= 200, `${text.length} chars`);
check("entry is not only whitespace", text.trim().length > 0);
check("entry is a single line", !text.includes("\n") && !text.includes("\r"));

// 3. Determinism: same input (none) -> same output on a second run
const outDir2 = mkdtempSync(join(tmpdir(), "one-line-big-laugh-"));
execFileSync("node", ["main.ts"], {
  cwd: repoDir,
  env: { ...process.env, MAKEFUN_OUTPUT_DIR: outDir2 },
  stdio: "pipe",
});
check(
  "deterministic: two runs produce identical entry.txt",
  readFileSync(join(outDir2, "entry.txt"), "utf8") === text,
);

// 4. Stdlib-only: main.ts imports only node: builtins (no third-party imports)
const src = readFileSync(join(repoDir, "main.ts"), "utf8");
const imports = [...src.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
check(
  "stdlib-only imports",
  imports.every((i) => i.startsWith("node:")),
  imports.join(", ") || "no imports",
);

// 5. No dotfiles are written to the output dir
const { readdirSync } = await import("node:fs");
check(
  "output dir holds no dotfile",
  readdirSync(outDir).every((f) => !f.startsWith(".")),
);

if (failures > 0) {
  console.error(`${failures} test(s) failed`);
  process.exit(1);
}
console.log("All tests passed.");
