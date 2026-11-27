// Deal Scout — the hand-in program for black-friday-deal-finder-01.
//
// The site itself is plain static files in app/ (index.html, one stylesheet
// and four small ES modules, no build step, nothing fetched from the
// network). The screenshots in screenshots/ are real renders of that site.
// This program's only job is to hand those two folders in: it copies them
// into the grader's output directory and writes the dossier the judge reads,
// using the vendored make.fun library, exactly as the competition asks.
//
// It runs twice in the grader and both runs must write the same bytes, so
// it does nothing time-dependent and nothing network-dependent: plain
// copies plus the dossier the library computes from the files themselves.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// The repository root is the folder this file lives in, however the grader
// invokes it — never the process working directory.
const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function handIn() {
  mkdirSync(outputDir, { recursive: true });

  // The whole site, as it stands in the repository.
  cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });

  // The screenshots, when they exist. The dossier builder counts them, so
  // they travel with the site instead of being rebuilt here.
  const shots = join(repoRoot, "screenshots");
  mkdirSync(join(outputDir, "screenshots"), { recursive: true });
  if (existsSync(shots)) {
    cpSync(shots, join(outputDir, "screenshots"), { recursive: true });
  }

  // The judge's view of the entry: screenshots, first-load bytes and the
  // site's source, all computed from the files above. The caps below are
  // the scorer's own: at most 4 screenshots of 256 KiB, app/ at most 993
  // files and 16 MiB, the dossier text at most 160 KiB.
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  });
  writeFileSync(join(outputDir, "dossier.json"), dossier);
}

handIn();
