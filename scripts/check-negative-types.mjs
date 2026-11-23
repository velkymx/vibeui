import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

// The positive template fixture only proves the slots are strict enough to
// accept correct usage. A regression to permissive slot types (back to a union
// with an index signature, `any`, or deleting the mapped members) would still
// compile every line there. This gate compiles a fixture that MUST fail and
// asserts the diagnostics, so "too loose" also fails.

const FIXTURE = 'tests/types/negative/datatable-slots.vue'

function fail(message, output = '') {
  console.error(`negative type gate failed: ${message}`)
  if (output) console.error(output)
  process.exit(1)
}

function run(args) {
  const result = spawnSync('npx', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  })
  // spawnSync reports launch failures through `error` and signals through
  // `signal`; neither means vue-tsc diagnosed anything. Surface them instead of
  // folding them into a status, so an environment failure cannot be reported as
  // a type regression.
  if (result.error) fail(`vue-tsc could not be executed: ${result.error.message}`)
  if (result.signal) fail(`vue-tsc was terminated by signal ${result.signal}`)
  return {
    code: result.status ?? 1,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`
  }
}

// 1. The positive fixture must be part of the positive program. If a config
//    edit drops it, test:types would stay green while checking nothing.
const listed = run(['vue-tsc', '--noEmit', '--listFiles', '-p', 'tsconfig.types.json'])
if (listed.code !== 0) fail('the positive type config does not compile', listed.output)
if (!listed.output.includes('tests/types/datatable-slots.vue')) {
  fail('tests/types/datatable-slots.vue is not in tsconfig.types.json — the slot gate is disabled')
}

// 2. The negative fixture must fail, and every case must still be diagnosed.
const negative = run([
  'vue-tsc',
  '--noEmit',
  '--pretty',
  'false',
  '-p',
  'tsconfig.types.negative.json'
])
if (negative.code === 0) {
  fail('the negative fixture compiled cleanly — the slot types are permissive again')
}

const errorLines = negative.output.split('\n').filter((line) => / error TS\d+/.test(line))
const foreign = errorLines.filter((line) => !line.startsWith(FIXTURE))
if (foreign.length > 0) fail(`unexpected diagnostics outside ${FIXTURE}`, foreign.join('\n'))

// Per case (rather than one global multiset): a TypeScript upgrade may split,
// merge or reorder a diagnostic, and the gate should still say which case broke
// instead of failing on a count. Cases are located by their source line so the
// assertion does not depend on diagnostic wording.
const sourceLines = readFileSync(FIXTURE, 'utf8').split('\n')
const lineOf = (needle) => {
  const index = sourceLines.findIndex((line) => line.includes(needle))
  if (index === -1) fail(`${FIXTURE} no longer contains ${needle}`)
  return index + 1
}
// Each case must produce at least one diagnostic on its own line with one of the
// codes we rely on. The annotated binding yields two diagnostics (annotation
// mismatch, body use), so either code keeps the case covered.
const EXPECTED_CASES = [
  { label: '#cell(name) annotated binding', line: lineOf('#cell(name)'), codes: ['TS2345', 'TS2551'] },
  { label: '#cell(id) footer-only prop', line: lineOf('#cell(id)'), codes: ['TS2339'] },
  { label: '#footer(name) cell-only prop', line: lineOf('#footer(name)'), codes: ['TS2339'] },
  { label: '#bogus(x) unknown slot', line: lineOf('#bogus(x)'), codes: ['TS2339'] }
]
const diagnosticPattern = /^.*?\((\d+),\d+\): error (TS\d+)/
const diagnostics = errorLines
  .map((line) => diagnosticPattern.exec(line))
  .filter((match) => match !== null)
  .map((match) => ({ line: Number(match[1]), code: match[2] }))

const missing = EXPECTED_CASES.filter(
  (expected) =>
    !diagnostics.some(
      (diagnostic) => diagnostic.line === expected.line && expected.codes.includes(diagnostic.code)
    )
)
if (missing.length > 0) {
  fail(`no expected diagnostic for: ${missing.map((expected) => expected.label).join(', ')}`, negative.output)
}

console.log('negative type assertions ok')
