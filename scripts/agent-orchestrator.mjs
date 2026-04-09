import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const STAGES = [
  { id: 'plan', role: 'planner' },
  { id: 'implement', role: 'implementer' },
  { id: 'review', role: 'reviewer' },
  { id: 'qa', role: 'tester' },
];

const scriptDir = dirname(fileURLToPath(import.meta.url));
const kitRoot = resolve(scriptDir, '..');
const runsRoot = resolve(kitRoot, 'runs');
const rulesRoot = resolve(kitRoot, 'rules');

const args = process.argv.slice(2);
const command = args[0] ?? 'help';

const getFlag = (name) => {
  const idx = args.indexOf(name);
  return idx === -1 ? undefined : args[idx + 1];
};

const nowIso = () => new Date().toISOString();

const writeJson = (filePath, value) =>
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');

const readJson = (filePath) => JSON.parse(readFileSync(filePath, 'utf8'));

const assert = (condition, message) => {
  if (!condition) {
    console.error(`Error: ${message}`);
    process.exit(1);
  }
};

const defaultRunId = (taskFile) => {
  const stem = basename(taskFile, extname(taskFile))
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .slice(0, 40);
  return `${stem || 'task'}-${Date.now()}`;
};

const runDir = (runId) => resolve(runsRoot, runId);
const statusPath = (runId) => resolve(runsRoot, runId, 'status.json');

const loadStatus = (runId) => {
  const path = statusPath(runId);
  assert(existsSync(path), `Run "${runId}" not found at ${path}`);
  return readJson(path);
};

const installRules = () => {
  const target = resolve(process.cwd(), '.cursor', 'rules');
  mkdirSync(target, { recursive: true });
  const files = readdirSync(rulesRoot).filter((f) => f.endsWith('.mdc'));
  for (const f of files) {
    copyFileSync(resolve(rulesRoot, f), resolve(target, f));
  }
  return { count: files.length, target };
};

// ── Commands ──────────────────────────────────────────────

const taskTemplatePath = resolve(kitRoot, 'team', 'task-template.md');

const cmdBootstrap = () => {
  const taskFileInput = getFlag('--task-file');
  const taskFile = taskFileInput
    ? resolve(process.cwd(), taskFileInput)
    : taskTemplatePath;

  assert(existsSync(taskFile), `Task file not found: ${taskFile}`);

  const runId = getFlag('--run-id') ?? defaultRunId(taskFile);
  const dir = runDir(runId);
  assert(!existsSync(dir), `Run already exists: ${dir}`);

  mkdirSync(join(dir, 'handoffs'), { recursive: true });
  copyFileSync(taskFile, join(dir, 'task.md'));

  const status = {
    runId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    stages: STAGES.map((s, i) => ({
      id: s.id,
      role: s.role,
      status: i === 0 ? 'in_progress' : 'pending',
      completedAt: null,
      verdict: null,
    })),
  };

  writeJson(statusPath(runId), status);

  const rules = installRules();
  const taskPath = join(dir, 'task.md');
  console.log(`Run created:      ${runId}`);
  console.log(`Directory:        ${dir}`);
  console.log(`Task:             ${taskPath}`);
  console.log(`Rules installed:  ${rules.count} → ${rules.target}`);

  if (!taskFileInput) {
    console.log(`\nTask file created from template. Fill it in before running the pipeline:`);
    console.log(`  ${taskPath}`);
  }

  console.log(`\nNext: open a chat and say:`);
  console.log(`  Запусти agent-kit pipeline для ${runId}`);
};

const cmdStatus = () => {
  const runId = getFlag('--run-id');
  assert(runId, 'Missing --run-id <id>');

  const status = loadStatus(runId);
  console.log(`Run:     ${status.runId}`);
  console.log(`Updated: ${status.updatedAt}\n`);

  const icons = { completed: '✓', in_progress: '▸', pending: '·' };
  for (const s of status.stages) {
    const icon = icons[s.status] ?? '?';
    const verdict = s.verdict ? ` (${s.verdict})` : '';
    console.log(`  ${icon} ${s.id.padEnd(12)} ${s.status}${verdict}`);
  }
};

const cmdValidate = () => {
  const runId = getFlag('--run-id');
  assert(runId, 'Missing --run-id <id>');

  const status = loadStatus(runId);
  const dir = runDir(runId);
  const problems = [];

  for (const stage of status.stages) {
    if (stage.status !== 'completed') {
      problems.push(`Stage "${stage.id}" is not completed (${stage.status}).`);
    }
    const artifact = resolve(dir, 'handoffs', `${stage.id}.md`);
    if (!existsSync(artifact)) {
      problems.push(`Missing handoff for "${stage.id}": ${artifact}`);
    }
  }

  const qa = status.stages.find((s) => s.id === 'qa');
  if (qa?.verdict && !['PASS', 'PASS_WITH_RISKS'].includes(qa.verdict)) {
    problems.push(`QA verdict is "${qa.verdict}" — expected PASS or PASS_WITH_RISKS.`);
  }

  if (problems.length) {
    console.log('Validation FAILED:\n');
    for (const p of problems) console.log(`  ✗ ${p}`);
    process.exit(1);
  }

  console.log(`Run "${runId}" passed validation. ✓`);
};

const cmdHelp = () => {
  console.log(`agent-kit CLI

Commands:
  bootstrap  [--task-file <path>] [--run-id <id>]  Create a new pipeline run
  status     --run-id <id>                          Show pipeline state
  validate   --run-id <id>                          Check Definition of Done

If --task-file is omitted, bootstrap copies the default template.

Examples:
  npm run agent:bootstrap -- --run-id TASK-001
  npm run agent:bootstrap -- --task-file my-task.md --run-id TASK-001
  npm run agent:status -- --run-id TASK-001
  npm run agent:validate -- --run-id TASK-001`);
};

// ── Dispatch ──────────────────────────────────────────────

const commands = { bootstrap: cmdBootstrap, status: cmdStatus, validate: cmdValidate, help: cmdHelp, '--help': cmdHelp, '-h': cmdHelp };
const handler = commands[command];

if (!handler) {
  console.error(`Unknown command: ${command}\n`);
  cmdHelp();
  process.exit(1);
}

handler();
