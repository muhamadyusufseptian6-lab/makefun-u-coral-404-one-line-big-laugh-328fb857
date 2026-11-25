// One Line, Big Laugh — entry program (Node 22, stdlib-only, deterministic).
// Writes exactly one funny line to $MAKEFUN_OUTPUT_DIR/entry.txt.
// No input is read; the line is fixed, so every run is byte-identical.
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoDir = dirname(fileURLToPath(import.meta.url));

const ENTRY =
  "My AI agent asked for a raise, so I gave it a bigger prompt — now it has a union rep and a podcast roasting me.";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), ENTRY, "utf8");

// Keep repoDir referenced so the entry stays anchored to its own location.
void repoDir;
