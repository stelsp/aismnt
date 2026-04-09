import { existsSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const kitRoot = resolve(scriptDir, '..');
const sourceRulesDir = resolve(kitRoot, 'rules');
const targetRulesDir = resolve(process.cwd(), '.cursor', 'rules');

if (!existsSync(sourceRulesDir)) {
  console.error(`Rules source directory not found: ${sourceRulesDir}`);
  process.exit(1);
}

mkdirSync(targetRulesDir, { recursive: true });

const rules = readdirSync(sourceRulesDir).filter((file) => file.endsWith('.mdc'));
if (rules.length === 0) {
  console.error(`No .mdc rules found in ${sourceRulesDir}`);
  process.exit(1);
}

for (const fileName of rules) {
  copyFileSync(resolve(sourceRulesDir, fileName), resolve(targetRulesDir, fileName));
}

console.log(`Installed ${rules.length} rule(s) to ${targetRulesDir}`);
for (const fileName of rules) {
  console.log(`- ${fileName}`);
}
